import { Box, Grid, Typography, Item, Button, Container } from "@mui/material";
import React from "react";
const commonStyles = {
  bgcolor: "background.paper",
  borderColor: "text.primary",
  m: 1,
  border: 1,
  padding: "1rem",
};

import * as STATUS from "@/constants/status";
import TaskList from "../TaskList/TaskList";

const ProjectDetails = ({ project }: Project) => {
  return (
    <>
      <Container
        style={{
          padding: "1rem 0",
          minWidth: "100%",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="h4" color="initial">
              {project.name}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            {project.status ? (
              <Button
                variant="contained"
                style={{
                  backgroundColor: STATUS.PROJECT[project.status].color,
                  color: "#fff",
                }}
              >
                {STATUS.PROJECT[project.status].label}
              </Button>
            ) : (
              <Button
                variant="contained"
                style={{
                  backgroundColor: STATUS.PROJECT["CREATED"].color,
                  color: "#fff",
                }}
              >
                {STATUS.PROJECT["CREATED"].label}
              </Button>
            )}
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="outlined"
              style={{
                borderColor: "#fff",
                color: "#fff",
              }}
            >
              Allocation: {project.total_allocated_hours} hrs
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="outlined"
              style={{
                borderColor: "#fff",
                color: "#fff",
              }}
            >
              Progress: {project.tracked_hours}/{project.total_allocated_hours}{" "}
              hrs
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Box
        sx={{ ...commonStyles, borderRadius: "4px" }}
        style={{ marginBlock: "16px", marginInline: "0px" }}
      >
        {project.description}
      </Box>
      <TaskList projectId={project.id} key={project.id} />
    </>
  );
};

export default ProjectDetails;