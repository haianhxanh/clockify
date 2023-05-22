import React, { useState } from "react";
// import projects from "@/mock-data/projects";
import Link from "next/link";
import Project from "../Project/Project";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Button, Modal, Typography } from "@mui/material";
import projects from "@/mock-data/projects";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import Popover from "@mui/material/Popover";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import DeleteIcon from "@mui/icons-material/Delete";

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

interface Project {
  id: number;
  name: string;
}

interface Props {
  projects: Project[];
}

const ProjectList = ({ projects, apiProjectDelete }: Props) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <TableContainer component={Paper} style={{ marginBlock: "20px" }}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableBody>
            {projects.length > 0 &&
              projects.map((project) => {
                const { id, name } = project;
                return (
                  <>
                    <TableRow sx={{ th: { border: 0 } }}>
                      <TableCell scope="row" style={{ width: "40%" }}>
                        <Box>
                          <Project
                            key={project.id}
                            id={project.id}
                            project={project}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Link href={`projects/${id}`}>View</Link>
                      </TableCell>
                      <TableCell>
                        <PopupState
                          variant="popover"
                          popupId="demo-popup-popover"
                        >
                          {(popupState) => (
                            <div>
                              <Button
                                color="error"
                                {...bindTrigger(popupState)}
                              >
                                <DeleteIcon></DeleteIcon>
                              </Button>
                              <Popover
                                {...bindPopover(popupState)}
                                anchorOrigin={{
                                  vertical: "bottom",
                                  horizontal: "center",
                                }}
                                transformOrigin={{
                                  vertical: "top",
                                  horizontal: "center",
                                }}
                              >
                                <Typography sx={{ p: 2 }}>
                                  <Button
                                    color="error"
                                    onClick={() => apiProjectDelete(id)}
                                  >
                                    Yes, delete
                                  </Button>
                                </Typography>
                              </Popover>
                            </div>
                          )}
                        </PopupState>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ProjectList;
