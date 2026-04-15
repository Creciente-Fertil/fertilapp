const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_TACTOS = "pregnancy-checks"
function processTacto(tacto) {
    let data_tacto = {
        fecha: tacto.date,
        observacion: tacto.notes,
        animal: tacto.animalId,
        prenada: 0,
        categoria:"",
        expand: {
            animal: {
                id: tacto.animalId,
                caravana: tacto.animalId,
            }
        }


    }
    return data_tacto;
}
function processTactos(data) {
    let data_tactos = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        data_tactos.push(processTacto(fila))
    }
    return data_tactos
}
export async function getAll() {

    let token = localStorage.getItem("token") || "";

    let ruta = `${RUTA_JAVA}${RUTA_TACTOS}/all`
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta, options)

    let data_all = await res_all.json()


    let procesada = processTactos(data_all)

    return procesada
}
function postData(data) {
    let data_tacto = {
        animalId: data.id,
        date: data.fecha,
        checkType: "ECOGRAFIA",

        isPregnant: true,
        notes: data.observacion,
        establishmentId: 1
    }
    return data_tacto
}

export async function saveTacto(data) {
    let ruta = `${RUTA_JAVA}${RUTA_TACTOS}`
    let data_tacto = postData(data)
    let token = localStorage.getItem("token") || "";
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_tacto), // data can be `string` or {object}!
        headers: {

            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    return data_save

}