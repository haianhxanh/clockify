import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Project from "../Project/Project";
import { Typography } from "@mui/material";
import ProjectList from "../ProjectList/ProjectList";
import * as API from "@/constants/api";

interface Project {
  id: number;
  name: string;
}

const RecentProjects = ({ recentProjects }: { recentProjects: any }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const session = useSession();

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetch(API.RECENT_PROJECTS, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
        });
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.log(error);
      }
    };
    getProjects();
  }, []);

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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Typography variant="subtitle1" style={{ marginBlock: "30px" }}>
        Recent Projects
      </Typography>
      {/* {projects.length > 0 &&
        projects.map((project) => {
          const { id, name } = project;
          return (
            <>
              <Link href={`projects/${id}`}>
                <Project key={id} id={id} name={name} />
              </Link>
            </>
          );
        })} */}
      <ProjectList key={projects.length} projects={projects} />
    </div>
  );
};

export default RecentProjects;
