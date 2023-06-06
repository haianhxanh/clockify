import React, { useEffect, useState } from "react";
import * as API from "@/constants/api";
import Tasks from "@/pages/tracking/Tracking";
import Task from "../Task/Task";
import {
  Box,
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface Task {
  name: string;
  description: string;
  max_allocated_hours: number | null;
  status: string | null;
  due_date: string | null;
  project: number;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  color: "white",
};

const TaskList = ({ projectId }: { projectId: any }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    getTasks(projectId);
  }, []);

  const apiTaskCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputs = new FormData(e.target);
    console.log(inputs);

    const inputsObject = {};
    inputs.forEach((value, name) => {
      inputsObject[name] = value;
    });

    if (selectedDate != null) {
      inputsObject["due_date"] = selectedDate.$d.toISOString().split("T")[0];
    }

    const createTask = async () => {
      try {
        const response = await fetch(
          API.PROJECT_TASKS.replace("[id]", projectId),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Authorization: "Bearer " + String(session.data.user.access),
              Authorization: "Bearer " + process.env.ACCESS_TOKEN,
            },
            body: JSON.stringify(inputsObject),
          }
        );
        const data = await response.json();
        setTasks([data, ...tasks]);
      } catch (error) {
        console.log(error);
      }
    };
    createTask();
    handleClose();
  };

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
      <Typography variant="h5" color="initial" style={{ marginBlock: 30 }}>
        Task List{" "}
        <Button onClick={handleOpen} variant="outlined" color="success">
          New Task
        </Button>
      </Typography>

      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={(e) => apiTaskCreate(e)}>
              <TextField
                fullWidth
                margin="normal"
                required
                id="outlined-required"
                label="Task name"
                placeholder="Task name"
                name="name"
              />
              <TextField
                fullWidth
                margin="normal"
                required
                id="outlined-required"
                label="Description"
                placeholder="Description"
                name="description"
              />
              <TextField
                fullWidth
                margin="normal"
                id="outlined-number"
                label="Allocated hours"
                type="number"
                name="max_allocated_hours"
                InputLabelProps={{
                  shrink: true,
                }}
                defaultValue={0}
              />
              <DatePicker
                label="Due date"
                renderInput={(params: any) => (
                  <TextField {...params} type="hidden" />
                )}
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
              />
              <TextField
                name="project"
                type="hidden"
                value={projectId}
                style={{ visibility: "hidden" }}
              />
              <TextField
                name="status"
                type="hidden"
                value="TO_DO"
                style={{ visibility: "hidden" }}
              />
              <Box>
                <Button type="submit" variant="outlined" color="success">
                  Add
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>
      </div>

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
                id,
                name,
                description,
                status,
                max_allocated_hours,
                due_date,
              } = task;
              return (
                <>
                  <Task task={task} key={id} />
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
