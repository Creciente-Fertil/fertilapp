const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_TRATAMIENTOS = "treatments"
const RUTA_TIPO_TRATAMIENTOS = "treatment-types"

function processTipo(type) {
    
    let data_tipo = {
        id: type.typeId,
        nombre: type.name,
        generico: type.isGeneric
    }
    return data_tipo
}
function processTratamiento(treatment) {
    let data_tratamiento = {
        fecha: treatment.treatmentDate,
        animal: treatment.animalId,
        tipo: treatment.treatmentTypeId,
        observacion: treatment.notes,
        expand: {
            animal: {
                id: treatment.animalId,
                caravana: treatment.animalId
            },
            tipo: {
                id: treatment.treatmentTypeId,
                nombre: treatment.treatmentTypeId
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
    let token = localStorage.getItem("token") || "";

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
let token = localStorage.getItem("token") || "";

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