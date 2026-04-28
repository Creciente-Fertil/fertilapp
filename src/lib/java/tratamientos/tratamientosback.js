import { getUser } from "$lib/userstorage/usersotrage"
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_TRATAMIENTOS = "treatments"
const RUTA_TIPO_TRATAMIENTOS = "treatment-types"

function processTipo(type) {

    let data_tipo = {
        id: type.treatmentTypeId,
        nombre: type.name,
        generico: type.isGeneric,
        active:type.isActive
    }
    return data_tipo
}
function processTratamiento(treatment) {
    let data_tratamiento = {
        id:treatment.treatmentId,
        fecha: treatment.treatmentDate,
        animal: treatment.animalId,
        tipo: treatment.treatmentTypeId,
        observacion: treatment.notes,
        expand: {
            animal: {
                id: treatment.animalId,
                caravana: treatment.animalTagNumber
            },
            tipo: {
                id: treatment.treatmentTypeId,
                nombre: treatment.treatmentTypeName
            }

        }
    }
    return data_tratamiento
}
function processTipos(data) {
    let data_tipos = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        data_tipos.push(processTipo(fila))
    }
    return data_tipos
}
function processTratamientos(data) {
    let data_tratamientos = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        data_tratamientos.push(processTratamiento(fila))
    }
    return data_tratamientos
}
export async function getAllTipos() {
    let user = getUser();
    let token = user.token;

    let ruta = `${RUTA_JAVA}${RUTA_TIPO_TRATAMIENTOS}/all`
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta, options)

    let data_all = await res_all.json()



    let procesada = processTipos(data_all)

    return procesada
}
export async function getAll() {
    let user = getUser();
    let token = user.token;

    let ruta = `${RUTA_JAVA}${RUTA_TRATAMIENTOS}/all`
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta, options)

    let data_all = await res_all.json()


    let procesada = processTratamientos(data_all)


    return procesada
}
function postDataTrata(data) {
    let data_trata = {
        animalId: data.animal,
        establishmentId: 1,
        treatmentTypeId: data.tipo,
        treatmentDate: data.fecha.split(" ")[0],
        notes: data.observacion
    }
    return data_trata;
}
function postDataTipo(data) {
    let data_tipo = {
        name: data.nombre,
        isGeneric: false,
        isActive: true,
        establishmentId: 1
    }
    return data_tipo
}
export async function saveTrata(data) {
    let ruta = `${RUTA_JAVA}${RUTA_TRATAMIENTOS}`
    let data_trata = postDataTrata(data)
    let user = getUser();
    let token = user.token;

    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_trata), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    let procesada = processTipo(data_save)

    return procesada    
}
export async function saveTipo(data) {
    let ruta = `${RUTA_JAVA}${RUTA_TIPO_TRATAMIENTOS}`
    let data_tipo = postDataTipo(data)
    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_tipo), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    let record_tipo = processTipo(data_save)
    return record_tipo
}
export async function editTratamiento(id,data) {
    let ruta = `${RUTA_JAVA}${RUTA_TRATAMIENTOS}/${id}`
    
        let user = getUser();
        let token =  user.token;
        let res_post = await fetch(ruta,
            {
                method: "PUT",
                body: JSON.stringify(data), // data can be `string` or {object}!
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            }
        )
    
        let data_post = await res_post.json()
        return data_post
}
export async function editTipo(id,data) {
    let ruta = `${RUTA_JAVA}${RUTA_TIPO_TRATAMIENTOS}/${id}`
    
        let user = getUser();
        let token =  user.token;
        let res_post = await fetch(ruta,
            {
                method: "PUT",
                body: JSON.stringify(data), // data can be `string` or {object}!
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            }
        )
    
        let data_post = await res_post.json()
        return data_post
}
export async function eliminarTratamiento(id){
    let ruta = `${RUTA_JAVA}${RUTA_TRATAMIENTOS}/delete/${id}`
        let user = getUser();
        let token =  user.token;
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
export async function eliminarTipo(id){
    let ruta = `${RUTA_JAVA}${RUTA_TIPO_TRATAMIENTOS}/delete/${id}`
        let user = getUser();
        let token =  user.token;
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