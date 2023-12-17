import { useSession } from "next-auth/react";
import React, {
  EventHandler,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import TimeRecord from "../TimeRecord/TimeRecord";
import * as API from "@/constants/api";
import {
  DataGrid,
  GridActionsCellItem,
  GridCallbackDetails,
  GridCellParams,
  GridColDef,
  GridRowsProp,
  MuiEvent,
  GridRowModesModel,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModes,
  GridRowModel,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import {
  randomCreatedDate,
  randomId,
  randomTraderName,
  randomUpdatedDate,
} from "@mui/x-data-grid-generator";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { DataContext } from "@/context/DataContext";
import { dateToJson } from "@/helpers/Helpers";

interface TimeRecord {
  id: number;
  description: string;
  start_time: string;
  end_time: string | null;
  task: number | null;
  tracked_hours: number;
  date: string;
}

interface Props {
  records: TimeRecord[];
}

interface Task {
  id: number;
  description: string;
}

const TimeRecordList = ({
  records,
  apiTrackingDelete,
  apiTrackingUpdate,
  pageSize,
  tasks,
}: Props) => {
  const [rows, setRows] = useState<TimeRecord[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [taskId, setTaskId] = useState(null);

  const { projects } = useContext(DataContext);

  useEffect(() => {
    setRows(records);
  }, [records]);

  const handleTrackingUpdate: EventHandler = (e: Event) => {
    apiTrackingUpdate(e.id, e);
  };

  const handleTrackingDelete = (id: number) => () => {};

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: number) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: number) => () => {
    // apiTrackingUpdate(id);

    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: number) => () => {};

  const handleCancelClick = (id: number) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);

    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  // const processRowUpdate = (newRow, oldRow) => {
  //   apiTrackingUpdate(newRow.id, newRow);
  //   setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  // };

  const processRowUpdate = (newRow) => {
    if (taskId != null) {
      newRow.task = taskId;
    }
    newRow.date = dateToJson(newRow.date);
    const updatedRow = { ...newRow, isNew: false };
    apiTrackingUpdate(newRow.id, newRow);
    setTaskId(null);
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleProcessRowUpdateError = () => {
    console.log("error when updating tracking");
  };

  const handleOnCellClick: EventHandler = (
    params: GridCellParams,
    event: MuiEvent<React.MouseEvent>,
    details: GridCallbackDetails
  ) => {
    if (params.field == "actions" && event.target.id == "delete") {
      apiTrackingDelete(params.id);
    }
  };

  const Task = ({ id, params }) => {
    const [isEditing, setIsEditing] = useState(false);
    let task = tasks.find((task) => task.id == id);

    if (task == undefined) {
      task = {
        name: "",
      };
    }

    const taskHandle = (e: EventHandler) => {
      setIsEditing(true);
      setTaskId(parseInt(e.target.dataset.value));
    };

    // tasks.map((task) => {
    //   const { id, name, project } = task;
    //   return (
    //     <MenuItem
    //       value={id}
    //       key={id}
    //       // onClick={}
    //       data-task-name={name}
    //       data-task-project={project}
    //     >
    //       {name}
    //     </MenuItem>
    //   );
    // });

    // const handleOpen = (e: EventHandler) => {
    //   console.log(e);
    // };

    const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;

    return isInEditMode ? (
      <Autocomplete
        sx={{ m: 1, width: "25%", minWidth: 200, margin: 0 }}
        ListboxProps={{ style: { maxHeight: 200, overflow: "auto" } }}
        variant="standard"
        disablePortal
        autoHighlight={true}
        options={tasks}
        groupBy={(option) => {
          let project = projects.find(
            (project) => project.id == option.project
          );
          return project.name;
        }}
        onOpen={() => setIsEditing(true)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={isEditing ? "Task" : task.name}
            variant="standard"
            className="task-name"
          />
        )}
        getOptionLabel={(task) => task.name}
        onChange={taskHandle}
        renderOption={(props, option) => (
          <MenuItem
            {...props}
            data-value={option.id}
            key={option.id}
            data-task-name={option.name}
            data-task-project={option.project}
            selected={params.row.task == option.id ? "true" : "false"}
          >
            {option.name}
          </MenuItem>
        )}
      />
    ) : (
      task.name ?? ""
    );

    // return <>{task.name}</>;
  };

  const handleAction = (id) => {
    console.log(id);
  };

  return (
    <>
      <div style={{ height: "auto", width: "100%" }}>
        <DataGrid
          editMode="row"
          rowsLoadingMode="server"
          experimentalFeatures={{
            lazyLoading: true,
          }}
          rows={records}
          rowModesModel={rowModesModel}
          // onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
          columns={[
            {
              field: "id",
              headerName: "ID",
              type: "number",
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
              field: "task",
              headerName: "Task ID",
              type: "number",
              align: "left",
              headerAlign: "left",
            },
            // {
            //   field: "task_name",
            //   headerName: "Task",
            //   type: "singleSelect",
            //   align: "left",
            //   headerAlign: "left",
            //   editable: true,
            //   width: 200,
            //   renderCell: (params) => (
            //     <Task id={params.row.task} params={params} />
            //   ),
            //   valueOptions: ({ row }) => {
            //     const options = [];
            //     tasks?.map((task) => options.push(task.name));
            //     return options;
            //   },
            // },
            {
              field: "task_name",
              type: "actions",
              headerName: "Task",
              width: 200,
              align: "left",
              cellClassName: "actions",
              getActions: (params) => [
                <Task id={params.row.task} params={params} />,
              ],
            },
            {
              field: "project",
              headerName: "Project",
              type: "number",
              editable: true,
              align: "left",
              headerAlign: "left",
            },
            {
              field: "date",
              headerName: "Date",
              type: "date",
              align: "left",
              headerAlign: "left",
              width: 150,
              editable: true,
              valueGetter: ({ value }) => value && new Date(value),
            },
            {
              field: "start_time",
              headerName: "Start",
              type: "time",
              width: 100,
              editable: true,
            },
            {
              field: "end_time",
              headerName: "End",
              type: "time",
              width: 100,
              editable: true,
            },
            {
              field: "tracked_hours",
              headerName: "Duration",
              type: "number",
              editable: false,
              align: "left",
              headerAlign: "left",
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
                    onClick={handleDeleteClick(id)}
                    color="inherit"
                  />,
                ];
              },
            },
          ]}
          initialState={{
            pagination: { paginationModel: { pageSize: pageSize } },
          }}
          columnVisibilityModel={{
            project: false,
            task: false,
          }}
          // processRowUpdate={handleTrackingUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onCellClick={handleOnCellClick}
        />
      </div>
    </>
  );
};

export default TimeRecordList;
