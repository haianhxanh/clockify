"use client";
import React, { useEffect, useState } from "react";
import projects from "@/mock-data/projects";
import Link from "next/link";
import ProjectFilter from "@/components/ProjectFilter/ProjectFilter";
import ProjectList from "@/components/ProjectList/ProjectList";
import { Box, Button, Modal } from "@mui/material";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { getProjects } from "../api/data/projects";
import * as API from "@/constants/api";
import { useRouter } from "next/router";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  color: "white",
};

interface Props {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  hourly_rate: number | null;
  project_users: [] | null;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number>();
  const [filteredProjects, setFilteredProjects] = useState<Props[]>([]);
  const router = useRouter();
  const [paramIds, setParamIds] = useState<number[]>([]);

  useEffect(() => {
    if (router.query.id != undefined) {
      let queryArray = router.query.id.split(",");
      setParamIds(queryArray);
    } else {
      getProjects(API.PROJECTS);
    }
  }, [router]);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const selectedProjectsHandle = (id: number, e: Event) => {
    if (e.target.checked == true) {
      if (paramIds.includes(id.toString())) {
        return;
      }
      setParamIds((paramIds) => [...paramIds, id.toString()]);
    } else {
      setParamIds(paramIds.filter((item) => item !== id.toString()));
    }
  };

  useEffect(() => {
    router.push(
      { query: { ...router.query, id: paramIds.join(",") } },
      undefined,
      {
        shallow: true,
      }
    );

    if (paramIds.length == 0) {
      router.replace(router.pathname, undefined, { shallow: true });
    }

    filterFetch("id", paramIds);
  }, [paramIds]);

  const filterFetch = (paramName: string, paramValue: any) => {
    let filterUrl = `${API.PROJECTS}?${paramName}=${paramValue.join(",")}`;
    getProjects(filterUrl);
  };

  const apiProjectCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputs = new FormData(e.target);
    const inputsObject = {};
    inputs.forEach((value, name) => {
      inputsObject[name] = value;
    });

    const createProject = async () => {
      try {
        const response = await fetch(API.PROJECTS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
          body: JSON.stringify(inputsObject),
        });
        const data = await response.json();
        setProjects([data, ...projects]);
      } catch (error) {
        console.log(error);
      }
    };
    createProject();
    handleClose();
  };

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
      setProjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiProjectDelete = async (id: number) => {
    try {
      const response = await fetch(`${API.PROJECTS}${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      getProjects(API.PROJECTS);
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div>
        <Button onClick={handleOpen} variant="outlined" color="success">
          New Project
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={(e) => apiProjectCreate(e)}>
              <TextField
                fullWidth
                margin="normal"
                required
                id="outlined-required"
                label="Project name"
                placeholder="Project name"
                name="name"
              />
              <TextField
                fullWidth
                margin="normal"
                required
                id="outlined-required"
                label="Description"
                placeholder="Description"
                name="description"
              />
              <TextField
                fullWidth
                margin="normal"
                id="outlined-number"
                label="Hourly rate"
                type="number"
                name="hourly_rate"
                InputLabelProps={{
                  shrink: true,
                }}
                defaultValue={0}
              />
              {/* <TextField
                fullWidth
                margin="normal"
                id="outlined"
                label="Currency"
                placeholder="CZK"
                name="currency"
              /> */}
              <Box>
                <Button type="submit" variant="outlined" color="success">
                  Create
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>
      </div>

      <ProjectFilter
        projects={projects}
        onSelectProject={(id, e) => selectedProjectsHandle(id, e)}
        paramIds={paramIds}
      />

      <ProjectList projects={projects} apiProjectDelete={apiProjectDelete} />
    </div>
  );
};

export default Projects;
