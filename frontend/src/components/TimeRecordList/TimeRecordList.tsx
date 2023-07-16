import { useSession } from "next-auth/react";
import React, { EventHandler, useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Button, Popover, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
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
  dataGridUpdate,
}: Props) => {
  const [rows, setRows] = React.useState(records);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const handleTrackingUpdate: EventHandler = (e: Event) => {
    apiTrackingUpdate(e.id, e);
  };

  const handleTrackingDelete = (id: number) => () => {
    console.log("test");
  };

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
    console.log(id);
    
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: number) => () => {
    console.log("delete");
  };

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

  const processRowUpdate: EventHandler = (e: Event) => {
    apiTrackingUpdate(e.id, e);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
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

  const Task = ({ id }) => {
    let task = tasks.find((task) => task.id == id);
    if (task == undefined) {
      return;
    }
    return <>{task.name}</>;
  };

  return (
    <>
      {/* <TableContainer component={Paper} style={{ marginBlock: "20px" }}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Task #</TableCell>
              <TableCell>Total time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => {
              const {
                id,
                description,
                start_time,
                end_time,
                task,
                tracked_hours,
              } = record;
              return (
                <>
                  <TableRow sx={{ th: { border: 0 } }}>
                    <TimeRecord
                      key={id}
                      id={id}
                      record={record}
                      apiTrackingDelete={apiTrackingDelete}
                    />
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer> */}

      <div style={{ height: "auto", width: "100%" }}>
        <DataGrid
          editMode="row"
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
            {
              field: "task_name",
              headerName: "Task",
              type: "string",
              align: "left",
              headerAlign: "left",
              editable: true,
              width: 200,
              renderCell: (params) => <Task id={params.row.task} />,
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
              editable: true,
              align: "left",
              headerAlign: "left",
            },
            // {
            //   field: "delete",
            //   headerName: "Actions",
            //   width: 100,
            //   cellClassName: "actions",
            //   renderCell: (params) => (
            //     <PopupState variant="popover" popupId="demo-popup-popover">
            //       {(popupState) => (
            //         <div>
            //           <Button color="error" {...bindTrigger(popupState)}>
            //             <DeleteIcon></DeleteIcon>
            //           </Button>
            //           <Popover
            //             {...bindPopover(popupState)}
            //             anchorOrigin={{
            //               vertical: "bottom",
            //               horizontal: "center",
            //             }}
            //             transformOrigin={{
            //               vertical: "top",
            //               horizontal: "center",
            //             }}
            //           >
            //             <Typography sx={{ p: 2 }}>
            //               <Button color="error" id="delete">
            //                 Yes, delete
            //               </Button>
            //             </Typography>
            //           </Popover>
            //         </div>
            //       )}
            //     </PopupState>
            //   ),
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
            filter: {
              filterModel: {
                items: [
                  { field: "task_name", operator: "contains", value: "" },
                ],
              },
            },
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

// const columns: GridColDef[] = [
//   {
//     field: "id",
//     headerName: "ID",
//     type: "number",
//     editable: false,
//     align: "left",
//     headerAlign: "left",
//   },
//   {
//     field: "description",
//     headerName: "Description",
//     type: "string",
//     editable: true,
//     align: "left",
//     headerAlign: "left",
//     width: 250,
//   },
//   {
//     field: "task",
//     headerName: "Task ID",
//     type: "number",
//     editable: false,
//     align: "left",
//     headerAlign: "left",
//   },
//   {
//     field: "task_name",
//     headerName: "Task",
//     type: "string",
//     editable: true,
//     align: "left",
//     headerAlign: "left",
//     renderCell: (params) => <Task id={params.row.task} />,
//   },
//   {
//     field: "project",
//     headerName: "Project",
//     type: "number",
//     editable: true,
//     align: "left",
//     headerAlign: "left",
//   },
//   {
//     field: "start_time",
//     headerName: "Start",
//     type: "time",
//     width: 100,
//     editable: true,
//   },
//   {
//     field: "end_time",
//     headerName: "End",
//     type: "time",
//     width: 100,
//     editable: true,
//   },
//   {
//     field: "tracked_hours",
//     headerName: "Duration",
//     type: "number",
//     editable: true,
//     align: "left",
//     headerAlign: "left",
//   },
//   {
//     field: "delete",
//     headerName: "Actions",
//     width: 100,
//     cellClassName: "actions",
//     renderCell: (params) => (
//       <PopupState variant="popover" popupId="demo-popup-popover">
//         {(popupState) => (
//           <div>
//             <Button color="error" {...bindTrigger(popupState)}>
//               <DeleteIcon></DeleteIcon>
//             </Button>
//             <Popover
//               {...bindPopover(popupState)}
//               anchorOrigin={{
//                 vertical: "bottom",
//                 horizontal: "center",
//               }}
//               transformOrigin={{
//                 vertical: "top",
//                 horizontal: "center",
//               }}
//             >
//               <Typography sx={{ p: 2 }}>
//                 <Button color="error" id="delete">
//                   Yes, delete
//                 </Button>
//               </Typography>
//             </Popover>
//           </div>
//         )}
//       </PopupState>
//     ),
//   },
// ];

export default TimeRecordList;
