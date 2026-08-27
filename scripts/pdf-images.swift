// Pulls the embedded images out of a PDF at their native resolution.
//
// The clinic sends clinical photography as PDFs — a phone or a Mac wraps a
// camera roll one-photo-per-page and mails that. Rendering those pages would
// resample somebody else's resampling, so this reaches past the page and takes
// the image object itself: whatever pixels were embedded, unchanged.
//
// macOS only, and deliberately so — media.sh already depends on `sips`. Swift
// ships with the Command Line Tools, which anyone building this on a Mac has.
//
//   swift scripts/pdf-images.swift <file.pdf> <outdir> <prefix>
//
// Writes <outdir>/<prefix>-pNN.png, one per page, and prints each with its
// dimensions. Pages holding no image are skipped silently.
//
// Two encodings turn up in practice. A DCT-encoded image is a JPEG file lying
// inside the PDF and is handed straight to ImageIO. A Flate-encoded one has
// already been un-zipped by CGPDFStreamCopyData into bare samples with no
// header at all, so the geometry has to be read out of the image dictionary and
// a CGImage built around the buffer by hand — that is what the second half of
// `emit` does. The clinic's exports are the second kind, 16 bits per component.

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let argv = CommandLine.arguments
guard argv.count == 4 else {
    FileHandle.standardError.write("usage: pdf-images <file.pdf> <outdir> <prefix>\n".data(using: .utf8)!)
    exit(2)
}
let (pdfPath, outPath, prefix) = (argv[1], argv[2], argv[3])

guard let doc = CGPDFDocument(URL(fileURLWithPath: pdfPath) as CFURL) else {
    FileHandle.standardError.write("cannot open \(pdfPath)\n".data(using: .utf8)!)
    exit(1)
}
let outDir = URL(fileURLWithPath: outPath)
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

func int(_ d: CGPDFDictionaryRef, _ key: String) -> Int? {
    var v: CGPDFInteger = 0
    return CGPDFDictionaryGetInteger(d, key, &v) ? Int(v) : nil
}

/// The colour space, reduced to the three device families a raw buffer can be
/// wrapped in. An ICCBased space is described by its component count, so the
/// profile itself is not needed to know the buffer's shape.
func components(_ d: CGPDFDictionaryRef) -> Int {
    var name: UnsafePointer<Int8>?
    if CGPDFDictionaryGetName(d, "ColorSpace", &name), let n = name {
        switch String(cString: n) {
        case "DeviceGray", "CalGray": return 1
        case "DeviceCMYK": return 4
        default: return 3
        }
    }
    var arr: CGPDFArrayRef?
    if CGPDFDictionaryGetArray(d, "ColorSpace", &arr), let a = arr {
        var fam: UnsafePointer<Int8>?
        if CGPDFArrayGetName(a, 0, &fam), let f = fam, String(cString: f) == "ICCBased" {
            var st: CGPDFStreamRef?
            if CGPDFArrayGetStream(a, 1, &st), let s = st,
               let sd = CGPDFStreamGetDictionary(s), let n = int(sd, "N") { return n }
        }
    }
    return 3
}

func write(_ image: CGImage, _ name: String) {
    let url = outDir.appendingPathComponent(name)
    guard let dest = CGImageDestinationCreateWithURL(
        url as CFURL, UTType.png.identifier as CFString, 1, nil) else { return }
    CGImageDestinationAddImage(dest, image, nil)
    CGImageDestinationFinalize(dest)
    print("\(name)\t\(image.width)x\(image.height)")
}

func emit(_ stream: CGPDFStreamRef, page: Int) {
    guard let dict = CGPDFStreamGetDictionary(stream) else { return }
    var format = CGPDFDataFormat.raw
    guard let data = CGPDFStreamCopyData(stream, &format) as Data? else { return }
    let name = String(format: "%@-p%02d.png", prefix, page)

    if format != .raw {                       // already a JPEG / JPEG 2000 file
        if let src = CGImageSourceCreateWithData(data as CFData, nil),
           let img = CGImageSourceCreateImageAtIndex(src, 0, nil) { write(img, name) }
        return
    }

    guard let w = int(dict, "Width"), let h = int(dict, "Height"), w > 0, h > 0 else { return }
    let bpc = int(dict, "BitsPerComponent") ?? 8
    let comps = components(dict)
    let bpp = bpc * comps
    let stride = (w * bpp + 7) / 8
    guard data.count >= stride * h else {
        FileHandle.standardError.write("page \(page): short buffer\n".data(using: .utf8)!)
        return
    }
    let space = comps == 1 ? CGColorSpaceCreateDeviceGray()
              : comps == 4 ? CGColorSpaceCreateDeviceCMYK()
              : CGColorSpaceCreateDeviceRGB()
    guard let provider = CGDataProvider(data: data as CFData),
          let img = CGImage(width: w, height: h,
                            bitsPerComponent: bpc, bitsPerPixel: bpp, bytesPerRow: stride,
                            space: space,
                            bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.none.rawValue),
                            provider: provider, decode: nil,
                            shouldInterpolate: false, intent: .defaultIntent) else {
        FileHandle.standardError.write("page \(page): cannot wrap buffer\n".data(using: .utf8)!)
        return
    }
    write(img, name)
}

for p in 1...doc.numberOfPages {
    guard let page = doc.page(at: p), let pd = page.dictionary else { continue }
    var res: CGPDFDictionaryRef?
    guard CGPDFDictionaryGetDictionary(pd, "Resources", &res), let r = res else { continue }
    var xobjects: CGPDFDictionaryRef?
    guard CGPDFDictionaryGetDictionary(r, "XObject", &xobjects), let xo = xobjects else { continue }
    var done = false
    CGPDFDictionaryApplyBlock(xo, { _, object, _ in
        if done { return true }
        var stream: CGPDFStreamRef?
        guard CGPDFObjectGetValue(object, .stream, &stream), let s = stream,
              let sd = CGPDFStreamGetDictionary(s) else { return true }
        var subtype: UnsafePointer<Int8>?
        guard CGPDFDictionaryGetName(sd, "Subtype", &subtype), let st = subtype,
              String(cString: st) == "Image" else { return true }
        emit(s, page: p)
        done = true          // one photograph per page; ignore any decoration
        return true
    }, nil)
}
