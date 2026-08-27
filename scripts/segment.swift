// Cuts the subject out of a photograph, writing a straight alpha matte.
//
// Vision ships two ways to do this. VNGenerateForegroundInstanceMaskRequest is
// the newer one and understands "the salient object", whatever it is; the older
// VNGeneratePersonSegmentationRequest only knows people but is the one tuned for
// hair and shoulders, which is the edge that gives a cut-out away. This asks for
// the first and falls back to the second, and prints which it used.
//
//   swift segment.swift <in.jpg> <matte.png>

import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers
import AppKit

let a = CommandLine.arguments
guard a.count == 3 else { print("usage: segment <in> <matte.png>"); exit(2) }
let inURL = URL(fileURLWithPath: a[1])
let outURL = URL(fileURLWithPath: a[2])

guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil),
      let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    print("cannot read image"); exit(1)
}
print("input \(cg.width)x\(cg.height)")

let ctx = CIContext()
let handler = VNImageRequestHandler(cgImage: cg, options: [:])

func write(_ mask: CVPixelBuffer, _ label: String) {
    var ci = CIImage(cvPixelBuffer: mask)
    // The mask comes back at the model's own resolution; stretch it to the frame.
    let sx = CGFloat(cg.width) / ci.extent.width
    let sy = CGFloat(cg.height) / ci.extent.height
    ci = ci.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
    guard let out = ctx.createCGImage(ci, from: CGRect(x: 0, y: 0, width: cg.width, height: cg.height)),
          let dest = CGImageDestinationCreateWithURL(outURL as CFURL, UTType.png.identifier as CFString, 1, nil)
    else { print("cannot write matte"); exit(1) }
    CGImageDestinationAddImage(dest, out, nil)
    CGImageDestinationFinalize(dest)
    print("matte via \(label): \(out.width)x\(out.height)")
}

if #available(macOS 14.0, *) {
    let req = VNGenerateForegroundInstanceMaskRequest()
    do {
        try handler.perform([req])
        if let obs = req.results?.first {
            let buf = try obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: handler)
            write(buf, "foreground-instance")
            exit(0)
        }
        print("foreground request found no instances; falling back")
    } catch { print("foreground request failed: \(error); falling back") }
}

let p = VNGeneratePersonSegmentationRequest()
p.qualityLevel = .accurate
p.outputPixelFormat = kCVPixelFormatType_OneComponent8
try handler.perform([p])
guard let m = (p.results?.first)?.pixelBuffer else { print("no person found"); exit(1) }
write(m, "person-segmentation")
