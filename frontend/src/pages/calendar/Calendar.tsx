import React, { useEffect } from "react";
import { useState } from "react";
import FullCalendar, { formatDate } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import DeleteIcon from "@mui/icons-material/Delete";
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

interface TimeRecord {
  id: number;
  description: string | null;
  start_time: string;
  end_time: string | null;
  task: number | null;
  tracked_hours: number;
  date: string;
}

interface Event {
  id: string;
  title: string | "no description";
  date: string;
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
  zIndex: 2,
};

const Calendar = () => {
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [open, setOpen] = useState(false);
  const handleOpen = (eventId: number) => {
    let record = records.find((record) => record.id == eventId);
    let recordModal = document.getElementById("recordModal");
    let inputDescription = recordModal?.querySelector('[name="description"]');
    let trackedHours = recordModal?.querySelector("#trackedHours");
    inputDescription.value = record.description;
    trackedHours.innerText = record?.tracked_hours + " hours";
    let btnTrackingUpdate = recordModal?.querySelector("#trackingUpdateBtn");
    btnTrackingUpdate?.setAttribute("data-event-id", eventId);

    inputDescription.addEventListener("keyup", (e) => {
      inputDescription.value = e.target.value;
    });

    btnTrackingUpdate?.addEventListener("click", (e) => {
      let id = parseInt(e.target.dataset.eventId);
      trackingUpdate({ description: inputDescription.value }, id);
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const trackingUpdate = async (body, id: number) => {
    console.log("update times");

    try {
      const response = await fetch(
        API.TRACKING_UPDATE.replace("[id]", id.toString()),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
          body: JSON.stringify(body),
        }
      );
      getRecords();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRecords();
  }, []);

  useEffect(() => {
    records.forEach((record) => {
      let event = {
        id: record.id.toString(),
        title: record.description ? record.description : "No description",
        date: record.date,
      };
      setCurrentEvents((currentEvents) => [...currentEvents, event]);
    });
  }, [records]);

  const getRecords = async () => {
    try {
      const response = await fetch(API.TRACKING, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDateClick = (event) => {
    const title = "Record name";

    const calendarApi = event.view.calendar;
    console.log(calendarApi);

    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${event.dateStr}-${title}`,
        start: event.startStr,
        end: event.endStr,
        allDay: event.allDay,
      });
    }
  };

  const handleEventClick = (event: React.MouseEvent<HTMLElement>) => {
    let eventId = event.event._def.publicId;
    handleOpen(parseInt(eventId));
  };

  return (
    <>
      <FullCalendar
        height="75vh"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: "prev, next today",
          center: "title",
          right: "dayGridMonth, timeGridWeek, timeGridDay, listMonth",
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        select={handleDateClick}
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
          <Typography
            variant="caption"
            color="initial"
            id="trackedHours"
          ></Typography>
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
                sx={{ m: 2 }}
              />

              <Box>
                <Grid container justifyContent="space-around">
                  <Grid item xs={4}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="success"
                      id="trackingUpdateBtn"
                    >
                      Update
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="error"
                      id="trackingDeleteBtn"
                    >
                      <DeleteIcon></DeleteIcon>
                    </Button>
                  </Grid>
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
