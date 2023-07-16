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

const RecentTasks = () => {
  // const [records, setRecords] = useState<TimeRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const session = useSession();
  // const { snackbar, setSnackbar } = useContext(SnackbarContext);
  const { records, setRecords, apiTrackingDelete, apiTrackingUpdate } = useContext(DataContext);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    // getRecords();
    getTasks();
  }, []);

  const dataGridUpdate = () => {
    GridApi.forceUpdate();
  };

  // const getRecords = async () => {
  //   try {
  //     const response = await fetch(API.RECENT_TRACKING, {
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

  //     if (response.ok) {
  //       setSnackbar({
  //         open: true,
  //         status: SNACKBAR.SNACKBAR_STATUS.SUCCESS,
  //         message: SNACKBAR.SNACKBAR_MESSAGE.DELETED,
  //       });
  //     }

  //     getRecords();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const apiTrackingUpdate = async (id: number, body: any) => {
  //   try {
  //     const response = await fetch(
  //       API.TRACKING_UPDATE.replace("[id]", id.toString()),
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           // Authorization: "Bearer " + String(session.data.user.access),
  //           Authorization: "Bearer " + process.env.ACCESS_TOKEN,
  //         },
  //         body: JSON.stringify(body),
  //       }
  //     );

  //     if (response.ok) {
  //       setSnackbar({
  //         open: true,
  //         status: SNACKBAR.SNACKBAR_STATUS.SUCCESS,
  //         message: SNACKBAR.SNACKBAR_MESSAGE.UPDATED,
  //       });
  //     }

  //     getRecords();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <>
      <Typography style={{ marginBlock: "30px" }}>
        You've been working on
      </Typography>
      <TimeRecordList
        key={records.length}
        records={records}
        apiTrackingDelete={apiTrackingDelete}
        apiTrackingUpdate={apiTrackingUpdate}
        pageSize={pageSize}
        tasks={tasks}
        dataGridUpdate={dataGridUpdate}
      />
    </>
  );
};

export default RecentTasks;
