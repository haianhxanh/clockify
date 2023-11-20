import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Typography } from "@mui/material";
import TimeRecordList from "@/components/TimeRecordList/TimeRecordList";
import * as API from "@/constants/api";
import { SnackbarContext } from "@/context/SnackbarContext";
import * as SNACKBAR from "@/constants/snackbar";
import { GridApi } from "@mui/x-data-grid";
import { DataContext } from "@/context/DataContext";

interface Task {
  id: number;
  description: string;
}

const RecentTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const session = useSession();
  const { records, setRecords, apiTrackingDelete, apiTrackingUpdate } =
    useContext(DataContext);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    // getRecords();
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
      <Typography style={{ marginBlock: "30px" }}>
        You've been working on
      </Typography>
      <TimeRecordList
        records={records}
        apiTrackingDelete={apiTrackingDelete}
        apiTrackingUpdate={apiTrackingUpdate}
        pageSize={pageSize}
        tasks={tasks}
      />
    </>
  );
};

export default RecentTasks;
