import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// import projects from "@/mock-data/projects";
import Project from "@/components/Project/Project";
import { useSession } from "next-auth/react";
import * as API from "@/constants/api";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import ProjectDetails from "@/components/Project/ProjectDetails";

interface Project {
  id: number | null;
  name: string;
}

interface User {
  user_email: string;
  user_id: number;
  user_role: string;
}

interface ApiStatus {
  ok: boolean;
  statusText: string;
}

const ProjectDetail = () => {
  const router = useRouter();
  const [project, setProject] = useState<Project>({
    id: null,
    name: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    ok: false,
    statusText: "",
  });
  const session = useSession();

  useEffect(() => {
    const routerId = router.query.id;
    getProject(routerId);
    getProjectUsers(routerId);
  }, [router.query.id]);

  const getProject = async (id: any) => {
    if (id == undefined) {
      return;
    }
    try {
      const response = await fetch(API.PROJECTS + id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setProject((project) => data);
      setApiStatus((apiStatus) => response);
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectUsers = async (id: any) => {
    if (id == undefined) {
      return;
    }
    try {
      const response = await fetch(
        API.PROJECT_USERS.replace("[projectId]", id),
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
      setUsers((users) => data);
      const collaborators = data.filter((user) => user.role != "admin");
      setCollaborators((collaborators) => collaborators);
    } catch (error) {
      console.log(error);
    }
  };

  const apiAddNewProjectUser = async (projectId: any, userId: any) => {
    let body = JSON.stringify({
      user_id: userId,
      role_id: 2,
    });
    try {
      const response = await fetch(
        API.PROJECT_USERS.replace("[projectId]", projectId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
          body,
        }
      );
      const data = await response.json();
      getProjectUsers(projectId);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {apiStatus.ok == true ? (
        <ProjectDetails
          key={project.id}
          project={project}
          users={users}
          apiAddNewProjectUser={apiAddNewProjectUser}
        />
      ) : (
        <ErrorMessage message={apiStatus.statusText} />
      )}
    </>
  );
};

export default ProjectDetail;
