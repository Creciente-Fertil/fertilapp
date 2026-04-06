import categorias from "$lib/stores/categorias"
export function getCategoriaNombre(id){
    let es = categorias.filter(est=>est.id==id)
    if(es.length>0){
        return es[0].nombre
    }
    else{
        return ""
    }
}