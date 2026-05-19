// Cliente de los endpoints Java de permisos / colaboradores.
// Mismo patron que los otros *back.js: token via getUser(),
// RUTA_JAVA por env, handleAuthenticatedRequest para el 401.

import { getUser } from "$lib/userstorage/usersotrage"
import { handleAuthenticatedRequest } from "../errores/erroresback"

let ruta_java = import.meta.env.VITE_RUTA_JAVA_SERVER;
let ruta_local_java = import.meta.env.VITE_RUTA_LOCAL_JAVA_SERVER;
let bd_local = import.meta.env.VITE_LOCAL_BD=="si";
let RUTA_JAVA =bd_local? ruta_local_java:ruta_java;

function authHeaders() {
    const user = getUser()
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`,
    }
}

// `handleAuthenticatedRequest` solo dispara el evento de sesión
// expirada con 401 — los 403 los devuelve tal cual. Cada caller revisa
// `res.ok` y arroja un Error con `.status` para que el caller alto
// (screen) pueda distinguir "no autorizado" de otros errores.
async function jsonOrThrow(res, label) {
    if (!res.ok) {
        const err = new Error(`${label} -> ${res.status}`)
        err.status = res.status
        throw err
    }
    return await res.json()
}

// Lista los colaboradores del establecimiento (con su rol).
// Devuelve [{userId, email, firstName, lastName, roleId, roleCode, roleName}].
export async function listColaboradores(estId) {
    const url = `${RUTA_JAVA}establishments/${estId}/collaborators`
    const res = await handleAuthenticatedRequest(url, { headers: authHeaders() })
    return await jsonOrThrow(res, "listColaboradores")
}

// Catalogo completo de permisos (resource:action). No cambia entre
// sesiones, lo cacheamos en memoria del modulo.
let _catalogCache = null
export async function loadCatalog() {
    if (_catalogCache) return _catalogCache
    //let _catalogCache = null
    const url = `${RUTA_JAVA}permissions`
    const res = await handleAuthenticatedRequest(url, { headers: authHeaders() })
    _catalogCache = await jsonOrThrow(res, "loadCatalog")
    return _catalogCache
}

// IDs de permisos efectivos de un usuario en un establecimiento.
// Devuelve number[].
export async function getColabPermisos(estId, userId) {
    const url = `${RUTA_JAVA}establishments/${estId}/users/${userId}/permissions`
    const res = await handleAuthenticatedRequest(url, { headers: authHeaders() })
    return await jsonOrThrow(res, "getColabPermisos")
}

// Asigna un rol al usuario en el establecimiento. Borra todos sus
// permisos previos y copia los del template del rol (reset completo).
export async function assignRole(estId, userId, roleId) {
    const url = `${RUTA_JAVA}establishments/${estId}/users/${userId}/permissions/role/${roleId}`
    const res = await handleAuthenticatedRequest(url, {
        method: "PUT",
        headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`assignRole failed: ${res.status}`)
}

// Otorga un permiso puntual. No-op si el usuario ya lo tiene.
export async function grantPermiso(estId, userId, permId) {
    const url = `${RUTA_JAVA}establishments/${estId}/users/${userId}/permissions/${permId}`
    const res = await handleAuthenticatedRequest(url, {
        method: "POST",
        headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`grantPermiso failed: ${res.status}`)
}

// Quita un permiso puntual. No-op si el usuario no lo tenia.
export async function revokePermiso(estId, userId, permId) {
    const url = `${RUTA_JAVA}establishments/${estId}/users/${userId}/permissions/${permId}`
    const res = await handleAuthenticatedRequest(url, {
        method: "DELETE",
        headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`revokePermiso failed: ${res.status}`)
}

// Lista los roles del sistema. Lo usa el screen para resolver
// roleCode (ADM/ENC/OPE) → roleId que espera assignRole. Los IDs no
// son estables entre DBs, asi que no los hardcodeamos.
export async function getRoles() {
    const url = `${RUTA_JAVA}roles/all`
    const res = await handleAuthenticatedRequest(url, { headers: authHeaders() })
    return await jsonOrThrow(res, "getRoles")
}
