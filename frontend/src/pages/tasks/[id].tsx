import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// import projects from "@/mock-data/projects";
import Project from "@/components/Project/Project";
import { useSession } from "next-auth/react";
import * as API from "@/constants/api";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import ProjectDetails from "@/components/Project/ProjectDetails";
import Task from "@/components/Task/Task";

interface Task {
  id: number | null;
  name: string;
  description: string;
}

interface ApiStatus {
  ok: boolean;
  statusText: string;
}

const TaskDetail = () => {
  const router = useRouter();
  const [task, setTask] = useState<Task>({
    id: null,
    name: "",
    description: "",
  });
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    ok: false,
    statusText: "",
  });
  const session = useSession();

  useEffect(() => {
    const routerId = router.query.id;

    const getTask = async () => {
      if (routerId == undefined) {
        return;
      }
      try {
        const response = await fetch(API.TASKS + routerId, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
        });
        const data = await response.json();
        setTask(data);
        console.log(data);

        // setApiStatus((apiStatus) => response);
      } catch (error) {
        console.log(error);
      }
    };
    getTask();
  }, [router.query.id]);

  // const project = projects.find((project) => project.id == parseInt(routerId));

  return (
    <>
      <Task task={task} />
    </>
  );
};

export default TaskDetail;
