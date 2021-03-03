import axios from "axios";

export default axios.create({
  baseURL: "https://habitica.com/export/history.csv",
  headers: {
    "Content-type": "application/json",
  }
});
