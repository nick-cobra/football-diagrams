// First-paint readiness uses the same nonblank threshold and region as
// Compare.swift. This never compares or retries a restored image.
import AppKit
let image = NSBitmapImageRep(data: try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))!
var colours = Set<UInt32>()
for y in (image.pixelsHigh / 10)..<(image.pixelsHigh * 9 / 10) {
    for x in 0..<image.pixelsWide {
        var pixel = [Int](repeating: 0, count: 4)
        image.getPixel(&pixel, atX: x, y: y)
        colours.insert(UInt32(pixel[0]) << 16 | UInt32(pixel[1]) << 8 | UInt32(pixel[2]))
        if colours.count > 40 { exit(0) }
    }
}
exit(2)
