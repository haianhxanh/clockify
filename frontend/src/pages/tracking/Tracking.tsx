import TimeRecordList from "@/components/TimeRecordList/TimeRecordList";
import { useSession } from "next-auth/react";
import React, { useContext, useEffect, useState } from "react";
import * as API from "@/constants/api";
import { DataContext } from "@/context/DataContext";

interface TimeRecord {
  id: number;
  description: string;
  start_time: string;
  end_time: string | null;
  task: number | null;
  tracked_hours: number;
  date: string;
}

interface Task {
  id: number;
  description: string;
}

const Tasks = () => {
  // const [records, setRecords] = useState<TimeRecord[]>([]);
  const { records, setRecords, apiTrackingDelete, apiTrackingUpdate } =
    useContext(DataContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const session = useSession();

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    try {
      const response = await fetch(API.TASKS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.log(error);
    }
  };

  // const getRecords = async () => {
  //   try {
  //     const response = await fetch(API.TRACKING, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // Authorization: "Bearer " + String(session.data.user.access),
  //         Authorization: "Bearer " + process.env.ACCESS_TOKEN,
  //       },
  //     });
  //     const data = await response.json();
  //     setRecords(data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const apiTrackingDelete = async (id: number) => {
  //   try {
  //     const response = await fetch(`${API.TRACKING_DELETE}${id}/`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // Authorization: "Bearer " + String(session.data.user.access),
  //         Authorization: "Bearer " + process.env.ACCESS_TOKEN,
  //       },
  //     });

  //     getRecords();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const apiTrackingUpdate = async (id: number) => {
  //   try {
  //     const response = await fetch(
  //       API.TRACKING_UPDATE.replace("[id]", id.toString()),
  //       {
  //         method: "UPDATE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           // Authorization: "Bearer " + String(session.data.user.access),
  //           Authorization: "Bearer " + process.env.ACCESS_TOKEN,
  //         },
  //       }
  //     );

  //     getRecords();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <>
      <TimeRecordList
        key={records.length}
        records={records}
        apiTrackingDelete={apiTrackingDelete}
        apiTrackingUpdate={apiTrackingUpdate}
        pageSize={pageSize}
        tasks={tasks}
      />
    </>
  );
};

export default Tasks;
