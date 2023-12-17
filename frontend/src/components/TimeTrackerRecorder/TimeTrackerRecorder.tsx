import React, { useEffect, useState, useContext, EventHandler } from "react";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import { cookies } from "next/headers";
import { useCookies } from "react-cookie";
import { NextRequest, NextResponse } from "next/server";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  NativeSelect,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import projects from "@/mock-data/projects";
import Link from "next/link";
// import AuthContext from "@/context/AuthContext";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Delete, TextFields } from "@mui/icons-material";
import * as API from "@/constants/api";
import { middleware } from "@/middleware";
import { getDuration, getTime, timeToString } from "@/helpers/Helpers";
import { DataContext } from "@/context/DataContext";
const SECONDS_PER_HOURS = 3600;
const SECONDS_PER_MINUTE = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_SECOND = 1000;

interface Project {
  id: number;
  name: string;
}

interface TimeRecord {
  id: number;
  taskId?: number;
  project?: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  taskDesc?: string;
}

interface Task {
  id: number;
  name: string;
  project: number;
}

const TimeTrackerRecorder = ({
  tasks,
  taskOptions,
  getProjectTasks,
  projectTasks,
  setProjectTasks,
}: {
  tasks: any;
  taskOptions: any;
  getProjectTasks: any;
  projectTasks: any;
  setProjectTasks: any;
}) => {
  const { snackbar, setSnackbar, getRecords, apiTrackingUpdate } =
    useContext(DataContext);
  const [isRunning, setIsRunning] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [taskDesc, setTaskDesc] = useState("");
  const [task, setTask] = useState<Task>({
    id: undefined,
    name: "",
    project: "",
  });
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [project, setProject] = useState<Project>({
    id: undefined,
    name: "",
    projectId: undefined,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskProjects, setTaskProjects] = useState<Project[]>([]);
  // const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [timeRecord, setTimeRecord] = useState<TimeRecord>();
  const [trackingCookie, setTrackingCookie, removeTrackingCookie] = useCookies([
    "tracking",
  ]);
  const [time, setTime] = useState(0);

  // let { user } = useContext(AuthContext);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetch(API.PROJECTS, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
        });
        const data = await response.json();
        setProjects(data);
        setTaskProjects(data);
      } catch (error) {
        console.log(error);
      }
    };
    getProjects();
  }, []);

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(getTime());
    apiTrackingStart();
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsReset(true);
    setEndTime(getTime());
    apiTrackingStop();
    setTime(0);
    setTaskDesc("");
    setProject({ id: undefined, name: "" });
    setTask({ id: undefined, name: "" });
    removeTrackingCookie("tracking", {
      path: "/",
      maxAge: SECONDS_PER_HOURS * HOURS_PER_DAY,
      sameSite: true,
    });
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  useEffect(() => {
    if (trackingCookie.tracking == undefined) {
      setTime(0);
      return;
    }
    setTime(trackingCookie.tracking.duration);
  }, []);

  useEffect(() => {
    let intervalId: any;
    if (isRunning || time != 0) {
      intervalId = setInterval(() => setTime(time + 1000), 1000);

      let trackingCookieObject = {
        duration: time ? time : 0,
        startTime: startTime,
        endTime: endTime ? endTime : 0,
        readableTime: {
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        },
      };

      setTrackingCookie("tracking", JSON.stringify(trackingCookieObject), {
        path: "/",
        maxAge: 3600, // Expires after 1hr
        sameSite: true,
      });
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  const descriptionHandle = (e: Event) => {
    setTaskDesc(e.currentTarget.value);
  };

  useEffect(() => {
    setHours(Math.floor(time / MILLISECONDS_PER_SECOND / SECONDS_PER_HOURS));
    setMinutes(
      Math.floor(
        ((time / MILLISECONDS_PER_SECOND) % SECONDS_PER_HOURS) /
          SECONDS_PER_MINUTE
      )
    );
    setSeconds(
      Math.floor((time / MILLISECONDS_PER_SECOND) % SECONDS_PER_MINUTE)
    );
  }, [time]);

  // const getSingleRecord = (id: number) => {
  //   let record = timeRecords.find((record) => record.id == id);
  //   return record;
  // };

  // const updateRecord: EventHandler = (e: Event) => {
  //   let recordElm = e.currentTarget.closest(".single-record");
  //   let recordId = parseInt(recordElm.dataset.timeRecordId);
  //   let updateType = e.target.dataset.updateType;
  //   let updateValue = e.target.value;
  //   let projectViewLink = recordElm.querySelector(".project-view-link");
  //   let elmUpdateRecordSelect = recordElm.querySelector("#updateProjectId");
  //   let elmUpdateDescription = recordElm.querySelector(
  //     "#updateTaskDescription"
  //   );
  //   elmUpdateDescription.value = updateValue;
  //   console.log(updateValue);

  //   update(recordId, updateType, updateValue);

  //   function update(recordId: number, updateType: string, updateValue: any) {
  //     let record = getSingleRecord(recordId);
  //     let newProjectId = parseInt(elmUpdateRecordSelect.value);
  //     let project = projects.find((project) => project.id === newProjectId);
  //     projectViewLink.href = `/projects/${project.id}`;

  //     switch (updateType) {
  //       case "description":
  //         record.taskDesc = updateValue;
  //         break;
  //       case "project":
  //         record.project.id = project.id;
  //         record.project.name = project.name;
  //         break;
  //     }
  //     return record;
  //   }
  // };

  const projectHandle: EventHandler = (e: Event) => {
    if (e.target.dataset.projectId != undefined) {
      let projectId = parseInt(e.target.dataset.projectId);
      console.log(e.target.dataset.projectId);

      let projectName = e.target.dataset.value;

      setProject({
        id: projectId,
        name: projectName,
      });

      getProjectTasks(projectId);
      console.log(project);
    } else {
      setProject({
        id: undefined,
        name: "",
      });
      setProjectTasks([]);
    }
  };

  const taskHandle: EventHandler = (e: Event) => {
    console.log(e.target.dataset);
    console.log(e.target.dataset.value);

    setTask({
      id: parseInt(e.target.dataset.value),
      name: e.target.dataset.taskName,
      project: parseInt(e.target.dataset.taskProject),
    });
    if (e.target.dataset.value == undefined) {
      setTaskProjects(projects);
    } else if (e.target.dataset.value != "") {
      updateTaskProjects(parseInt(e.target.dataset.taskProject));
    } else {
      setTaskProjects(projects);
    }
  };

  //
  const updateTaskProjects = (id: number) => {
    let newTaskProject = projects?.filter((project) => project.id == id);
    setTaskProjects(newTaskProject);
  };

  // const removeRecord = (id: number) => {
  //   let newRecords = timeRecords.filter((record) => record.id !== id);
  //   setTimeRecords(newRecords);
  //   apiTrackingDelete(id);
  // };

  const apiTrackingStart = async () => {
    const requestData = {
      description: taskDesc,
      project: project.id,
      task: task.id,
    };

    try {
      const response = await fetch(API.TRACKING_START, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
    } catch (error) {
      console.log(error);
    }
  };

  const apiTrackingStop = async () => {
    let data;
    let requestData = {
      project: project.id,
      description: taskDesc,
      task: task.id,
    };

    try {
      const response = await fetch(API.TRACKING_STOP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
        body: JSON.stringify(requestData),
      });
      data = await response.json();

      // let newRecord = {
      //   id: data.id,
      //   startTime: startTime,
      //   endTime: getTime(),
      //   duration: time,
      //   taskDesc: taskDesc,
      //   project: project,
      // };
      // setTimeRecord(newRecord);

      apiTrackingUpdate(data.id, requestData);
    } catch (error) {
      console.log(error);
    }
    return data;
  };

  // const apiTrackingDelete = async (id: number) => {
  //   try {
  //     const response = await fetch(`${API.TRACKING_DELETE}${id}/`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // Authorization: "Bearer " + String(session.data.user.access),
  //         Authorization: "Bearer " + process.env.ACCESS_TOKEN,
  //       },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <div>
      {/* Hello {name} */}
      <Container
        style={{ padding: "0px", marginBottom: "30px", minWidth: "100%" }}
      >
        <TableContainer component={Paper} style={{ marginBottom: "30px" }}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableBody>
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  style={{ width: "35%", minWidth: 200 }}
                >
                  <Box>
                    <TextField
                      fullWidth
                      variant="standard"
                      type="text"
                      id="taskDescription"
                      onChange={descriptionHandle}
                      value={taskDesc}
                      placeholder="What are you working on"
                      style={{ marginTop: "16px" }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Autocomplete
                    sx={{ m: 1, width: "25%", minWidth: 200 }}
                    variant="standard"
                    disablePortal
                    id="combo-box-demo"
                    autoHighlight={true}
                    options={project.id ? projectTasks : tasks}
                    renderInput={(params) => (
                      <TextField {...params} label="Task" variant="standard" />
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
                      >
                        {option.name}
                      </MenuItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  {/* <FormControl variant="standard" sx={{ m: 1, minWidth: 150 }}>
                    <InputLabel id="project-select-label">Project</InputLabel>
                    <Select
                      labelId="project-select-label"
                      label="Project"
                      name="projects"
                      id="projects"
                      defaultValue=""
                    >
                      {taskProjects.length > 0 &&
                        taskProjects.map((project) => {
                          const { id, name } = project;
                          return (
                            <MenuItem
                              value={name.toLowerCase()}
                              key={id}
                              data-project-id={id}
                              onClick={projectHandle}
                              className="project-option"
                            >
                              {name}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl> */}
                  <Autocomplete
                    sx={{ m: 1, minWidth: 150 }}
                    variant="standard"
                    disablePortal
                    id="combo-box-demo"
                    options={taskProjects}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Project"
                        variant="standard"
                      />
                    )}
                    getOptionLabel={(project) => project.name}
                    onChange={projectHandle}
                    renderOption={(props, option) => (
                      <MenuItem
                        {...props}
                        data-project-id={option.id}
                        data-value={option.name}
                      >
                        {option.name}
                      </MenuItem>
                    )}
                  />
                </TableCell>
                <TableCell style={{ width: "100px" }}>
                  <Typography variant="caption" style={{ fontSize: "16px" }}>
                    {hours}:{minutes.toString().padStart(2, "0")}:
                    {seconds.toString().padStart(2, "0")}
                  </Typography>
                </TableCell>
                <TableCell style={{ width: "80px" }}>
                  {isRunning || time != 0 ? (
                    <PauseCircleIcon onClick={pauseTimer} />
                  ) : (
                    <PlayArrowIcon onClick={startTimer} />
                  )}
                  {time > 0 && <StopIcon onClick={stopTimer} />}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {timeRecord && (
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 1200 }}
            size="medium"
            aria-label="a dense table"
          >
            <TableBody>
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                data-time-record-id={timeRecord.id}
                className="single-record"
              >
                <TableCell>
                  {" "}
                  <TextField
                    fullWidth
                    variant="standard"
                    type="text"
                    id="updateTaskDescription"
                    defaultValue={timeRecord.taskDesc}
                    onChange={updateRecord}
                    data-update-type="description"
                    inputProps={{
                      "data-update-type": "description",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl
                    variant="standard"
                    sx={{ m: 1, width: "25%", minWidth: 200 }}
                  >
                    {/* <NativeSelect
                      defaultValue={task.id ? task.id : ""}
                      data-update-type="project"
                      onChange={updateRecord}
                      id="updateTask"
                      inputProps={{
                        "data-update-type": "task",
                      }}
                    >
                      {tasks.length > 0 &&
                        tasks.map((task) => {
                          const { id, name, project } = task;
                          return (
                            <option
                              value={id}
                              key={id}
                              data-project-id={project}
                              data-update-type="project"
                            >
                              {name}
                            </option>
                          );
                        })}
                    </NativeSelect> */}

                    <Select
                      labelId="task-select-label"
                      label="Task"
                      name="tasks"
                      id="tasks"
                      defaultValue=""
                    >
                      <MenuItem value="" onClick={taskHandle} data-task-name="">
                        No task
                      </MenuItem>
                      {tasks.length > 0 &&
                        tasks.map((task) => {
                          const { id, name, project } = task;
                          return (
                            <MenuItem
                              value={id}
                              key={id}
                              onClick={taskHandle}
                              data-task-name={name}
                              data-task-project={project}
                            >
                              {name}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <NativeSelect
                      defaultValue={project.id}
                      data-update-type="project"
                      onChange={updateRecord}
                      id="updateProjectId"
                      inputProps={{
                        "data-update-type": "project",
                      }}
                    >
                      {taskProjects.length > 0 &&
                        taskProjects.map((project) => {
                          const { id, name } = project;
                          return (
                            <option
                              value={id}
                              key={id}
                              data-project-id={id}
                              data-update-type="project"
                            >
                              {name}
                            </option>
                          );
                        })}
                    </NativeSelect>
                  </FormControl>
                </TableCell>
                <TableCell style={{ width: 150 }}>
                  {" "}
                  {timeToString(startTime)[0].toString().padStart(2, "0")}:
                  {timeToString(startTime)[1].toString().padStart(2, "0")}
                  &nbsp;&#8211;&nbsp;
                  {timeToString(endTime)[0].toString().padStart(2, "0")}:
                  {timeToString(endTime)[1].toString().padStart(2, "0")}
                </TableCell>
                <TableCell style={{ width: 120 }}>
                  {" "}
                  {getDuration(timeRecord.duration)[0]
                    .toString()
                    .padStart(2, "0")}
                  :
                  {getDuration(timeRecord.duration)[1]
                    .toString()
                    .padStart(2, "0")}
                  :
                  {getDuration(timeRecord.duration)[2]
                    .toString()
                    .padStart(2, "0")}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {" "}
                  <Link
                    className="project-view-link"
                    href={`/projects/${project.id}`}
                  >
                    View
                  </Link>
                </TableCell>
                <TableCell style={{ width: 120 }}>
                  {" "}
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => removeRecord(timeRecord.id)}
                  >
                    <DeleteIcon></DeleteIcon>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default TimeTrackerRecorder;
