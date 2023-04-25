import React, { useState } from "react";
import projects from "@/mock-data/projects";
import Project from "@/components/Project/Project";
import Link from "next/link";
import ProjectFilter from "@/components/ProjectFilter/ProjectFilter";
import ProjectList from "@/components/ProjectList/ProjectList";

interface Props {
  id: number;
  name: string;
}

const Projects = () => {
  // const [projects, setProjects] = useState([projects]);
  const [selectedProject, setSelectedProject] = useState<number>();
  const [filteredProjects, setFilteredProjects] = useState<Props[]>([]);
  // const visibleProjects = selectedProject
  //   ? projects.filter((project) => project.id == selectedProject)
  //   : projects;

  // console.log(visibleProjects);

  const selectedProjectsHandle = (id: number, e: Event) => {
    if (e.target.checked == true) {
      let project = projects.find((project) => project.id === id);
      let newProject = {
        ...filteredProjects,
        id: project.id,
        name: project.name,
      };
      setFilteredProjects([...filteredProjects, newProject]);
      console.log(filteredProjects);
    } else {
      let newProjects = filteredProjects.filter((project) => project.id != id);
      setFilteredProjects(newProjects);
    }
  };

  return (
    <div>
      {/* <ProjectFilter onSelectProject={(id) => setSelectedProject(id)} /> */}
      <ProjectFilter
        onSelectProject={(id, e) => selectedProjectsHandle(id, e)}
      />
      {/* {projects.map((project) => {
        const { id, name } = project;
        return (
          <>
            <Link href={`projects/${id}`}>
              <Project key={id} id={id} name={name} />
            </Link>
          </>
        );
      })} */}
      {filteredProjects.length > 0 ? (
        <ProjectList key={selectedProject} projects={filteredProjects} />
      ) : (
        <ProjectList key={selectedProject} projects={projects} />
      )}
    </div>
  );
};

export default Projects;
