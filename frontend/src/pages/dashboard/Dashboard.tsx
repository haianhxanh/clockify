import RecentTasks from "@/RecentTasks/RecentTasks";
import RecentProjects from "@/components/RecentProjects/RecentProjects";
import TimeRecord from "@/components/TimeRecord/TimeRecord";
import TimeRecordList from "@/components/TimeRecordList/TimeRecordList";
import TimeTrackerRecorder from "@/components/TimeTrackerRecorder/TimeTrackerRecorder";
import { Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import React from "react";

const Dashboard = () => {
  return (
    <>
      <RecentTasks />
      <RecentProjects />
    </>
  );
};

export default Dashboard;
