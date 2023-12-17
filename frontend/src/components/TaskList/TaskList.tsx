import React, { EventHandler, useContext, useEffect, useState } from "react";
import * as API from "@/constants/api";
import Tasks from "@/pages/tracking/Tracking";
import Task from "../Task/Task";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import * as STATUS from "@/constants/status";
import {
  Box,
  Button,
  Link,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  DataGrid,
  GridActionsCellItem,
  GridCallbackDetails,
  GridCellParams,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModes,
  GridRowModesModel,
  MuiEvent,
} from "@mui/x-data-grid";
import Popover from "@mui/material/Popover";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { DataContext } from "@/context/DataContext";
import { dateToJson } from "@/helpers/Helpers";

interface Task {
  name: string;
  description: string;
  max_allocated_hours: number | null;
  status: string | null;
  due_date: string | null;
  project: number;
}

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

const TaskList = ({ projectId }: { projectId: any }) => {
  // const [tasks, setTasks] = useState<Task[]>([]);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [open, setOpen] = useState(false);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [rows, setRows] = useState<Task[]>([]);
  const [taskId, setTaskId] = useState(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const handleTaskDetailsOpen = () => setTaskDetailsOpen(true);
  const handleTaskDetailsClose = () => setTaskDetailsOpen(false);

  const {
    getTasks,
    tasks,
    apiTaskCreate,
    selectedDate,
    setSelectedDate,
    apiTaskUpdate,
    apiTaskDelete,
    handleOpen,
    handleClose,
    open,
    setOpen,
  } = useContext(DataContext);

  useEffect(() => {
    getTasks(projectId);
  }, []);

  useEffect(() => {
    setRows(tasks);
  }, [tasks]);

  // const apiTaskCreate = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const inputs = new FormData(e.target);
  //   console.log(inputs);

  //   const inputsObject = {};
  //   inputs.forEach((value, name) => {
  //     inputsObject[name] = value;
  //   });

  //   if (selectedDate != null) {
  //     inputsObject["due_date"] = selectedDate.$d.toISOString().split("T")[0];
  //   }

  //   const createTask = async () => {
  //     try {
  //       const response = await fetch(
  //         API.PROJECT_TASKS.replace("[id]", projectId),
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             // Authorization: "Bearer " + String(session.data.user.access),
  //             Authorization: "Bearer " + process.env.ACCESS_TOKEN,
  //           },
  //           body: JSON.stringify(inputsObject),
  //         }
  //       );
  //       const data = await response.json();
  //       setTasks([data, ...tasks]);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   createTask();
  //   handleClose();
  // };

  // const getTasks = async (projectId: number) => {
  //   try {
  //     const response = await fetch(
  //       API.PROJECT_TASKS.replace("[id]", projectId),
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           // Authorization: "Bearer " + String(session.data.user.access),
  //           Authorization: "Bearer " + process.env.ACCESS_TOKEN,
  //         },
  //       }
  //     );
  //     const data = await response.json();
  //     setTasks(data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleEditClick = (id: number) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    setTaskId(id);
  };

  const handleViewClick = (id: number) => () => {
    console.log(id);
  };

  const handleSaveClick = (id: number) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: number) => () => {
    setTaskId(null);

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
    if (taskId != null) {
      newRow.id = taskId;
      newRow.due_date = dateToJson(newRow.due_date);
    }

    const updatedRow = { ...newRow, isNew: false };

    apiTaskUpdate(projectId, newRow.id, newRow);
    setTaskId(null);
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
      apiTaskDelete(projectId, params.id);
    }
  };

  const TaskUrl = ({ params, id }) => {
    return (
      <>
        {/* <VisibilityIcon onClick={handleTaskDetailsOpen}></VisibilityIcon>
        <Task
          open={taskDetailsOpen}
          handleClose={handleTaskDetailsClose}
          params={params}
        /> */}
        <Link href={`/tasks/${id}`}>
          <VisibilityIcon></VisibilityIcon>
        </Link>
      </>
    );
  };

  const Status = ({ params }) => {
    return (
      <Button
        variant="contained"
        style={{
          backgroundColor: params.value
            ? STATUS.TASK[params.value].color
            : STATUS.TASK["TO_DO"].color,
          color: "#fff",
        }}
      >
        {params.value
          ? STATUS.TASK[params.value].label
          : STATUS.TASK["TO_DO"].label}
      </Button>
    );
  };

  return (
    <div>
      <Typography variant="h5" color="initial" style={{ marginBlock: 30 }}>
        Task List{" "}
        <Button onClick={handleOpen} variant="outlined" color="success">
          New Task
        </Button>
      </Typography>

      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={(e) => apiTaskCreate(e, projectId)}>
              <TextField
                fullWidth
                margin="normal"
                required
                id="outlined-required"
                label="Task name"
                placeholder="Task name"
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
                label="Allocated hours"
                type="number"
                name="max_allocated_hours"
                InputLabelProps={{
                  shrink: true,
                }}
                defaultValue={0}
              />
              <DatePicker
                label="Due date"
                renderInput={(params: any) => (
                  <TextField {...params} type="hidden" />
                )}
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
              />
              <TextField
                name="project"
                type="hidden"
                value={projectId}
                style={{ visibility: "hidden" }}
              />
              <TextField
                name="status"
                type="hidden"
                value="TO_DO"
                style={{ visibility: "hidden" }}
              />
              <Box>
                <Button type="submit" variant="outlined" color="success">
                  Add
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>
      </div>

      {/* <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1200 }} size="medium" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Allocated Hrs</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => {
              const {
                id,
                name,
                description,
                status,
                max_allocated_hours,
                due_date,
              } = task;
              return (
                <>
                  <Task task={task} key={id} />
                </>
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
        rows={tasks}
        rowModesModel={rowModesModel}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        columns={[
          {
            field: "name",
            headerName: "Task Name",
            type: "string",
            editable: true,
            align: "left",
            width: 200,
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
            field: "due_date",
            headerName: "Due Date",
            type: "date",
            align: "left",
            headerAlign: "left",
            width: 150,
            editable: true,
            valueGetter: ({ value }) => value && new Date(value),
          },
          {
            field: "max_allocated_hours",
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
            type: "actions",
            editable: true,
            align: "left",
            headerAlign: "left",
            width: 200,
            getActions: (params) => [<Status params={params} />],
          },
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
                    // eslint-disable-next-line react/jsx-no-undef
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
                    <PopupState variant="popover" popupId="demo-popup-popover">
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
            field: "details",
            type: "actions",
            headerName: "Details",
            width: 100,
            align: "center",
            cellClassName: "actions",
            getActions: (params) => [
              <TaskUrl id={params.row.id} params={params} />,
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

export default TaskList;
