import axios from "axios";

const API = axios.create({

baseURL:"http://127.0.0.1:8000/api"

});

export const getDepartments=()=>

API.get(

"/departments/"

);

export const getDoctors=(departmentId)=>

API.get(

`/departments/${departmentId}/doctors/`

);