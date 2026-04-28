import { getUser } from "$lib/userstorage/usersotrage";
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_TACTOS = "pregnancy-checks"
function processTacto(tacto) {
    let data_tacto = {
        id: tacto.pregnancyCheckId,
        fecha: tacto.date,
        observacion: tacto.notes,
        animal: tacto.animalId,
        tipo:tacto.checkType,
        prenada: tacto.isPregnant?2:0,
        categoria: "",
        expand: {
            animal: {
                id: tacto.animalId,
                caravana: tacto.animalTagNumber,
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

    let user = getUser();
    let token = user.token;

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
export async function getTactoId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_TACTOS}/${id}`
    let user = getUser();
    let token = user.token;
    let options = {
        headers: {
            
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta,options)
    let data_all = await res_all.json()
    let procesada = processTacto(data_all)
    return procesada
}
function postData(data,establishmentId=1) {
    
    let data_tacto = {
        animalId: data.animal,
        date: data.fecha.split(" ")[0],
        checkType: data.tipo,

        isPregnant: data.prenada==2,
        notes: data.observacion,
        establishmentId
    }
    return data_tacto
}

export async function saveTacto(data) {
    let ruta = `${RUTA_JAVA}${RUTA_TACTOS}`

    let data_tacto = postData(data)
    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_tacto), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    return data_save

}
export async function editTacto(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_TACTOS}/${id}`

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
export async function eliminarTacto(id) {
    let ruta = `${RUTA_JAVA}${RUTA_TACTOS}/delete/${id}`
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