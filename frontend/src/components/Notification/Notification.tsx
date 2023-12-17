import React, { useContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { DataContext } from "@/context/DataContext";

const Notification = () => {
  const [data, setData] = useState([]);

  // const updatesSocket = new WebSocket(`ws://localhost:9000/`);

  // updatesSocket.onmessage = function (e) {
  //   const data = JSON.parse(e.data);
  //   console.log(data);
  // };

  // updatesSocket.onclose = function (e) {
  //   console.error("Chat socket closed unexpectedly");
  // };

  const { notifications } = useContext(DataContext);

  // useWebSocket(`ws://localhost:9000/ws/notifications/`, {
  //   onMessage: (e) => {
  //     const message = JSON.parse(e.data);
  //     console.log(message);
  //   },
  //   shouldReconnect: (closeEvent) => true,
  // });
  return <></>;
};

export default Notification;
