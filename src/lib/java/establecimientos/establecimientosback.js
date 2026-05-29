import { getUser } from "$lib/userstorage/usersotrage"
import { handleAuthenticatedRequest } from "../errores/erroresback"
let ruta_java = import.meta.env.VITE_RUTA_JAVA_SERVER;
let ruta_local_java = import.meta.env.VITE_RUTA_LOCAL_JAVA_SERVER;
let bd_local = import.meta.env.VITE_LOCAL_BD=="si";
let RUTA_JAVA =bd_local? ruta_local_java:ruta_java;
const RUTA_ESTABLECIMIENTOS = "establishments"


function processColabos(colabs){
    let data_colabs = []
    for(let i = 0;i<colabs.length;i++){
        let fila = colabs[i]
       
        let data = {
            id:fila.userId,
            correo:fila.email,
            nombre:fila.firstName,
            apellido:fila.lastName
        }
        data_colabs.push(data)
    }
    return data_colabs
}
export function processEstablishment(establishment) {
    let data_est = {
        id: establishment.establishmentId,
        nombre: establishment.name,
        direccion: establishment.address,
        contacto: establishment.contactReference,
        codigo: "",
        renspa: establishment.renspaCode,
        provincia: establishment.province,
        localidad: establishment.city,

        telefono: establishment.phone,
        mail: establishment.email,
        titular: establishment.ownerName,
        active: establishment.isActive,
        colaboradores:processColabos(establishment.users)


    }
    return data_est
}
export function processEstablishments(data) {
    let data_ests = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        let est = processEstablishment(fila)
        if (est.active) {
            data_ests.push(est)
        }

    }
    return data_ests
}
export async function getAll() {
    let user = getUser();
    let token = user.token;

    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/all`
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
export async function getAllColabs(){
    let user = getUser();
    let token = user.token;
    let id = user.id

    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/user/${id}`
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
export async function getEstablishmentId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${id}`
    let user = getUser();
    let token = user.token;
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta, options)
    let data_all = await res_all.json()

    let procesada = processEstablishment(data_all)
    return procesada
}
function postData(data) {
    let data_est = {
        name: data.nombre,
        address: data.direccion,
        contactReference: data.contacto
    }
    return data_est
}
function updateData(data) {
    let data_est = {
        name: data.nombre,
        address: data.direccion,
        contactReference: data.contacto,
        renspaCode: data.renspa,
        province: data.provincia,
        city: data.localidad,
        phone: data.telefono,
        email: data.mail
    }

    return data_est
}
export async function saveEstablishment(data) {
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}`
    let data_est = postData(data)
    let user = getUser();
    let token = user.token;
    data_est.email = user.useremail
    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: JSON.stringify(data_est),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUser().token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function addColabEstablishment(data,cabid) {
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${cabid}/collaborators`
    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
}
export async function updateEstablishment(data, id) {
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${id}`
    let data_est = updateData(data)
    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "PUT",
        body: JSON.stringify(data_est),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    let establecimiento = processEstablishment(data_save)
    return data_save

}
export async function deleteEstablishment(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/delete/${id}`

    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
}
function processColaborador(fila){
    let data = {
        id:fila.userId,
        nombre:fila.firstName,
        apellido:fila.lastName
    }
    return data
}
function processColaboradores(data){
    let filas = []
    for(let i = 0;i<data.length;i++){
        filas.push(processColaborador(data[i]))
    }
    return filas

}
export async function getColaboradores(id){
    let user = getUser();
    let token = user.token;
    

    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${id}/collaborators`
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await handleAuthenticatedRequest(ruta, options)
    let data_all = await res_all.json()
    
    let procesada = processColaboradores(data_all)
    
    return procesada
}
export async function setDueñoEstablecimiento(establecimientoid){
    if (!establecimientoid) {
        throw new Error("setDueñoEstablecimiento: establecimientoid vacio")
    }
    let user = getUser();
    let token = user.token;
    let usuarioid = user.id
    if (!usuarioid) {
        throw new Error("setDueñoEstablecimiento: getUser().id vacio")
    }
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/user/${usuarioid}`
    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`setDueñoEstablecimiento -> ${res_save.status}`)
    }
}

export async function addEmailColabEstablishment(data,cabid) {

    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${cabid}/collaborators`
    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
}

export async function addNewColabEstablecimiento(establecimientoid,useruid){
    if (!establecimientoid) {
        throw new Error("addColabEstablecimiento: establecimientoid vacio")
    }

    if (!useruid) {
        throw new Error("addColabEstablecimiento: getUser().id vacio")
    }
    let user = getUser();
    let token = user.token;
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/user/${useruid}`
    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`set colaborador -> ${res_save.status}`)
    }
}
export async function importarAnimales(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-animal`
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function importarLotes(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-lotes`
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function importarRodeos(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-rodeos`
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function importarServicios(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-servicios`
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function importarInseminaciones(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-inseminaciones`
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function importarObservaciones(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-observaciones  `
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function importarPesajes(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-pesajes`
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function importarTactos(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-tactos`
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}
export async function importarNacimientos(establecimientoid,archivo){
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${establecimientoid}/import-nacimientos`
    
    const formData = new FormData();
    formData.append("file", archivo); // Debe coincidir con @RequestParam("file")
    let user = getUser();
    let token = user.token;
    

    let res_save = await handleAuthenticatedRequest(ruta, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
    })
    if (!res_save.ok) {
        throw new Error(`saveEstablishment -> ${res_save.status}`)
    }
    return await res_save.json()
}