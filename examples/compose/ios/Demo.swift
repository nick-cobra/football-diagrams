import UIKit
import FootballDiagramsDemo
@main
class DemoApp: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(name: "Default", sessionRole: session.role)
        configuration.delegateClass = SceneDelegate.self
        return configuration
    }
}
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
        guard let scene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: scene)
        let host = UIViewController()
        host.view.backgroundColor = .systemBackground
        let diagram = MainViewControllerKt.mainViewController()
        host.addChild(diagram)
        host.view.addSubview(diagram.view)
        diagram.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            diagram.view.topAnchor.constraint(equalTo: host.view.safeAreaLayoutGuide.topAnchor),
            diagram.view.bottomAnchor.constraint(equalTo: host.view.safeAreaLayoutGuide.bottomAnchor),
            diagram.view.leadingAnchor.constraint(equalTo: host.view.safeAreaLayoutGuide.leadingAnchor),
            diagram.view.trailingAnchor.constraint(equalTo: host.view.safeAreaLayoutGuide.trailingAnchor),
        ])
        diagram.didMove(toParent: host)
        window?.rootViewController = host
        window?.makeKeyAndVisible()
    }
}
