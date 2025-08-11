import UIKit
import Capacitor
import Firebase
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        FirebaseApp.configure()

        // Set messaging delegate to self
        Messaging.messaging().delegate = self

        // Request notification permissions
        UNUserNotificationCenter.current().delegate = self

        // Register for remote notifications
        application.registerForRemoteNotifications()

        return true
    }

    // MARK: - Receive APNs device token (and forward to FCM)
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Messaging.messaging().apnsToken = deviceToken
    }

    // MARK: - Handle FCM token update
func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("✅ FCM registration token: \(fcmToken ?? "")")

    guard let token = fcmToken else { return }

    // Create URL
    guard let url = URL(string: "https://thelifesaversbackend.onrender.com/api/notifications/save-token") else {
        print("❌ Invalid URL")
        return
    }

    // Prepare JSON payload
    let payload: [String: Any] = [
        "token": token
    ]

    // Convert payload to JSON data
    guard let jsonData = try? JSONSerialization.data(withJSONObject: payload, options: []) else {
        print("❌ Failed to serialize JSON")
        return
    }

    // Create request
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = jsonData

    // Send request
    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("❌ Failed to send token to backend:", error)
            return
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ Invalid response")
            return
        }

        if httpResponse.statusCode == 200 {
            print("✅ Token sent to backend successfully")
        } else {
            print("❌ Server returned status:", httpResponse.statusCode)
        }
    }

    task.resume()
}


    // MARK: - Handle foreground notification display
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.alert, .badge, .sound])
    }

    // MARK: - Handle user tapping on notification
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        completionHandler()
    }

    // MARK: - URL and Universal Links (keep these for Capacitor)
    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
