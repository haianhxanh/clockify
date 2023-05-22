// import projects from "@/mock-data/projects";
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { log } from "console";
import React, { useEffect, useState } from "react";
import * as API from "@/constants/api";

interface Props {
  onSelectProject: (id: number) => void;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  hourly_rate: number | null;
  project_users: [] | null;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ProjectFilter = ({ onSelectProject, paramIds, projects }: Props) => {
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects(API.PROJECTS);
    let arrProjectNames = Array.from(projects, (project) => project.name);
    setProjectNames(arrProjectNames);
  }, [projects]);

  const getProjects = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setAllProjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event) => {
    onSelectProject(event.target.value, event);
  };

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
        {projects.map((project) => {
          const { id, name } = project;
          return (
            <option value={name.toLowerCase()} key={id} data-project-id={id}>
              {name}
            </option>
          );
        })}
      </select> */}

      {/* {projects.length > 0 &&
        projects.map((project) => {
          const { id, name } = project;
          return (
            <>
              <label htmlFor={name.toLowerCase()}>{name}</label>
              <input
                onChange={(e) => handleChange(e)}
                type="checkbox"
                id={name.toLowerCase()}
                key={id}
                data-project-id={id}
                value={name}
              />
            </>
          );
        })} */}

      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-checkbox-label">
          Filter Projects
        </InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={paramIds.length > 0 ? projectNames : []}
          input={<OutlinedInput label="Filter Projects" />}
          renderValue={(projectNames) => projectNames.join(", ")}
          MenuProps={MenuProps}
        >
          {allProjects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              <Checkbox
                value={project.id}
                onChange={(e) => onSelectProject(parseInt(e.target.value), e)}
                checked={paramIds.includes(project.id.toString())}
              />
              <ListItemText primary={project.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ProjectFilter;
