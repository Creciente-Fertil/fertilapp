import { getUser } from "$lib/userstorage/usersotrage"

const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_ESTABLECIMIENTOS = "establishments"

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
        active: establishment.isActive

    }
    return data_est
}
export function processEstablishments(data) {
    let data_ests = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        data_ests.push(processEstablishment(fila))
    }
    return data_ests
}
export async function getAll() {
    let user = getUser();
    let token =  user.token;

    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/all`
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta, options)
    let data_all = await res_all.json()


    let procesada = processEstablishments(data_all)

    return procesada

}
export async function getEstablishmentId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}/${id}`
    let user = getUser();
    let token =  user.token;
    let options = {
        headers:{
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta,options)
    let data_all = await res_all.json()
    let procesada = processEstablishment(data_all)
    return procesada
}
function postData(data) {
    let data_animal = {
        name: data.nombre,
        address: data.direccion,
        contactReference: data.contacto
    }
    return data_animal
}
export async function saveEstablishment(data) {
    let ruta = `${RUTA_JAVA}${RUTA_ESTABLECIMIENTOS}`
    let data_est = postData(data)
    let user = getUser();
    let token =  user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_est), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    return data_save

}