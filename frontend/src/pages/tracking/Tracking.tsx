import TimeRecordList from "@/components/TimeRecordList/TimeRecordList";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import * as API from "@/constants/api";

interface TimeRecord {
  id: number;
  description: string;
  start_time: string;
  end_time: string | null;
  task: number | null;
  tracked_hours: number;
  date: string;
}

const Tasks = () => {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const session = useSession();

  useEffect(() => {
    getRecords();
  }, []);

  const getRecords = async () => {
    try {
      const response = await fetch(API.TRACKING, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiTrackingDelete = async (id: number) => {
    try {
      const response = await fetch(`${API.TRACKING_DELETE}${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });

      getRecords();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <TimeRecordList
        key={records.length}
        records={records}
        apiTrackingDelete={apiTrackingDelete}
      />
    </>
  );
};

export default Tasks;
