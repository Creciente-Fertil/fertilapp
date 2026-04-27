import { getUser } from "$lib/userstorage/usersotrage"

const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_DASHBOARD = "dashboard"
export async function getCount() {
    let ruta = `${RUTA_JAVA}${RUTA_DASHBOARD}/count`
    let user = getUser();
    let token = user.token;
    let options = {
        headers:{
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta,options)

    let data_all = await res_all.json()

    return data_all
}