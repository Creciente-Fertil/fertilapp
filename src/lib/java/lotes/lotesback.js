import { getUser } from "$lib/userstorage/usersotrage"
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_LOTES = "lots"
function processLot(lot){
    let data_lote = {
        id:lot.lotId,
        nombre:lot.name,
        active:lot.isActive

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
export async function getAll(cabid=null) {
    let ruta = `${RUTA_JAVA}${RUTA_LOTES}/all`
    let url = new URL(ruta);
    if (cabid) {
        url.searchParams.append('establishmentId', cabid);
    }
    let user = getUser();
    let token = user.token;
    let options = {
        headers:{
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        }
    }
    let res_all = await fetch(url.toString(),options)

    let data_all = await res_all.json()


    let procesada = processLots(data_all)
    procesada = procesada.filter(l=>l.active)
    return procesada
}
export async function getLotlId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_LOTES}/${id}`
    let user = getUser();
    let token = user.token;
    let options = {
        headers: {
            
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta,options)
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
    let user = getUser();
    let token = user.token;
    
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_lot), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    return data_save
}
export async function editLote(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_LOTES}/${id}`

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
export async function eliminarLote(id) {
    let ruta = `${RUTA_JAVA}${RUTA_LOTES}/delete/${id}`
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