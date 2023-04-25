import projects from "@/mock-data/projects";
import { log } from "console";
import React from "react";

interface Props {
  onSelectProject: (id: number) => void;
}

const ProjectFilter = ({ onSelectProject }: Props) => {
  return (
    <div>
      {/* <select
        multiple
        name="project-select"
        id=""
        onChange={(e) =>
          onSelectProject(
            parseInt(
              e.target.options[e.target.selectedIndex].dataset.projectId
            ),
            e
          )
        }
      >
        <option value="">Projects</option>
        {projects.map((project) => {
          const { id, name } = project;
          return (
            <option value={name.toLowerCase()} key={id} data-project-id={id}>
              {name}
            </option>
          );
        })}
      </select> */}

      {projects.map((project) => {
        const { id, name } = project;
        return (
          <>
            <label htmlFor={name.toLowerCase()}>{name}</label>
            <input
              onChange={(e) =>
                onSelectProject(parseInt(e.target.dataset.projectId), e)
              }
              type="checkbox"
              id={name.toLowerCase()}
              key={id}
              data-project-id={id}
              value={name}
            />
          </>
        );
      })}
    </div>
  );
};

export default ProjectFilter;
