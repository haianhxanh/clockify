import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Button } from "@mui/material";
import TimeRecord from "../TimeRecord/TimeRecord";

interface TimeRecord {
  id: number;
  description: string;
  start_time: string;
  end_time: string | null;
  task: number | null;
  tracked_hours: number;
  date: string;
}

interface Props {
  records: TimeRecord[];
}

const TimeRecordList = ({ records, apiTrackingDelete }: Props) => {
  return (
    <>
      <TableContainer component={Paper} style={{ marginBlock: "20px" }}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Task #</TableCell>
              <TableCell>Total time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => {
              const {
                id,
                description,
                start_time,
                end_time,
                task,
                tracked_hours,
              } = record;
              return (
                <>
                  <TableRow sx={{ th: { border: 0 } }}>
                    <TimeRecord
                      key={id}
                      id={id}
                      record={record}
                      apiTrackingDelete={apiTrackingDelete}
                    />
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TimeRecordList;
