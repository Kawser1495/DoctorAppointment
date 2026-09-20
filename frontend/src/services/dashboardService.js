import axios from "axios";
import { API_BASE_URL } from "../config";

const API = `${API_BASE_URL}dashboard/`;

export const getDashboard=()=>{

return axios.get(API,{

headers:{

Authorization:

`Bearer ${localStorage.getItem("access")}`

}

})

}