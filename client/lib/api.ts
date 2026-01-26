import axios from "axios";

export const api = axios.create({
    baseURL : "http://localhost:5000/api",
});


//Axios Request Interceptor used to attach token with the request header
// this interceptors.request.use() runs before every request
//it checks if token exists
//if yes->add authorization header
api.interceptors.request.use((config)=>{

    //typeof window !== "undefined" is needed because Next.js can run on server too, and localStorage exists only in browser.
    if(typeof window !=="undefined"){
        const token = localStorage.getItem("token");

        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;

});