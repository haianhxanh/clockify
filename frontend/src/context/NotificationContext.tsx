import { ReactNode, createContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import * as API from "@/constants/api";
import { keyframes } from "@emotion/react";
import { log } from "console";

interface NotificationContextProviderProps {
  children: ReactNode;
}

interface Notification {
  type: string;
  user_email: string;
  user_id: number;
  read: boolean | null;
  created_by: string;
  action: string;
}

const NotificationContext = createContext<Notification>({
  type: "",
  user_email: "",
  user_id: 0,
  read: false,
  created_by: "",
  action: "",
});

const NotificationContextProvider = ({
  children,
}: NotificationContextProviderProps) => {
  const [notification, setNotification] = useState<Notification>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(null);
  const [notificationUpdated, setNotificationUpdated] = useState(false);
  const [seenAll, setSeenAll] = useState(false);

  useEffect(() => {
    getNotifications();
  }, []);

  useEffect(() => {
    const unreadNotificationsCount = notifications.filter(
      (notification) => notification.read != true
    ).length;
    setNotificationsCount(unreadNotificationsCount);

    handleSeenAll(notifications);
  }, [notifications]);

  const handleSeenAll = (notifications: any) => {
    let allNotificationsSeen =
      notifications.filter((notification) => notification.read == true)
        .length == 0;
    setSeenAll(allNotificationsSeen);
  };

  useEffect(() => {
    setTimeout(() => {
      setNotificationUpdated(false);
    }, 6000);
  }, [notificationUpdated]);

  const getNotifications = async () => {
    try {
      const response = await fetch(API.NOTIFICATIONS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      let valid_data = data.filter(
        (notification) => notification.target_id != null
      );
      setNotifications(valid_data);
      handleSeenAll(valid_data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateReadStatus = async (id: number, read: boolean) => {
    try {
      const response = await fetch(
        API.NOTIFICATION.replace("[id]", id.toString()),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
          body: JSON.stringify({
            read: read,
          }),
        }
      );
      if (response.ok) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: read }
              : notification
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const markSeenAll = async () => {
    try {
      const response = await fetch(API.NOTIFICATIONS_BULK_EDIT, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
        body: JSON.stringify([
          {
            read: true,
          },
        ]),
      });
      if (response.ok) {
        getNotifications();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useWebSocket(`ws://localhost:9000/ws/notifications/`, {
    onMessage: (e) => {
      const message = JSON.parse(e.data);
      setNotification(message);
      setNotificationUpdated(true);
      getNotifications();
    },
    shouldReconnect: (closeEvent) => true,
  });

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        notification,
        setNotification,
        notificationsCount,
        notificationUpdated,
        updateReadStatus,
        seenAll,
        markSeenAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationContextProvider };
