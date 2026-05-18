import { processEstablishment, processEstablishments } from "../establecimientos/establecimientosback"
import { getUser } from "$lib/userstorage/usersotrage"
import { handleAuthenticatedRequest } from "../errores/erroresback"
//const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
let ruta_java = import.meta.env.VITE_RUTA_JAVA_SERVER;
let ruta_local_java = import.meta.env.VITE_RUTA_LOCAL_JAVA_SERVER;
let bd_local = import.meta.env.VITE_LOCAL_BD == "si";
let RUTA_JAVA = bd_local ? ruta_local_java : ruta_java
const RUTA_USERS = "users"
const RUTA_AUTH = "auth"
const RUTA_ESTA = "establishments/user/"
export function processUser(data) {

    let data_user = {
        id: data.userId,
        username: data.username,
        nombre: data.firstName,
        apellido: data.lastName,
        nivel: data.level,
        email: data.email,
        active: data.isActive
    }
    return data_user
}
export async function loginJava(email, contra) {
    let ruta = `${RUTA_JAVA}${RUTA_AUTH}/login`
    let data = {
        email,
        password: contra
    }

    let res_login = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json'
        }
    })

    let data_login = await res_login.json()

    return data_login
}
// Cambia el establecimiento sobre el que opera el usuario. Devuelve
// {token, userId, establishmentId, establishmentName, role} con un JWT
// nuevo scoped al establishment solicitado. El caller debe actualizar
// localStorage (token + cab actual) y refrescar la app.
// <3
export async function switchEstablishment(estId) {
    let user = getUser();
    let ruta = `${RUTA_JAVA}${RUTA_AUTH}/switch-establishment/${estId}`
    let res = await fetch(ruta, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
        }
    })
    if (!res.ok) {
        throw new Error(`switch-establishment ${estId} -> ${res.status}`)
    }
    return await res.json()
}
export async function saveUser(data) {
    let ruta = `${RUTA_JAVA}${RUTA_USERS}`;
    let res_signup = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
        },
    });
    let data_signup = await res_signup.json()
    return data_signup
}
export async function establecimientosUser(iduser) {
    let ruta = `${RUTA_JAVA}${RUTA_USERS}/${iduser}`;
    let user = getUser();
    let token = user.token;
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await handleAuthenticatedRequest(ruta, options)

    let data_all = await res_all.json()
    let procesada = processEstablishments(data_all)

    return procesada
}
export async function getUserId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_USERS}/${id}`;
    let user = getUser();
    let token = user.token;
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await handleAuthenticatedRequest(ruta, options)

    let data_all = await res_all.json()
    //let procesada = processUser(data_all)

    return data_all
}
export async function editUser(data, id) {
    let ruta = `${RUTA_JAVA}${RUTA_USERS}/${id}`;
    let user = getUser();
    let token = user.token;
    let options = {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta, options)

    let data_all = await res_all.json()


    return data_all
}
export async function eliminarUser(id) {
    let ruta = `${RUTA_JAVA}${RUTA_USERS}/${id}`;
    let user = getUser();
    let token = user.token;
    let options = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    await fetch(ruta, options)
}
export async function changePassword() {
    let url = ""
    url = window.location.origin
    let ruta = `${RUTA_JAVA}${RUTA_USERS}/password-reset/request`;
    let user = getUser();
    let token = user.token;
    let data = {
        email: user.useremail,
        url: url + "/recover"
    }
    let options = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
            , "Authorization": `Bearer ${token}`
        }
    }
    await fetch(ruta, options)
}
export async function forgotPassword(correo) {
    let url = ""
    url = window.location.origin
    let ruta = `${RUTA_JAVA}${RUTA_USERS}/password-reset/request`;
    let user = getUser();

    let data = {
        email: correo,
        url: url + "/recover"
    }
    let options = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"

        }
    }
    await fetch(ruta, options)
}
export async function resetPassword(data) {

    let ruta = `${RUTA_JAVA}${RUTA_USERS}/password-reset/reset`;
    let user = getUser();
    let token = user.token;

    let options = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    }
    let res = await fetch(ruta, options)
    let data_body = await res.json()
    return data_body
}
// Devuelve el perfil del usuario autenticado: { userId, email, level,
// planName?, establishments[], establishmentId?, establishmentName? }.
// Lo usamos en el callback de OAuth2 (que solo recibe token via URL)
// para hidratar el resto del usertoken.
export async function getMe(token) {
    let ruta = `${RUTA_JAVA}${RUTA_AUTH}/me`
    let res = await fetch(ruta, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    if (!res.ok) {  
        throw new Error(`getMe -> ${res.status}`)
    }
    return await res.json()
}