import React, { useState } from "react";
// import projects from "@/mock-data/projects";
import Link from "next/link";
import Project from "../Project/Project";

interface Project {
  id: number;
  name: string;
}

interface Props {
  projects: Project[];
}

const ProjectList = ({ projects }: Props) => {
  return (
    <div>
      <option value="">Projects</option>
      {projects.map((project) => {
        const { id, name } = project;
        return (
          <>
            <Link href={`projects/${id}`}>
              <Project key={id} id={id} name={name} />
            </Link>
          </>
        );
      })}
    </div>
  );
};

export default ProjectList;
