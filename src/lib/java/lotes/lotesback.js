const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_LOTES = "lots"
function processLot(lot){
    let data_lote = {
        id:lot.id,
        nombre:lot.name
    }
    return data_lote
} 
function processLots(data){
    let data_lotes = []
    for(let i = 0;i<data.length;i++){
        let fila = data[i]
        data_lotes.push(processLot(fila))
    }
    return data_lotes
}
export async function getAll() {
    let ruta = `${RUTA_JAVA}${RUTA_LOTES}/all`

    let res_all = await fetch(ruta)

    let data_all = await res_all.json()


    let procesada = processLots(data_all)

    return procesada
}
export async function getLotlId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_LOTES}/${id}`
    let res_all = await fetch(ruta)
    let data_all = await res_all.json()
    let procesada = processLot(data_all)
    return procesada
}
function postData(data) {
    let data_lot = {
        name: data.nombre,
        
        establishmentId: 1
    }
    return data_lot
}
export async function saveLot(data) {
    let ruta = `${RUTA_JAVA}${RUTA_LOTES}`
    let data_lot = postData(data)
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_lot), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
        },
    })
    let data_save = await res_save.json()
    return data_save

}