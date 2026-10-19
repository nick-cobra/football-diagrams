// Simulator screenshots include Metal layers; UIKit drawHierarchy does not.
import AppKit
let arguments = CommandLine.arguments
let before = NSBitmapImageRep(data: try Data(contentsOf: URL(fileURLWithPath: arguments[1])))!
let after = NSBitmapImageRep(data: try Data(contentsOf: URL(fileURLWithPath: arguments[2])))!
guard before.pixelsWide == after.pixelsWide, before.pixelsHigh == after.pixelsHigh else { fatalError("Screenshot size changed") }
var colours = Set<UInt32>()
// Exclude system status/home indicators. All diagram content and recovery remain visible.
let top = before.pixelsHigh / 10
let bottom = before.pixelsHigh * 9 / 10
for y in top..<bottom {
    for x in 0..<before.pixelsWide {
        var a = [Int](repeating: 0, count: 4), b = a
        before.getPixel(&a, atX: x, y: y)
        after.getPixel(&b, atX: x, y: y)
        guard a == b else { fatalError("Restored pixels differ at \(x),\(y)") }
        colours.insert(UInt32(a[0]) << 16 | UInt32(a[1]) << 8 | UInt32(a[2]))
    }
}
guard colours.count > 40 else { fatalError("Blank diagram screenshot") }
print("Identical restored pixels (\(colours.count) colours)")
