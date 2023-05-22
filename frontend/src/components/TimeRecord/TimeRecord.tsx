import { Button, TableCell } from "@mui/material";
import React, { useState } from "react";
import * as API from "@/constants/api";
import DeleteIcon from "@mui/icons-material/Delete";

// interface TimeRecord {
//   id: number;
//   description: string;
//   start_time: string;
//   end_time: string | null;
//   task: number | null;
//   tracked_hours: number;
// }

const TimeRecord = ({ record, apiTrackingDelete }: Props) => {
  return (
    <>
      <TableCell>{record.id}</TableCell>
      <TableCell>{record.description}</TableCell>
      <TableCell>{record.date}</TableCell>
      <TableCell>{record.start_time}</TableCell>
      <TableCell>{record.end_time}</TableCell>
      <TableCell>{record.task}</TableCell>
      <TableCell>{record.tracked_hours}</TableCell>
      <TableCell>
        <Button color="error" onClick={() => apiTrackingDelete(record.id)}>
          <DeleteIcon></DeleteIcon>
        </Button>
      </TableCell>
    </>
  );
};

export default TimeRecord;
