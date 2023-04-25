import React from "react";
import { useRouter } from "next/router";
import projects from "@/mock-data/projects";
import Project from "@/components/Project/Project";

interface Props {
  id: number;
  name: string;
}

const ProjectDetail = () => {
  const router = useRouter();
  const routerId = router.query.id;
  const project = projects.find((project) => project.id == parseInt(routerId));
  console.log(project);

  // return <Project key={project.id} id={project.id} name={project.name} />;
  return (
    <>
      <h1>Project Details</h1>
      <Project key={project.id} id={project.id} name={project.name} />
    </>
  );
};

export default ProjectDetail;
