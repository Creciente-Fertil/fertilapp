import { processEstablishment, processEstablishments } from "../establecimientos/establecimientosback"
import { getUser } from "$lib/userstorage/usersotrage"
import { handleAuthenticatedRequest } from "../errores/erroresback"
const RUTA_JAVA = import.meta.env.VITE_RUTA_JAVA_SERVER
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

// Cambia el establecimiento sobre el que opera el usuario. Devuelve
// {token, userId, establishmentId, establishmentName, role} con un JWT
// nuevo scoped al establishment solicitado. El caller debe actualizar
// localStorage (token + cab actual) y refrescar la app.
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
            "Content-Type": "application/json"
        },
    })
    let data_login = await res_login.json()
    return data_login
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
export async function editUser(data,id) {
    let ruta = `${RUTA_JAVA}${RUTA_USERS}/${id}`;
    let user = getUser();
    let token = user.token;
    let options = {
        method:"PUT",
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