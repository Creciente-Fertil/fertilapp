import { getUser } from "$lib/userstorage/usersotrage"
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_PESOS = "weights"
function processPeso(peso) {
    let data_peso = {
        id: peso.weightId,
        fecha: peso.weightDate,
        pesoanterior: 0,
        pesonuevo: peso.weight,
        animal: peso.animalId,
        expand:{
            animal:{
                id:peso.animalId,
                caravana:peso.animalTagNumber
            }
        }
    }
    return data_peso
}
function processPesos(data) {
    let data_pesos = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        data_pesos.push(processPeso(fila))
    }
    return data_pesos
}
export async function getAll() {
    let user = getUser();
    let token = user.token;
    let ruta = `${RUTA_JAVA}${RUTA_PESOS}/all`
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta, options)
    let data_all = await res_all.json()
    let procesada = processPesos(data_all)
    return procesada
}
function postData(data) {
    let data_peso = {
        animalId: data.animal,
        weightDate: data.fecha.split(" ")[0],
        weight: data.pesonuevo,
        notes: ""
    }
    return data_peso
}
export async function savePeso(data) {
    let ruta = `${RUTA_JAVA}${RUTA_PESOS}`
    
    let data_peso = postData(data)
    
    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_peso), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    return data_save

}
export async function editPeso(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_PESOS}/${id}`

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
export async function eliminarPeso(id) {
    let ruta = `${RUTA_JAVA}${RUTA_PESOS}/delete/${id}`
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