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
    func awaitCapture(_ phase: String, mode: Int, then: @escaping () -> Void) {
        let acknowledgement = directory.appendingPathComponent("capture-\(mode)-\(phase).ack")
        save(["mode": mode, "capture": phase])
        func poll() {
            if FileManager.default.fileExists(atPath: acknowledgement.path) { then() }
            else { DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { poll() } }
        }
        poll()
    }
    func run(_ mode: Int) {
        if mode == 6 { save(["complete": true, "cases": 6]); return }
        save(["mode": mode, "phase": "initial-zero"])
        let regression = ViewportRegression(mode: Int32(mode), width: 0, height: 0)
        let controller = regression.controller()
        controller.view.backgroundColor = .white
        window?.rootViewController = controller
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            regression.resize(width: 320, height: 320)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                let sizes = [(0,0), (1,0), (0,1), (320,1), (1,320), (320,320)]
                func resize(_ step: Int) {
                    if step == sizes.count {
                        self.awaitCapture("after", mode: mode) { self.run(mode + 1) }
                        return
                    }
                    let size = sizes[step]
                    self.save(["mode": mode, "width": size.0, "height": size.1])
                    regression.resize(width: Int32(size.0), height: Int32(size.1))
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { resize(step + 1) }
                }
                self.awaitCapture("before", mode: mode) { resize(0) }
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
