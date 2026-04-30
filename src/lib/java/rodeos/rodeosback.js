import { getUser } from "$lib/userstorage/usersotrage"
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_RODEOS = "herds"
function processHerd(herd){
    let data_rodeo = {
        id:herd.herdId,
        nombre:herd.name,
        active:herd.isActive
    }
    return data_rodeo
} 
function processHerds(data){
    let data_rodeos = []
    for(let i = 0;i<data.length;i++){
        let fila = data[i]
        data_rodeos.push(processHerd(fila))
    }
    return data_rodeos
}
export async function getAll(cabid=null) {
    let ruta = `${RUTA_JAVA}${RUTA_RODEOS}/all`
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


    let procesada = processHerds(data_all)
    procesada = procesada.filter(r=>r.active)
    return procesada
}
export async function getHerdlId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_RODEOS}/${id}`
    let user = getUser();
    let token = user.token;
    let options = {
        headers: {
            
            "Authorization": `Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta,options)
    let data_all = await res_all.json()
    let procesada = processHerds(data_all)
    return procesada
}
function postData(data) {
    let data_lot = {
        name: data.nombre,
        
        establishmentId: 1
    }
    
    return data_lot
}
export async function saveHerd(data) {
    let ruta = `${RUTA_JAVA}${RUTA_RODEOS}`
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
export async function editHerd(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_RODEOS}/${id}`

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
export async function eliminarHerd(id) {
    let ruta = `${RUTA_JAVA}${RUTA_RODEOS}/delete/${id}`
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