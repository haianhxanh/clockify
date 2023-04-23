import React, { useEffect, useState } from "react";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

interface TimeRecord {
  id: number;
  taskId?: number;
  projectId?: number;
  startTime: number;
  endTime?: number;
}

const TimeTrackerRecorder = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  // const [hour, setHours] = useState(0);
  // const [minutes, setMinutes] = useState();
  // const [seconds, setSeconds] = useState();
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
    };

    setTimeRecords([...timeRecords, newRecord]);
    setTime(0);
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

  useEffect(() => {
    let intervalId: any;
    if (isRunning) {
      intervalId = setInterval(() => setTime(time + 1000), 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  return (
    <div>
      {hours}:{minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}:
      {isRunning ? (
        <PauseCircleIcon onClick={pauseTimer} />
      ) : (
        <PlayArrowIcon onClick={startTimer} />
      )}
      {time > 0 && <StopIcon onClick={stopTimer} />}
      {timeRecords.map((record) => {
        const { id, startTime, endTime } = record;
        const parsedStartTime = timeToString(startTime);
        const parsedEndTime = timeToString(endTime);
        return (
          <div key={id}>
            <table>
              <tbody>
                <tr>
                  <td>{id}</td>
                  <td>
                    {parsedStartTime[0].toString().padStart(2, "0")}:
                    {parsedStartTime[1].toString().padStart(2, "0")}
                    &nbsp;&#8211;&nbsp;
                    {parsedEndTime[0].toString().padStart(2, "0")}:
                    {parsedEndTime[1].toString().padStart(2, "0")}
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
