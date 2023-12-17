import axios from "axios";
const BASE_URL = "http://localhost:9000";
const URL = "projects/";
const HEADERS = {
  "Content-Type": "application/json",
  // Authorization: "Bearer " + String(session.data.user.access),
  Authorization: "Bearer " + process.env.ACCESS_TOKEN,
};

console.log(`${BASE_URL}/${URL}`);

export const getProjects = (URL: string) => {
  return axios.get(`${BASE_URL}/${URL}`, {
    method: "GET",
    headers: HEADERS,
  });
};
