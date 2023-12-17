import TimeRecordList from "@/components/TimeRecordList/TimeRecordList";
import { useSession } from "next-auth/react";
import React, { useContext, useEffect, useState } from "react";
import * as API from "@/constants/api";
import { DataContext } from "@/context/DataContext";

interface Task {
  id: number;
  description: string;
}

const Tasks = () => {
  const {
    records,
    setRecords,
    apiTrackingDelete,
    apiTrackingUpdate,
    snackbar,
  } = useContext(DataContext);
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

  return (
    <>
      <TimeRecordList
        records={records}
        apiTrackingDelete={apiTrackingDelete}
        apiTrackingUpdate={apiTrackingUpdate}
        pageSize={pageSize}
        tasks={tasks}
        snackbar={snackbar}
      />
    </>
  );
};

export default Tasks;
