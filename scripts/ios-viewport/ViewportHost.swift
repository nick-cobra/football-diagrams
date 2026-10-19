import UIKit
import FootballDiagramsDemo

@main
class ViewportApp: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(name: "Default", sessionRole: session.role)
        configuration.delegateClass = ViewportScene.self
        return configuration
    }
}
class ViewportScene: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    var records: [[String: Any]] = []
    let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    func save(_ record: [String: Any]) {
        records.append(record)
        try! JSONSerialization.data(withJSONObject: records, options: [.sortedKeys, .prettyPrinted])
            .write(to: directory.appendingPathComponent("viewport.json"), options: .atomic)
    }
    func capture(_ controller: UIViewController) -> (Data, Data) {
        let image = UIGraphicsImageRenderer(size: controller.view.bounds.size).image { _ in
            controller.view.drawHierarchy(in: controller.view.bounds, afterScreenUpdates: true)
        }
        return (image.cgImage!.dataProvider!.data! as Data, image.pngData()!)
    }
    func run(_ mode: Int) {
        if mode == 4 { save(["complete": true, "cases": 4]); return }
        save(["mode": mode, "phase": "initial-zero"])
        let regression = ViewportRegression(mode: Int32(mode), width: 0, height: 0)
        let controller = regression.controller()
        controller.view.backgroundColor = .white
        window?.rootViewController = controller
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            regression.resize(width: 320, height: 320)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                let before = self.capture(controller)
                guard Set(before.0).count > 5 else { self.save(["error": "Blank baseline", "mode": mode]); return }
                try! before.1.write(to: self.directory.appendingPathComponent("before-\(mode).png"))
                let sizes = [(0,0), (1,0), (0,1), (320,1), (1,320), (320,320)]
                func resize(_ step: Int) {
                    if step == sizes.count {
                        let after = self.capture(controller)
                        try! after.1.write(to: self.directory.appendingPathComponent("after-\(mode).png"))
                        guard before.0 == after.0 else { self.save(["error": "Restored pixels differ", "mode": mode]); return }
                        self.save(["mode": mode, "restoredPixelsMatch": true])
                        self.run(mode + 1)
                        return
                    }
                    let size = sizes[step]
                    self.save(["mode": mode, "width": size.0, "height": size.1])
                    regression.resize(width: Int32(size.0), height: Int32(size.1))
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { resize(step + 1) }
                }
                resize(0)
            }
        }
    }
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
        guard let scene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: scene)
        window?.rootViewController = UIViewController()
        window?.makeKeyAndVisible()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { self.run(0) }
    }
}
