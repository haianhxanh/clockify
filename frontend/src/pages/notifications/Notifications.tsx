import { NotificationContext } from "@/context/NotificationContext";
import React, { useContext } from "react";

const Notifications = () => {
  const {
    notification,
    notifications,
    notificationsCount,
    notificationUpdated,
  } = useContext(NotificationContext);

  console.log(notifications);

  return <div>{notifications}</div>;
};

export default Notifications;
