import { browser } from "$app/environment";
export function setUser(userdata){
    localStorage.setItem("usertoken", JSON.stringify(userdata));
}
export function setUserDefault(userdata){
    let userdefault = {useremail:"",
            token:"",
            id:0};
    localStorage.setItem("usertoken", JSON.stringify(userdefault));
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
            token:"",
            id:0
        };
    }
}