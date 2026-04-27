import { getUser } from "$lib/userstorage/usersotrage"

const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
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
    let res_all = await fetch(ruta, options)
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
    let res_all = await fetch(ruta, options)
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
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_est),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    return data_save

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
export async function getColaboradores(id){

}