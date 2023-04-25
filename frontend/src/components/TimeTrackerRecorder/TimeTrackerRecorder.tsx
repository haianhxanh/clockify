import React, { useEffect, useState } from "react";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { Container } from "@mui/material";
import projects from "@/mock-data/projects";
import Link from "next/link";

interface Project {
  id: number;
  name: string;
}

interface TimeRecord {
  id: number;
  taskId?: number;
  project?: Project;
  startTime: number;
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

  const hours = Math.floor(time / 1000 / 3600);
  const minutes = Math.floor(((time / 1000) % 3600) / 60);
  const seconds = Math.floor((time / 1000) % 60);

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(getTime());
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsReset(true);
    setEndTime(getTime());
    let newRecord = {
      ...timeRecords,
      id: timeRecords.length + 1,
      startTime: startTime,
      endTime: getTime(),
      duration: time,
      taskDesc: taskDesc,
      project: project,
    };

    setTimeRecords([...timeRecords, newRecord]);
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
      intervalId = setInterval(() => setTime(time + 50), 50);
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
    console.log(record);
    return record;
  };

  const updateRecord = (e: Event) => {
    let recordElm = e.target.closest(".single-record");
    let recordId = parseInt(recordElm.dataset.timeRecordId);
    let updateType = e.currentTarget.dataset.updateType;
    let updateValue = e.currentTarget.value;
    update(recordId, updateType, updateValue);

    function update(recordId: number, updateType: string, updateValue: any) {
      let record = getSingleRecord(recordId);
      console.log(record);

      switch (updateType) {
        case "description":
          record.taskDesc = updateValue;
          break;
        case "project":
          record.project.id =
            e.target.options[e.target.selectedIndex].dataset.projectId;
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
  };

  return (
    <div>
      <Container>
        <input
          type="text"
          id="taskDescription"
          onChange={descriptionHandle}
          value={taskDesc}
        />
        <select name="projects" id="projects" onChange={projectHandle}>
          <option label="" data-project-id="">
            Select project
          </option>
          {projects.map((project) => {
            const { id, name } = project;
            return (
              <option value={name.toLowerCase()} key={id} data-project-id={id}>
                {name}
              </option>
            );
          })}
        </select>
        {hours}:{minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}:
        {isRunning ? (
          <PauseCircleIcon onClick={pauseTimer} />
        ) : (
          <PlayArrowIcon onClick={startTimer} />
        )}
        {time > 0 && <StopIcon onClick={stopTimer} />}
      </Container>

      {timeRecords.map((record) => {
        const { id, startTime, endTime, duration, taskDesc, project } = record;
        const parsedStartTime = timeToString(startTime);
        const parsedEndTime = timeToString(endTime);
        const totalTime = getDuration(duration);
        return (
          <div key={id}>
            <table>
              <tbody>
                <tr data-time-record-id={id} className="single-record">
                  <td>{id}</td>
                  <td>
                    <input
                      defaultValue={taskDesc}
                      type="text"
                      onChange={updateRecord}
                      data-update-type="description"
                    />
                  </td>
                  <td>
                    <select
                      name="projects"
                      data-update-type="project"
                      onChange={updateRecord}
                    >
                      {projects.map((p) => {
                        return (
                          <option
                            value={p.name.toLowerCase()}
                            key={p.id}
                            data-project-id={p.id}
                            selected={p.id === project.id && "selected"}
                          >
                            {p.name}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td>
                    {parsedStartTime[0].toString().padStart(2, "0")}:
                    {parsedStartTime[1].toString().padStart(2, "0")}
                    &nbsp;&#8211;&nbsp;
                    {parsedEndTime[0].toString().padStart(2, "0")}:
                    {parsedEndTime[1].toString().padStart(2, "0")}
                  </td>
                  <td>
                    {totalTime[0].toString().padStart(2, "0")}:
                    {totalTime[1].toString().padStart(2, "0")}:
                    {totalTime[2].toString().padStart(2, "0")}
                  </td>
                  <td>
                    <Link href={`/projects/${project.id}`}>View</Link>
                  </td>
                  <td>
                    <button className="btn" onClick={() => removeRecord(id)}>
                      remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default TimeTrackerRecorder;
