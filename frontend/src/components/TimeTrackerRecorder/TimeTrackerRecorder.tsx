import React, { useEffect, useState, useContext } from "react";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
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
const SECONDS_PER_HOURS = 3600;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

interface Project {
  id: number;
  name: string;
}

interface TimeRecord {
  id: number;
  taskId?: number;
  project?: Project;
  startTime?: number;
  endTime?: number;
  duration?: number;
  taskDesc?: string;
}

const TimeTrackerRecorder = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [taskDesc, setTaskDesc] = useState("");
  // const [hour, setHours] = useState(0);
  // const [minutes, setMinutes] = useState();
  // const [seconds, setSeconds] = useState();
  const [project, setProject] = useState<Project>({ id: undefined, name: "" });
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [timeRecord, setTimeRecord] = useState<TimeRecord>();
  const [tempRecordId, setTempRecordId] = useState(null);

  const hours = Math.floor(time / MILLISECONDS_PER_SECOND / SECONDS_PER_HOURS);
  const minutes = Math.floor(
    ((time / MILLISECONDS_PER_SECOND) % SECONDS_PER_HOURS) / SECONDS_PER_MINUTE
  );
  const seconds = Math.floor(
    (time / MILLISECONDS_PER_SECOND) % SECONDS_PER_MINUTE
  );

  // let { user } = useContext(AuthContext);

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
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  function timeToString(timestamp: number) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return [hours, minutes];
  }

  function getTime() {
    let time = new Date().getTime();
    return time;
  }

  function getDuration(time: number) {
    let timeStampInSec = time / 1000;
    let hours = Math.floor(timeStampInSec / 3600);
    let remainSeconds = timeStampInSec % 3600;
    let minutes = Math.floor(remainSeconds / 60);
    let seconds = remainSeconds % 60;
    return [hours, minutes, seconds];
  }

  useEffect(() => {
    let intervalId: any;
    if (isRunning) {
      intervalId = setInterval(() => setTime(time + 1000), 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  const descriptionHandle = (e: Event) => {
    setTaskDesc(e.currentTarget.value);
  };

  const getSingleRecord = (id: number) => {
    let record = timeRecords.find((record) => record.id == id);
    return record;
  };

  const updateRecord = (e: Event) => {
    let recordElm = e.target.closest(".single-record");
    let recordId = parseInt(recordElm.dataset.timeRecordId);
    let updateType = e.currentTarget.dataset.updateType;
    let updateValue = e.currentTarget.value;
    let projectViewLink = recordElm.querySelector(".project-view-link");
    update(recordId, updateType, updateValue);

    function update(recordId: number, updateType: string, updateValue: any) {
      let record = getSingleRecord(recordId);
      let newProjectId = parseInt(
        e.target.options[e.target.selectedIndex].dataset.projectId
      );
      let project = projects.find((project) => project.id === newProjectId);
      projectViewLink.href = `/projects/${project.id}`;

      switch (updateType) {
        case "description":
          record.taskDesc = updateValue;
          break;
        case "project":
          record.project.id = project.id;
          record.project.name = project.name;
          break;
      }
      return record;
    }
  };

  const projectHandle = (e: Event) => {
    setProject({
      id: e.target.options[e.target.selectedIndex].dataset.projectId,
      name: e.target.value,
    });
  };

  const removeRecord = (id: number) => {
    let newRecords = timeRecords.filter((record) => record.id !== id);
    setTimeRecords(newRecords);
    apiTrackingDelete(id);
  };

  const apiTrackingStart = async () => {
    const requestData = {
      description: taskDesc,
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
    try {
      const response = await fetch(API.TRACKING_STOP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      data = await response.json();

      let newRecord = {
        ...timeRecords,
        id: data.id,
        startTime: startTime,
        endTime: getTime(),
        duration: time,
        taskDesc: taskDesc,
        project: project,
      };
      setTimeRecords([...timeRecords, newRecord]);
    } catch (error) {
      console.log(error);
    }
    return data;
  };

  const apiTrackingDelete = async (id: number) => {
    try {
      const response = await fetch(`${API.TRACKING_DELETE}${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* Hello {name} */}
      <Container style={{ padding: "0px", marginBottom: "30px" }}>
        <TableContainer component={Paper} style={{ marginBottom: "30px" }}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableBody>
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row" style={{ width: "40%" }}>
                  <Box>
                    <TextField
                      fullWidth
                      variant="standard"
                      type="text"
                      id="taskDescription"
                      onChange={descriptionHandle}
                      value={taskDesc}
                      placeholder="What are you working on"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {/* <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="project-select-label">Project</InputLabel>
                    <Select
                      labelId="project-select-label"
                      label="Project"
                      name="projects"
                      id="projects"
                      onChange={projectHandle}
                    >
                      {projects.length > 0 &&
                        projects.map((project) => {
                          const { id, name } = project;
                          return (
                            <MenuItem
                              value={name.toLowerCase()}
                              key={id}
                              data-project-id={id}
                            >
                              {name}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl> */}

                  <select
                    name="projects"
                    id="projects"
                    onChange={projectHandle}
                  >
                    <option label="" data-project-id="">
                      Select project
                    </option>
                    {projects.map((project) => {
                      const { id, name } = project;
                      return (
                        <option
                          value={name.toLowerCase()}
                          key={id}
                          data-project-id={id}
                        >
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </TableCell>
                <TableCell>
                  {hours}:{minutes.toString().padStart(2, "0")}:
                  {seconds.toString().padStart(2, "0")}
                </TableCell>
                <TableCell>
                  {isRunning ? (
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
      {timeRecords.map((record) => {
        const { id, startTime, endTime, duration, taskDesc, project } = record;
        const parsedStartTime = timeToString(startTime);
        const parsedEndTime = timeToString(endTime);
        const totalTime = getDuration(duration);

        return (
          <div key={id}>
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 1200 }}
                size="medium"
                aria-label="a dense table"
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    data-time-record-id={id}
                    className="single-record"
                  >
                    <TableCell>
                      {" "}
                      <input
                        defaultValue={taskDesc}
                        type="text"
                        onChange={updateRecord}
                        data-update-type="description"
                      />
                    </TableCell>
                    <TableCell>
                      {" "}
                      <select
                        name="projects"
                        data-update-type="project"
                        onChange={updateRecord}
                        defaultValue={project.name}
                      >
                        {projects.length > 0 &&
                          projects.map((p) => {
                            return (
                              <option
                                value={p.name.toLowerCase()}
                                key={p.id}
                                data-project-id={p.id}
                              >
                                {p.name}
                              </option>
                            );
                          })}
                      </select>
                    </TableCell>
                    <TableCell>
                      {" "}
                      {parsedStartTime[0].toString().padStart(2, "0")}:
                      {parsedStartTime[1].toString().padStart(2, "0")}
                      &nbsp;&#8211;&nbsp;
                      {parsedEndTime[0].toString().padStart(2, "0")}:
                      {parsedEndTime[1].toString().padStart(2, "0")}
                    </TableCell>
                    <TableCell>
                      {" "}
                      {totalTime[0].toString().padStart(2, "0")}:
                      {totalTime[1].toString().padStart(2, "0")}:
                      {totalTime[2].toString().padStart(2, "0")}
                    </TableCell>
                    <TableCell>
                      {" "}
                      <Link
                        className="project-view-link"
                        href={`/projects/${project.id}`}
                      >
                        View
                      </Link>
                    </TableCell>
                    <TableCell>
                      {" "}
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => removeRecord(id)}
                      >
                        <DeleteIcon></DeleteIcon>
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );
      })}
    </div>
  );
};

export default TimeTrackerRecorder;
