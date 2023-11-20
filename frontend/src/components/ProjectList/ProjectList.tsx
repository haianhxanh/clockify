import React, { EventHandler, useContext, useEffect, useState } from "react";
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
import {
  DataGrid,
  GridActionsCellItem,
  GridCallbackDetails,
  GridCellParams,
  GridColDef,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModes,
  GridRowModesModel,
  GridValueGetterParams,
  MuiEvent,
} from "@mui/x-data-grid";
import Popover from "@mui/material/Popover";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { DataContext } from "@/context/DataContext";

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

const ProjectList = () =>
  // { projects, apiProjectDelete }: Props
  {
    // const [open, setOpen] = useState(false);
    // const handleOpen = () => setOpen(true);
    // const handleClose = () => setOpen(false);

    const [rows, setRows] = useState<Project[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [projectId, setProjectId] = useState(null);

    const { apiProjectUpdate, projects, apiProjectDelete } =
      useContext(DataContext);

    useEffect(() => {
      setRows(projects);
    }, [projects]);

    const handleEditClick = (id: number) => () => {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
      setProjectId(id);
    };

    const handleViewClick = (id: number) => () => {
      console.log(id);
    };

    const handleSaveClick = (id: number) => () => {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleCancelClick = (id: number) => () => {
      setProjectId(null);

      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      });

      const editedRow = rows.find((row) => row.id === id);

      if (editedRow!.isNew) {
        setRows(rows.filter((row) => row.id !== id));
      }
    };

    const processRowUpdate = (newRow) => {
      if (projectId != null) {
        newRow.id = projectId;
      }

      const updatedRow = { ...newRow, isNew: false };
      apiProjectUpdate(newRow.id, newRow);
      setProjectId(null);
      return updatedRow;
    };

    const handleProcessRowUpdateError = () => {
      console.log("error when updating tracking");
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (
      params,
      event
    ) => {
      if (params.reason === GridRowEditStopReasons.rowFocusOut) {
        event.defaultMuiPrevented = true;
      }
    };

    const handleOnCellClick: EventHandler = (
      params: GridCellParams,
      event: MuiEvent<React.MouseEvent>,
      details: GridCallbackDetails
    ) => {
      if (params.field == "actions" && event.target.id == "delete") {
        event.stopPropagation();
        apiProjectDelete(params.id);
      }
    };

    const ProjectUrl = ({ params, id }) => {
      return (
        <Link href={`projects/${id}`}>
          <VisibilityIcon></VisibilityIcon>
        </Link>
      );
    };

    return (
      <div>
        {/* <TableContainer component={Paper} style={{ marginBlock: "20px" }}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableBody>
            {projects.length > 0 &&
              projects.map((project) => {
                const { id, name } = project;
                return (
                  <TableRow sx={{ th: { border: 0 } }} key={id}>
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
                            <Button color="error" {...bindTrigger(popupState)}>
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
                );
              })}
          </TableBody>
        </Table>
      </TableContainer> */}

        <DataGrid
          editMode="row"
          rowsLoadingMode="server"
          experimentalFeatures={{
            lazyLoading: true,
          }}
          rows={projects}
          rowModesModel={rowModesModel}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
          columns={[
            {
              field: "name",
              headerName: "Project",
              type: "string",
              editable: true,
              align: "left",
              headerAlign: "left",
            },
            {
              field: "description",
              headerName: "Description",
              type: "string",
              align: "left",
              headerAlign: "left",
              width: 250,
              editable: true,
            },
            {
              field: "total_allocated_hours",
              headerName: "Allocated Hours",
              type: "number",
              editable: true,
              align: "left",
              headerAlign: "left",
            },
            {
              field: "tracked_hours",
              headerName: "Tracked Hours",
              type: "number",
              editable: false,
              align: "left",
              headerAlign: "left",
            },
            {
              field: "status",
              headerName: "Status",
              type: "number",
              editable: false,
              align: "left",
              headerAlign: "left",
              width: 200,
            },
            // {
            //   field: "delete",
            //   type: "actions",
            //   headerName: "Delete",
            //   width: 200,
            //   align: "left",
            //   cellClassName: "actions",
            //   getActions: (params) => [
            //     <Delete id={params.row.task} params={params} />,
            //   ],
            // },
            {
              field: "actions",
              type: "actions",
              headerName: "Actions",
              width: 100,
              cellClassName: "actions",
              getActions: ({ id }) => {
                const isInEditMode =
                  rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                  return [
                    // eslint-disable-next-line react/jsx-key
                    <GridActionsCellItem
                      icon={<SaveIcon />}
                      label="Save"
                      sx={{
                        color: "primary.main",
                      }}
                      onClick={handleSaveClick(id)}
                      id="update"
                    />,
                    <GridActionsCellItem
                      icon={<CancelIcon />}
                      label="Cancel"
                      className="textPrimary"
                      onClick={handleCancelClick(id)}
                      color="inherit"
                    />,
                  ];
                }

                return [
                  <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    className="textPrimary"
                    onClick={handleEditClick(id)}
                    color="inherit"
                  />,
                  <GridActionsCellItem
                    icon={
                      <PopupState
                        variant="popover"
                        popupId="demo-popup-popover"
                      >
                        {(popupState) => (
                          <div>
                            <Button color="error" {...bindTrigger(popupState)}>
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
                                <Button color="error" id="delete">
                                  Yes, delete
                                </Button>
                              </Typography>
                            </Popover>
                          </div>
                        )}
                      </PopupState>
                    }
                    label="Delete"
                    color="inherit"
                  />,
                ];
              },
            },
            {
              field: "task_name",
              type: "actions",
              headerName: "View",
              width: 100,
              align: "center",
              cellClassName: "actions",
              getActions: (params) => [
                <ProjectUrl id={params.row.id} params={params} />,
              ],
            },
          ]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onCellClick={handleOnCellClick}
        />
      </div>
    );
  };

export default ProjectList;
