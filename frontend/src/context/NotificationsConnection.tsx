import React, { useContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { DataContext } from "@/context/DataContext";

interface Notification {
  message: string;
  read: boolean;
  type: string;
  user_email: string;
  user_id: number;
}
const NotificationConnection = () => {
  // const [notification, setNotification] = useState<Notification>();
  // const { notifications } = useContext(DataContext);

  // useEffect(() => {
  //   // update the Notification icon
  // }, [notification]);

  // useWebSocket(`ws://localhost:9000/ws/notifications/`, {
  //   onMessage: (e) => {
  //     const message = JSON.parse(e.data);
  //     console.log(message);
  //     setNotification(message);
  //   },
  //   shouldReconnect: (closeEvent) => true,
  // });
  return <></>;
};

export default NotificationConnection;
