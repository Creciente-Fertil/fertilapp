import { getUser } from "$lib/userstorage/usersotrage"
import categorias from "$lib/stores/categorias"
import { handleAuthenticatedRequest, handleTransferRequest } from "../errores/erroresback"
import { processComments } from "../observaciones/observacionesback"
import { processTactos } from "../tactos/tactosback"
import { processNacimientos } from "../nacimientos/nacimientosback"
import { processServicios } from "../servicios/serviciosback"
import { processTratamientos } from "../tratamientos/tratamientosback"
let ruta_java = import.meta.env.VITE_RUTA_JAVA_SERVER;
let ruta_local_java = import.meta.env.VITE_RUTA_LOCAL_JAVA_SERVER;
let bd_local = import.meta.env.VITE_LOCAL_BD=="si";
let RUTA_JAVA =bd_local? ruta_local_java:ruta_java;
//Queso
const RUTA_ANIMALES = "animals"
function null2string(param) {
    return param ? param : ""
}
function string2null(param) {
    return param && param.length > 0 ? param : null
}
function getCategoriaId(categoryId) {
    let c_idx = categorias.findIndex(c => c.cod == categoryId)
    if (c_idx != -1) {
        return categorias[c_idx].id
    }
    else {
        return ""
    }
}
function getCategoriaCod(categoria) {
    let c_idx = categorias.findIndex(c => c.id == categoria)
    if (c_idx != -1) {
        return categorias[c_idx].cod
    }
    else {
        return null
    }
}
function processAnimal(animal) {
    if(animal==null){
        return animal;
    }
    let data_animal = {
        id: animal.animalId,
        caravana: animal.tagNumber,
        active: animal.isActive,
        delete: animal.isDeregistered?animal.isDeregistered:animal.deathDate?animal.deathDate.length>0:false,
        fechanacimiento: null2string(animal.birthDate),
        sexo: animal.sex == "F" ? "H" : "M",
        nacimiento: null2string(animal.birthId),
        peso: animal.currentWeight,
        cab: animal.establishmentId,
        rodeo: null2string(animal.herdId),
        fechafallecimiento: animal.deathDate,
        fechaventa: animal.deathDate,
        lote: null2string(animal.lotId),
        categoria: getCategoriaId(animal.categoryId),
        nombrecategoria: null2string(animal.categoryName),
        prenada: animal.reproductiveStatus == "PRENADA" ? 2 : animal.reproductiveStatus == "EN_SERVICIO" ? 3 : 0,
        motivobaja: "",
        raza: animal.breed,
        color: animal.color,
        rp: animal.rpCode,
        created: animal.creationDate,
        updated: animal.updateDate,
        expand: {
            lote: {
                id: animal.lotId,
                nombre: animal.lotName
            },
            rodeo: {
                id: animal.herdId,
                nombre: animal.herdName
            },
            nacimiento: {
                id: animal.birthId,
                fecha: animal.birthDate,
                madre:animal.motherId,
                padre:animal.fatherId,
                nombremadre:animal.motherTagNumber,
                nombrepadre:animal.fatherTagNumber,

                observacion:animal.birthNotes

            }
        }


    }
    return data_animal
}
function processAnimales(data) {
    let data_animales = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]

        data_animales.push(processAnimal(fila))
    }
    return data_animales
}
function processEventos(data) {
    let eventos = {
        tratamientos: processTratamientos(data.treatments),
        observaciones: processComments(data.observations),
        servicios: processServicios(data.services),
        tactos: processTactos(data.pregnancyChecks),
        pariciones: processNacimientos(data.births)
    };
    return eventos
}
export async function getAnimalEventos(animalId) {
    let user = getUser();
    let token = user.token;

    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/${animalId}/relations`
    let url = new URL(ruta);
    let options = {
        headers: {
            //"Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await handleAuthenticatedRequest(url.toString(), options)

    let data_all = await res_all.json()
    let procesada = processEventos(data_all)

    return procesada
}
export async function getAll(cabid = null, lotid = null) {

    let user = getUser();
    let token = user.token;

    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/all`
    // 1. Construir la URL base
    let url = new URL(ruta);

    // 2. Agregar los parámetros de consulta solo si tienen valor
    // Spring ignorará los null/undefined, pero es mejor no enviarlos para limpiar la URL
    if (cabid) {
        url.searchParams.append('establishmentId', cabid);
    }
    if (lotid) {
        url.searchParams.append('lotId', lotid);
    }
    let options = {
        headers: {
            //"Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await handleAuthenticatedRequest(url.toString(), options)

    let data_all = await res_all.json()

    let procesada = processAnimales(data_all)

    return procesada


}
export async function getAnimalId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/${id}`
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
    let procesada = processAnimal(data_all)
    return procesada
}
function postData(data, establishmentId = 1) {
    let data_animal = {
        tagNumber: data.caravana,
        birthDate: data.fechanacimiento && data.fechanacimiento.length > 0 ? data.fechanacimiento.split(" ")[0] : "",
        sex: data.sexo == "H" ? "F" : "M",
        rpCode: data.rp,
        establishmentId: data.cab,
        breed:data.raza,
        color: data.color,
        herdId: data.rodeo,
        lotId: data.lote,
        birthId: data.nacimiento,
        categoryId: getCategoriaCod(data.categoria),
        reproductiveStatus: data.prenada == 2 ? "PRENADA" : data.prenada == 3 ? "EN_SERVICIO" : "VACIA",
    }

    return data_animal
}
function updateData(animal) {
    let data_animal = {

        tagNumber: animal.caravana,
        birthDate: string2null(animal.fechanacimiento),
        sex: animal.sexo == "H" ? "F" : "M",

        deathDate: string2null(animal.fechafallecimiento),

        breed: string2null(animal.raza),
        color: string2null(animal.color),
        rpCode: animal.rp,
        establishmentId: animal.cab,

        birthId: animal.nacimiento,
        herdId: animal.rodeo,
        reproductiveStatus: animal.prenada == 2 ? "PRENADA" : animal.prenada == 3 ? "EN_SERVICIO" : "VACIA",
        lotId: animal.lote,
        categoryId: getCategoriaCod(animal.categoria)


    }
    return data_animal
}
export async function saveAnimal(data, establishmentId = 1) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}`
    let data_animal = postData(data, establishmentId)
    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_animal), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    let animal = processAnimal(data_save)
    return animal

}
export async function darBajaAnimal(data, motivo) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}`

    let user = getUser();
    let token = user.token;
    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
    if (motivo == "fallecimiento") {
        let res_save = await fetch(ruta + "/death", {
            method: "POST",
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers
        })
    }
    else if (motivo == "venta") {
        let res_save = await fetch(ruta + "/sale", {
            method: "POST",
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers
        })
    }
}
export async function transferirAnimal(data) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}`

    let user = getUser();
    let token = user.token;
    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
    let res_save = await handleTransferRequest(ruta + "/transfer", {
        method: "POST",
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers
    })
}
export async function eliminarAnimalJava(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}`

    let user = getUser();
    let token = user.token;
    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
    let res_save = await fetch(ruta + "/delete/" + id, {
        method: "POST",

        headers
    })
}
export async function editAnimal(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/${id}`

    let user = getUser();
    let token = user.token;
    let data_animal = updateData(data)
    let res_post = await fetch(ruta,
        {
            method: "PUT",
            body: JSON.stringify(data_animal), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        }
    )

    let data_post = await res_post.json()
    return data_post
}
export async function eliminarAnimal(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/delete/${id}`
    let user = getUser();
    let token = user.token;
    let res_post = await fetch(ruta,
        {
            method: "POST",
            //            body: JSON.stringify({}), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        }
    )

    //let data_post = await res_post.json()
    return {}
}