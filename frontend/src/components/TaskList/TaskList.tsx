import React, { useEffect, useState } from "react";
import * as API from "@/constants/api";
import Tasks from "@/pages/tracking/Tracking";
import Task from "../Task/Task";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

interface Task {
  name: string;
  description: string;
  max_allocated_hours: number | null;
  status: string | null;
  due_date: string | null;
  project: number;
}

const TaskList = ({ projectId }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    getTasks(projectId);
    console.log(tasks);
  }, []);

  const getTasks = async (projectId: number) => {
    try {
      const response = await fetch(
        API.PROJECT_TASKS.replace("[id]", projectId),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
        }
      );
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Typography variant="h5" color="initial">
        Task List
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1200 }} size="medium" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Allocated Hrs</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => {
              const {
                name,
                description,
                status,
                max_allocated_hours,
                due_date,
              } = task;
              return (
                <>
                  <Task task={task} />
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskList;
