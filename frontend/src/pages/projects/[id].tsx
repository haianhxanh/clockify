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
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    ok: false,
    statusText: "",
  });
  const session = useSession();

  useEffect(() => {
    const routerId = router.query.id;
    const getProject = async () => {
      if (routerId == undefined) {
        return;
      }
      try {
        const response = await fetch(API.PROJECTS + routerId, {
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
    getProject();
  }, [router.query.id]);

  // const project = projects.find((project) => project.id == parseInt(routerId));

  return (
    <>
      {apiStatus.ok == true ? (
        <ProjectDetails key={project.id} project={project} />
      ) : (
        <ErrorMessage message={apiStatus.statusText} />
      )}
    </>
  );
};

export default ProjectDetail;
