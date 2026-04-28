import { getUser } from "$lib/userstorage/usersotrage"
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_SERVICIOS = "services"
export function tipoServicios() {
    return [
        { id: "INSEMINATION", nombre: "Inseminación artificial" },
        { id: "NATURAL_SERVICE", nombre: "Servicio natural" },
    ]
}
function processServicio(fila) {

    let data_ser = {

        id: fila.serviceId,
        fechadesde: fila.startDate,
        fechainseminacion: fila.startDate,
        fechahasta: fila.endDate,
        madre: fila.animalId,
        pajuelas: fila.fatherTagNumbers.join(),
        padres: fila.fatherIds.join(),
        
        padre: fila.fatherIds.join(),
        observacion: fila.notes,
        fechaparto: fila.expectedBirthDate,
        active: fila.isActive,
        cab: fila.establishmentId,
        tipo: fila.serviceType,
        created: fila.creationDate,
        updated: fila.updateDate,
        expand: {
            madre: {
                id: fila.animalId,
                caravana: fila.animalTagNumber
            },
            animal: {
                id: fila.animalId,
                caravana: fila.animalTagNumber
            }
        }
    }
    return data_ser
}
function processServicios(data) {
    let servicios = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        servicios.push(processServicio(fila))
    }
    return servicios
}
export async function getAllServices() {
    let user = getUser();
    let token = user.token;
    let ruta_all = `${RUTA_JAVA}${RUTA_SERVICIOS}/all`
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta_all, options)

    let data_all = await res_all.json()

    let servicios = processServicios(data_all)

    return servicios
}
export function postServicio(data) {
    let data_java = {
        animalId: data.madre,
        establishmentId: data.cab,
        serviceType: data.tipo,
        startDate: data.fechadesde.split(" ")[0],
        endDate: data.fechahasta && data.fechahasta.length > 0 ? data.fechahasta.split(" ")[0] : "",
        strawCode: "",
        fatherIds: data.padres.split(",").map(item => Number(item)),
        expectedBirthDate: data.fechaparto.split(" ")[0],
        notes: data.observacion
    }
    
    return data_java;
    
}
export function postInseminacion(data){
    let data_java = {
        animalId: data.animal,
        establishmentId: data.cab,
        serviceType: data.tipo,
        startDate: data.fechainseminacion.split(" ")[0],
        endDate: "",
        strawCode: "",
        fatherIds: [data.padre],
        expectedBirthDate: data.fechaparto.split(" ")[0],
        notes: data.observacion
    }
    
    return data_java;
}
export async function saveServicio(data) {
    let ruta = `${RUTA_JAVA}${RUTA_SERVICIOS}`
    let user = getUser();
    let token = user.token;
    //let data_java = postServicio(data)
    let res_post = await fetch(ruta,
        {
            method: "POST",
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

export async function editServicio(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_SERVICIOS}/${id}`
    let user = getUser();
    let token = user.token;
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
export async function eliminarServicio(id) {
    let ruta = `${RUTA_JAVA}${RUTA_SERVICIOS}/delete/${id}`
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
