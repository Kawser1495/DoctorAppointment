import axios from "axios";

const API="http://127.0.0.1:8000/api/dashboard/";

export const getDashboard=()=>{

return axios.get(API,{

headers:{

Authorization:

`Bearer ${localStorage.getItem("access")}`

}

})

}