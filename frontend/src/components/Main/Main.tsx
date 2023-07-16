import React, { createContext, useContext, useEffect, useState } from "react";
import TimeTrackerRecorder from "../TimeTrackerRecorder/TimeTrackerRecorder";
import * as API from "@/constants/api";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Alert, Snackbar } from "@mui/material";
import {
  SnackbarContext,
  SnackbarContextProvider,
} from "@/context/SnackbarContext";
import { GridApi } from "@mui/x-data-grid";
import { DataContext } from "@/context/DataContext";

interface Task {
  id: number;
  name?: string;
  description?: string;
  max_allocated_hours?: number;
  status?: string;
  due_date?: string;
  project?: number;
}

export default function Main({ children, open }: { children: any; open: any }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  // const { snackbar, setSnackbar } = useContext(SnackbarContext);
  const { snackbar, setSnackbar } = useContext(DataContext);
  useEffect(() => {
    getTasks();
  }, []);

  const dataGridUpdate = () => {
    GridApi.forceUpdate();
  };

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
      <main className={open ? "sidebar--open" : "sidebar--closed"}>
        <Snackbar
          autoHideDuration={4000}
          open={snackbar.open}
          onClose={() => setSnackbar({ open: false, status: "success" })}
        >
          <Alert severity={snackbar.status} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimeTrackerRecorder tasks={tasks} />
          {children}
        </LocalizationProvider>
      </main>
    </>
  );
}
