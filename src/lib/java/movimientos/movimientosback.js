import { getUser } from "$lib/userstorage/usersotrage";

const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/";
const RUTA_MOVEMENTS = "movements";
export function getMovementType() {
    return [
        { cod: 0, id: "LOT", nombre: "Lote" },
        { cod: 0, id: "HERD", nombre: "Rodeo" },
        { cod: 0, id: "ESTABLISHMENT", nombre: "Establecimiento" },
        { cod: 1, id: "CATEGORY", nombre: "Categoria" },
        { cod: 1, id: "DOWN", nombre: "Dar baja" }
    ];
}
function getNombreTipo(id) {
    let tipos = getMovementType()
    let t_idx = tipos.findIndex(t => t.id == id)
    if (t_idx != -1) {
        return tipos[t_idx].nombre
    }
    return ""
}
function processMove(move) {

    let data_movimiento = {
        id: move.movementId,
        animal: move.animalId,
        cab: move.establishmentId,
        fecha: move.movementDate,
        tipo: move.movementType,
        tiponombre: getNombreTipo(move.movementType),
        fromLotId: move.fromLotId,
        toLotId: move.toLotId,
        fromHerdId: move.fromHerdId,
        toHerdId: move.toHerdId,
        fromEstablishmentId: move.fromEstablishmentId,
        toEstablishmentId: move.toEstablishmentId,
        observaciones: move.notes,
        active: move.isActive
    }
    return data_movimiento;
}
function processMoves(data) {
    let data_moves = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        if (fila.isActive) {
            data_moves.push(processMove(fila))
        }

    }
    return data_moves
}

export async function getAll() {
    let user = getUser();
    let token = user.token;

    let ruta = `${RUTA_JAVA}${RUTA_MOVEMENTS}/all`
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta, options)

    let data_all = await res_all.json()


    let procesada = processMoves(data_all)

    return procesada
}
export async function getMoveId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_MOVEMENTS}/${id}`
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
    let procesada = processMove(data_all)
    return procesada
}
function postData(data, establishmentId = 1) {
    let data_move = {
        animalId: data.animal,
        establishmentId,
        movementDate: data.fecha,
        movementType: data.tipo,
        fromLotId:data.fromLotId,
        toLotId:data.toLotId,
        fromHerdId:data.fromHerdId ,
        toHerdId:data.toHerdId,
        fromEstablishmentId:data.fromEstablishmentId,
        toEstablishmentId:data.toEstablishmentId,
        notes: data.observaciones

    }
    return data_move
}
export async function saveMove(data,establishmentId=1) {
    let ruta = `${RUTA_JAVA}${RUTA_MOVEMENTS}`
    //let data_move = postData(data,establishmentId)
    let user = getUser();
    let token =  user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    let animal = processMove(data_save)
    return animal

}
export async function eliminarMove(id) {
    let ruta = `${RUTA_JAVA}${RUTA_MOVEMENTS}/delete/${id}`
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