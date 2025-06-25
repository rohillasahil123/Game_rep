// in axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://foodenergy.shop/v1",
});

export default api;
