import { browser } from "$app/environment";
export function setUser(userdata){
    localStorage.setItem("usertoken", JSON.stringify(userdata));
}
export function getUser(){
    const data = localStorage.getItem("usertoken");
    if(data){
        const parsedData = JSON.parse(data);
        return parsedData;
    }
    else{
        return {
            useremail:"",
            token:""
        };
    }
}