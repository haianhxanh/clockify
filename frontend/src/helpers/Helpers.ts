import * as API from "@/constants/api";

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
