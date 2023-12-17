import {
  Box,
  Button,
  Modal,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import * as STATUS from "@/constants/status";

const Task = ({ task, open, handleClose, params }: Props) => {
  return (
    <>
      {/* <TableRow className="single-task">
        <TableCell>{task.name}</TableCell>
        <TableCell>{task.description}</TableCell>
        <TableCell style={{ width: "130px" }}>{task.due_date}</TableCell>
        <TableCell>{task.max_allocated_hours}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            style={{
              backgroundColor: task.status
                ? STATUS.TASK[task.status].color
                : STATUS.TASK["TO_DO"].color,
              color: "#fff",
            }}
          >
            {task.status
              ? STATUS.TASK[task.status].label
              : STATUS.TASK["TO_DO"].label}
          </Button>
        </TableCell>
        <TableCell>
          <Button
            color="error"
            variant="outlined"
            // onClick={() => ()}
          >
            <DeleteIcon></DeleteIcon>
          </Button>
        </TableCell>
      </TableRow> */}
      {/* 
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>{params.row.description}</Box>
      </Modal> */}
      <Typography variant="h5" color="initial">
        Task
      </Typography>
      {task.description}
    </>
  );
};

export default Task;
