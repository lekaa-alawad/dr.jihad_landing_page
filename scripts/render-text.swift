// Renders one line of type to a PNG: white on black, so the luminance is a
// clean alpha channel for the compositor.
//
//   swift scripts/render-text.swift <font.ttf> <size> <tracking-em> <text> <out.png>
//
// CoreText rather than a browser because it shapes and joins Arabic natively
// and needs nothing installed. The canvas is fixed and the baseline sits at a
// fixed row, so two strings rendered the same way share a baseline — which is
// how the compositor carries a measurement taken from a string already on the
// card over to a string that is not.

import Foundation
import CoreText
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
guard a.count == 6, let size = Double(a[2]), let track = Double(a[3]) else {
    print("usage: render-text <font.ttf> <size> <tracking-em> <text> <out.png>"); exit(2)
}
let fontURL = URL(fileURLWithPath: a[1]) as CFURL
let text = a[4]
let outURL = URL(fileURLWithPath: a[5])

var err: Unmanaged<CFError>?
CTFontManagerRegisterFontsForURL(fontURL, .process, &err)
guard let dp = CGDataProvider(url: fontURL), let cg = CGFont(dp) else {
    print("cannot load font"); exit(1)
}
let font = CTFontCreateWithGraphicsFont(cg, size, nil, nil)

// CoreText's own attribute names, not AppKit's — this runs as a script with no
// app framework loaded, and `.font` and friends come from AppKit.
let attrs: [NSAttributedString.Key: Any] = [
    NSAttributedString.Key(kCTFontAttributeName as String): font,
    NSAttributedString.Key(kCTForegroundColorAttributeName as String):
        CGColor(red: 1, green: 1, blue: 1, alpha: 1),
    NSAttributedString.Key(kCTKernAttributeName as String): track * size,
]
let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attrs))

// A canvas with room for any of these strings, and a baseline far enough in
// from the edges that ascenders and descenders both fit.
//
// 6400 rather than the 4200 this started at, which fitted the straplines it was
// written for and nothing longer. A 34-character Arabic line at 300pt advances
// 4323px and ran off the end — and because Arabic lays out right to left, what
// fell off was the START of the string, so the card came out reading "يادة"
// where it should read "عيادة". Silently, which is the worse half. Hence the
// guard below: a line that does not fit is a failed run now, not a card with
// its first letter quietly missing.
let W = 6400, H = 700, BASELINE = 420.0, LEFT = 60.0

// Measured before anything is drawn. CTLineDraw clips to the context and
// reports nothing, so this is the only place an overrun is visible at all.
let advance = CTLineGetTypographicBounds(line, nil, nil, nil)
if LEFT + advance > Double(W) {
    let msg = "render-text: the line advances \(String(format: "%.1f", advance))px from x=\(LEFT), past the \(W)px canvas. It would be clipped - for Arabic, at the START of the string. Raise W in scripts/render-text.swift.\n"
    FileHandle.standardError.write(Data(msg.utf8))
    exit(1)
}

guard let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8,
                          bytesPerRow: W*4, space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    print("cannot make context"); exit(1)
}
ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
ctx.textPosition = CGPoint(x: LEFT, y: Double(H) - BASELINE)
CTLineDraw(line, ctx)

guard let img = ctx.makeImage(),
      let dest = CGImageDestinationCreateWithURL(outURL as CFURL, UTType.png.identifier as CFString, 1, nil)
else { print("cannot write"); exit(1) }
CGImageDestinationAddImage(dest, img, nil)
CGImageDestinationFinalize(dest)
let b = CTLineGetBoundsWithOptions(line, .useOpticalBounds)
print("rendered \(text) — advance \(String(format: "%.1f", CTLineGetTypographicBounds(line, nil, nil, nil))) bounds \(String(format: "%.1f", b.width))x\(String(format: "%.1f", b.height))")
