import { getUser } from "$lib/userstorage/usersotrage";
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/";
const RUTA_MOVEMENTS = "movements";
function processMove(move) {
    let data_movimiento = {
        "movementId": 1,
        "animalId": 1,
        "establishmentId": 1,
        "movementDate": "2024-07-04",
        "movementType": "LOT",
        "fromLotId": 1,
        "toLotId": 2,
        "fromHerdId": 1,
        "toHerdId": 2,
        "fromEstablishmentId": 1,
        "toEstablishmentId": 2,
        "notes": "Traslado a lote de engorde"
    }
    return data_movimiento;
}
export function getMovementType(){
    return [
        {id:"LOT",nombre:"Lote"},
        {id:"HERD",nombre:"Rodeo"},
        {id:"ESTABLISHMENT",nombre:"Establecimiento"}
    ];
}