import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaBell, FaRegBell, FaTimes } from "react-icons/fa";
import { MdClearAll } from "react-icons/md";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import toast from "react-hot-toast";
// import { requestForToken, onMessageListener } from "../../services/firebase";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

// Initialize socket connection
const socket = io("https://thelifesaversbackend.onrender.com/");

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  isRemoved: boolean;
}

const Notification: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [startTouch, setStartTouch] = useState(0);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      // Native (Android/iOS) Push Setup
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', async (token) => {
        console.log('FCM Token (native):', token.value);
      
        try {
          await fetch("https://thelifesaversbackend.onrender.com/api/notifications/save-token", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: token.value, // ✅ only sending token
            }),
          });
          console.log("✅ Native token sent to backend");
        } catch (err) {
          console.error("❌ Failed to send token to backend:", err);
        }
      });
      

      PushNotifications.addListener('registrationError', (err) => {
        console.error('Native push registration error:', err);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received (native):', notification);
        const msg = notification.body ?? notification.title ?? "New notification!";
        handleNotification(msg);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push tapped (native):', notification);
      });
    } else {
          // Only dynamically import web-push logic in web environment
    import('../../services/firebase-web-push').then(({ requestForToken, onMessageListener }) => {
      requestForToken();

      onMessageListener().then((payload: any) => {
        console.log("Web push received:", payload);
        const { title, body } = payload.notification;
        alert(`${title} - ${body}`);
        handleNotification(body || title);
      });

      if (window.Notification && window.Notification.permission !== "granted") {
        window.Notification.requestPermission();
      }
    }).catch(err => {
      console.error("❌ Failed to load web push module:", err);
    });
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
    setNotifications(stored);
    const unread = stored.filter((n: Notification) => !n.isRead && !n.isRemoved);
    setUnreadCount(unread.length);
  }, []);

  const handleNotification = useCallback((message: string) => {
    const newNotification = {
      id: Date.now(),
      message,
      isRead: false,
      isRemoved: false,
    };
    updateNotifications(newNotification);

    if (!isNative && window.Notification?.permission === "granted") {
      new window.Notification("New Notification", {
        body: message,
        icon: "https://your-icon-url.com/icon.png",
      });
    }
  }, [isNative]);

  const handleReceiveMessage = useCallback(() => {
    const message = "A new message in the community awaits you!";
    handleNotification(message);
  }, [handleNotification]);

  useEffect(() => {
    socket.on("notification", handleNotification);
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [handleNotification, handleReceiveMessage]);

  const updateNotifications = useCallback((newNotification: Notification) => {
    setNotifications((prev) => {
      const isDuplicate =
        newNotification.message === "A new message in the community awaits you!" &&
        prev.some((notif) => notif.message === newNotification.message);
      if (isDuplicate) return prev;

      const updated = [...prev, newNotification];
      const unread = updated.filter((n) => !n.isRead && !n.isRemoved).length;
      setUnreadCount(unread);
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAsReadAndRemove = useCallback((id: number) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, isRead: true, isRemoved: true } : n
      );
      const unread = updated.filter((n) => !n.isRead && !n.isRemoved).length;
      setUnreadCount(unread);
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleNotificationClick = useCallback(
    (id: number, message: string) => {
      if (message.startsWith("Admin:")) {
        markAsReadAndRemove(id);
        return;
      }

      if (!isAuthenticated) {
        toast.error("Please log in to see the message.");
        return;
      }
      markAsReadAndRemove(id);
      setIsNotificationPanelOpen(false);
      navigate("/community");
    },
    [isAuthenticated, markAsReadAndRemove, navigate]
  );

  const handleRemoveClick = useCallback(
    (id: number, event: React.MouseEvent) => {
      event.stopPropagation();
      markAsReadAndRemove(id);
    },
    [markAsReadAndRemove]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartTouch(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0].clientY - startTouch > 100) {
      setIsNotificationPanelOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setIsNotificationPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotificationPanel = () => setIsNotificationPanelOpen((prev) => !prev);

  return (
    <div className="left-0">
      <div className="relative cursor-pointer" onClick={toggleNotificationPanel}>
        <FaBell size={26} className="text-gray-800" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 text-[15px] bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>

      <div
        ref={notificationPanelRef}
        className={`fixed bottom-0 left-0 right-0 bg-white z-50 transition-transform duration-500 ease-in-out rounded-2xl ${
          isNotificationPanelOpen ? "translate-y-0 shadow-2xl" : "translate-y-full shadow-none"
        }`}
        style={{ height: "60vh", borderTop: "1px solid #f0f0f0" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-8 px-6 rounded-t-3xl relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 mt-4 sm:mt-0 text-center w-full">Notifications</h2>
          <button
            onClick={() => {
              setNotifications([]);
              setUnreadCount(0);
              localStorage.setItem("notifications", JSON.stringify([]));
            }}
            className="text-white transition duration-300 absolute right-6 top-1/2 transform -translate-y-1/2"
          >
            <MdClearAll size={34} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(70vh-100px)]">
          {notifications.filter((notif) => !notif.isRemoved).length > 0 ? (
            notifications.map(
              (notif) =>
                !notif.isRemoved && (
                  <div
                    key={notif.id}
                    className="relative w-full md:w-3/4 mx-auto px-4 py-3 text-black bg-white rounded-lg shadow-md hover:shadow-xl hover:bg-red-600 hover:text-white transition-all duration-300 mb-4 flex items-center cursor-pointer"
                    onClick={() => handleNotificationClick(notif.id, notif.message)}
                  >
                    <FaRegBell className="mr-3 text-xl" />
                    <span className="flex-1">{notif.message}</span>
                    <button
                      className="absolute top-2 right-2 p-2 rounded-full text-black hover:bg-red-600 hover:text-white transition duration-300"
                      aria-label="Remove Notification"
                      onClick={(event) => handleRemoveClick(notif.id, event)}
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                )
            )
          ) : (
            <p className="text-center text-gray-500">No new notifications</p>
          )}
        </div>

        <button
          onClick={toggleNotificationPanel}
          className={`absolute left-1/2 transform -translate-x-1/2 p-0 bg-transparent hover:bg-transparent transition ${
            isNotificationPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Toggle Notifications"
          style={{ top: "15px" }}
        >
          <div className="w-28 h-1 bg-white" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
