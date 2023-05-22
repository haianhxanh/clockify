import { Button, TableCell, TableRow } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import * as STATUS from "@/constants/status";

const Task = ({ task }: Props) => {
  return (
    <>
      <TableRow className="single-task">
        <TableCell>{task.name}</TableCell>
        <TableCell>{task.description}</TableCell>
        <TableCell style={{ width: "130px" }}>{task.due_date}</TableCell>
        <TableCell>{task.max_allocated_hours}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            style={{
              backgroundColor: STATUS.TASK[task.status].color,
              color: "#fff",
            }}
          >
            {STATUS.TASK[task.status].label}
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
      </TableRow>
    </>
  );
};

export default Task;
