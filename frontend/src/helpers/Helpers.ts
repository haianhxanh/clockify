import * as API from "@/constants/api";
import cookie from "cookie";

export const getRecords = async () => {
  try {
    const response = await fetch(API.RECENT_TRACKING, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: "Bearer " + String(session.data.user.access),
        Authorization: "Bearer " + process.env.ACCESS_TOKEN,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const apiTrackingDelete = async (id: number) => {
  try {
    const response = await fetch(`${API.TRACKING_DELETE}${id}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Authorization: "Bearer " + String(session.data.user.access),
        Authorization: "Bearer " + process.env.ACCESS_TOKEN,
      },
    });
    getRecords();
  } catch (error) {
    console.log(error);
  }
};

export function parseCookies(req) {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie);
}

export const getDuration = (time: number) => {
  let timeStampInSec = time / 1000;
  let hours = Math.floor(timeStampInSec / 3600);
  let remainSeconds = timeStampInSec % 3600;
  let minutes = Math.floor(remainSeconds / 60);
  let seconds = remainSeconds % 60;
  return [hours, minutes, seconds];
};

export const timeToString = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return [hours, minutes];
};

export const getTime = () => {
  let time = new Date().getTime();
  return time;
};

export const dateToJson = (dateObj: any) => {
  const event = new Date(dateObj);
  const jsonDate = event.toJSON();
  return jsonDate.split("T")[0];
};

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
