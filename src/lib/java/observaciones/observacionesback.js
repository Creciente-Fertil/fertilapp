import { getUser } from "$lib/userstorage/usersotrage"
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_OBSERVACIONES = "comments"
function processComment(comment){
    let data_comm = {
        id:comment.commentId,
        fecha:comment.observationDate,
        animal:comment.animalId,
        observacion :comment.notes,
        active:comment.isActive,
        expand:{
            animal:{
                id:comment.animalId,
                caravana:comment.animalTagNumber
            }
        }
    }
    return data_comm
}
function processComments(data){
    let data_comments = []
    for(let i = 0;i<data.length;i++){
        let fila = data[i]
        data_comments.push(processComment(fila))
    }
    return data_comments
}
export async function getAll(cabid=null) {
    let user = getUser();
    let token = user.token;

    let ruta = `${RUTA_JAVA}${RUTA_OBSERVACIONES}/all`
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


    let procesada = processComments(data_all)
    procesada = procesada.filter(c => c.active)
    return procesada
}
export async function getCommentId(id){
    let ruta = `${RUTA_JAVA}${RUTA_OBSERVACIONES}/${id}`
    let user = getUser();
    let token = user.token;
    let options = {
        headers:{
            "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
        }
    }
    let res_all = await fetch(ruta)
    let data_all = await res_all.json()
    let procesada = processComment(data_all)
    return procesada
}
function postData(data){
    let data_comment = {
          observationDate: data.fecha.split(" ")[0],
          animalId: data.animal,
          notes: data.observacion,
          establishmentId: 1
    }
    return data_comment
}
export async function saveComment(data) {
    let ruta = `${RUTA_JAVA}${RUTA_OBSERVACIONES}`
    let data_birth = postData(data)
    let user = getUser();
    let token = user.token;
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
export async function editComment(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_OBSERVACIONES}/${id}`

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
export async function eliminarComment(id) {
    let ruta = `${RUTA_JAVA}${RUTA_OBSERVACIONES}/delete/${id}`
    let user = getUser();
    let token = user.token;


    let res_post = await fetch(ruta,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        }
    )

    //let data_post = await res_post.json()

    return {}
}