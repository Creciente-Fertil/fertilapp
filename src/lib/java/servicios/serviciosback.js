
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
        fechahasta: fila.endDate,
        madre: fila.animalId,
        pajuelas: "",
        padres: "",
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
                caravana: fila.animalId
            },
            animal: {
                id: fila.animalId,
                caravana: fila.animalId
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
    let ruta_all = `${RUTA_JAVA}${RUTA_SERVICIOS}/all`
    let res_all = await fetch(ruta_all)

    let data_all = await res_all.json()

    let servicios = processServicios(data_all)

    return servicios
}
export async function saveServicio(data) {
    let ruta = `${RUTA_JAVA}${RUTA_SERVICIOS}`
    let res_post = await fetch(ruta,
        {
            method: "POST",
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json",
            },
        }
    )

    let data_post = await res_post.json()
    return data_post
}

export async function editServicio(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_SERVICIOS}/${id}`
    let res_post = await fetch(ruta,
        {
            method: "PUT",
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json",
            },
        }
    )

    let data_post = await res_post.json()
    return data_post
}
export async function eliminarServicio(id) {
    let ruta = `${RUTA_JAVA}${RUTA_SERVICIOS}/delete/${id}`
    let res_post = await fetch(ruta,
        {
            method: "POST",
//            body: JSON.stringify({}), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json",
            },
        }
    )

    //let data_post = await res_post.json()
    return {}
}