import { getUser } from "$lib/userstorage/usersotrage"
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_NACIMIENTOS = "births"
function processNacimiento(birth){
    let data_nacimiento = {
        id:birth.birthId,
        fecha:birth.date,
        caravana:birth.animalTagNumber,
        madre:birth.motherId,
        padre:birth.fatherId,
        nombremadre:birth.motherTagNumber,
        nombrepadre:birth.fatherTagNumber,
        observacion :birth.notes,
        cab:birth.establishmentId,
        expadnd:{
            madre:{
                id:birth.motherId,
                nombre:birth.motherTagNumber
            },
            padre:{
                id:birth.fatherId,
                nombre:birth.fatherTagNumber
            },
        }
    }
    return data_nacimiento
}
function processNacimientos(data){
    let data_nacimientos = []
    for(let i = 0;i<data.length;i++){
        let fila = data[i]
        data_nacimientos.push(processNacimiento(fila))
    }
    return data_nacimientos
}
export async function getAll(cabid=null) {
    let user = getUser();
    let token =  user.token;

    let ruta = `${RUTA_JAVA}${RUTA_NACIMIENTOS}/all`
    let url = new URL(ruta)
    if (cabid) {
        url.searchParams.append('establishmentId', cabid);
    }
    let options = {
        headers:{
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        }
    }
    let res_all = await fetch(url.toString(),options)

    let data_all = await res_all.json()


    let procesada = processNacimientos(data_all)

    return procesada
}
export async function getBirthId(id){
    let ruta = `${RUTA_JAVA}${RUTA_NACIMIENTOS}/${id}`
    let user = getUser();
    let token =  user.token;
    let options = {
        headers:{
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta)
    let data_all = await res_all.json()
    let procesada = processNacimiento(data_all)
    return procesada
}
function postData(data,establishmentId=1){
    
    let data_nacimiento = {
          date: data.fecha.split(" ")[0],
          motherId: data.madre,
          fatherId: data.padre,
          notes: data.observacion,
          establishmentId
    }
    
    return data_nacimiento

}
export async function saveBirth(data) {
    let ruta = `${RUTA_JAVA}${RUTA_NACIMIENTOS}`
    
    let data_birth = postData(data)
    

    let user = getUser();
    let token =  user.token;

    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_birth), // data can be `string` or {object}!
        headers: {
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        },
    })

    let data_save = await res_save.json()

    return data_save

}
export async function editNacimiento(id,data) {
    let ruta = `${RUTA_JAVA}${RUTA_NACIMIENTOS}/${id}`
        let user = getUser();
        let token =  user.token;
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
export async function eliminarNacimiento(id){
    let ruta = `${RUTA_JAVA}${RUTA_NACIMIENTOS}/delete/${id}`
        let user = getUser();
        let token =  user.token;
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