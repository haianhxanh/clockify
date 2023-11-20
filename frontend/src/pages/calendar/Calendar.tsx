import React, { useContext, useEffect } from "react";
import { useState } from "react";
import FullCalendar, { formatDate } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import DeleteIcon from "@mui/icons-material/Delete";
import * as STATUS from "@/constants/status";
import * as SNACKBAR from "@/constants/snackbar";
import dayjs, { Dayjs } from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import * as API from "@/constants/api";
import { SnackbarContext } from "@/context/SnackbarContext";
import { TimeField } from "@mui/x-date-pickers";
import { DataContext } from "@/context/DataContext";

interface Event {
  id: string;
  title: string | "no description";
  date: string;
  start: string | null;
  end: string | null;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  height: "auto",
  maxHeight: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  color: "white",
  zIndex: 2,
};

const Calendar = () => {
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [recordDate, setRecordDate] = React.useState<Dayjs | null>(
    dayjs("2022-04-17")
  );
  const [start, setStart] = useState(dayjs("2022-04-17T15:30"));
  const [end, setEnd] = useState(dayjs("2022-04-17T17:30"));
  const [open, setOpen] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [newEvent, setNewEvent] = useState();
  const [description, setDescription] = useState("");
  const [id, setId] = useState(0);
  const { records, setRecords, apiTrackingDelete, apiTrackingUpdate } =
    useContext(DataContext);
  const handleOpen = (eventId: number) => {
    let record = records.find((record) => record.id == eventId);
    setStart(dayjs(`${record.date}T${record?.start_time}`));
    setEnd(dayjs(`${record.date}T${record?.end_time}`));
    setId(record.id);

    let recordModal = document.getElementById("recordModal");
    let inputDescription = recordModal?.querySelector('[name="description"]');
    let trackedHours = recordModal?.querySelector("#trackedHours");
    inputDescription.value = record?.description;
    setDescription(inputDescription.value);
    trackedHours.innerText = record?.tracked_hours + " hours";
    let btnTrackingAction = recordModal?.querySelector("#trackingActionBtn");
    btnTrackingAction?.setAttribute("data-event-id", eventId);

    inputDescription.addEventListener("keyup", (e) => {
      inputDescription.value = e.target.value;
    });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setIsNewEvent(false);
    setDescription("");
  };

  useEffect(() => {
    records.forEach((record) => {
      let event = {
        id: record.id.toString(),
        title: record.description ? record.description : "No description",
        date: record.date,
        start: record.date + "T" + record.start_time,
        end: record.date + "T" + record.end_time,
      };
      if (!currentEvents.includes(event)) {
        setCurrentEvents((currentEvents) => [...currentEvents, event]);
      }
    });
  }, [records]);

  const handleDateClick = (event) => {
    setDescription("");
    setOpen(true);
    setIsNewEvent(true);
    const title = "Record name";

    const calendarApi = event.view.calendar;
    calendarApi.unselect();
    if (title) {
      calendarApi.addEvent({
        id: `${event.dateStr}-${title}`,
        start: event.startStr,
        end: event.endStr,
        allDay: event.allDay,
      });
    }
    // console.log(event);
    // setNewEvent(event);
    // console.log(calendarApi);
  };

  const handleEventClick = (event: React.MouseEvent<HTMLElement>) => {
    let eventId = event.event._def.publicId;
    // console.log(event);
    let eventDate = event.event.startStr.split("T")[0];
    // console.log(dayjs(eventDate));
    setRecordDate(dayjs(eventDate));

    if (event.event._def.title != "") {
      handleOpen(parseInt(eventId));
    }
  };

  const handleEvent = (event: Event) => {
    if (event.target.name == "add") {
      console.log(newEvent);
      console.log(description);
    }

    if (event.target.name == "update") {
      let start_time = `${start.$H.toString().padStart(2, "0")}:${start.$m
        .toString()
        .padStart(2, "0")}:${start.$s.toString().padStart(2, "0")}`;
      let end_time = `${end.$H.toString().padStart(2, "0")}:${end.$m
        .toString()
        .padStart(2, "0")}:${end.$s.toString().padStart(2, "0")}`;

      let new_date = `${recordDate.$y.toString()}-${(recordDate.$M + 1)
        .toString()
        .padStart(2, "0")}-${recordDate.$D.toString()}`;

      let data = {
        description: description,
        start_time: start_time,
        end_time: end_time,
        date: new_date,
      };

      apiTrackingUpdate(id, data);
      setOpen(false);
    }
  };

  const handleDescription = (event: Event) => {
    setDescription(event.target.value);
  };

  const handleNewDate = (event: Event) => {
    console.log(event);
  };

  return (
    <>
      <FullCalendar
        height="75vh"
        plugins={[timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: "prev, next today",
          center: "title",
          right: "timeGridDay, timeGridWeek",
        }}
        initialView="timeGridWeek"
        editable={true}
        // selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        // select={handleDateClick}
        eventClick={handleEventClick}
        events={currentEvents}
      />

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        id="recordModal"
        keepMounted={true}
      >
        <Box sx={style}>
          <Box>
            <Grid
              container
              justifyContent="space-between"
              style={{ marginBottom: 30 }}
            >
              <Grid>
                <Typography
                  variant="caption"
                  color="initial"
                  id="trackedHours"
                ></Typography>
              </Grid>

              {!isNewEvent && (
                <Grid>
                  <DatePicker
                    style={{ width: "45%" }}
                    label="Controlled picker"
                    value={recordDate}
                    onChange={(newDate) => setRecordDate(newDate)}
                    id="calendar"
                  />
                </Grid>
              )}

              {isNewEvent && (
                <Grid>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: STATUS.TRACKING["NEW"].color,
                      color: "#000",
                    }}
                  >
                    {STATUS.TRACKING["NEW"].label}
                  </Button>
                </Grid>
              )}
            </Grid>
            <Grid
              style={{ marginBottom: 30, gap: 30 }}
              container
              justifyContent="space-between"
            >
              <TimeField
                label="Start"
                value={start}
                onChange={(newStart) => setStart(newStart)}
                format="HH:mm:ss"
                style={{ width: "45%" }}
              />
              <TimeField
                label="Finish"
                value={end}
                onChange={(newEnd) => setEnd(newEnd)}
                format="HH:mm:ss"
                style={{ width: "45%" }}
              />
            </Grid>
          </Box>

          <form>
            <Grid>
              <TextField
                id="standard-multiline-static"
                label="Description"
                fullWidth
                multiline
                rows={4}
                variant="standard"
                name="description"
                focused
                InputLabelProps={{ style: { fontSize: 18 } }}
                onChange={handleDescription}
              />

              <Box>
                <Grid
                  container
                  justifyContent="space-between"
                  alignContent="center"
                  style={{ marginTop: 20 }}
                >
                  <Grid item xs={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="success"
                      id="trackingActionBtn"
                      name={isNewEvent ? "add" : "update"}
                      style={{ textAlign: "center" }}
                      onClick={handleEvent}
                    >
                      {isNewEvent ? "Add" : "Update"}
                    </Button>
                  </Grid>
                  {isNewEvent ? (
                    ""
                  ) : (
                    <Grid item xs={2}>
                      <Button
                        type="button"
                        variant="outlined"
                        color="error"
                        id="trackingActionBtn"
                      >
                        <DeleteIcon></DeleteIcon>
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default Calendar;
