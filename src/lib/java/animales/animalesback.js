import { getUser } from "$lib/userstorage/usersotrage"
const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_ANIMALES = "animals"
function null2string(param) {
    return param ? param : ""
}
function string2null(param) {
    return param && param.length>0 ? param : null
}
function processAnimal(animal) {
    let data_animal = {

        id: animal.animalId,
        caravana: animal.tagNumber,
        active: animal.isActive,
        delete: false,
        fechanacimiento: null2string(animal.birthDate),
        sexo: animal.sex == "F" ? "H" : "M",
        nacimiento: null2string(animal.birthId),
        peso: animal.currentWeight,
        cab: animal.establishmentId,
        rodeo: null2string(animal.herdId),
        fechafallecimiento: animal.deathDate,
        lote: null2string(animal.lotId),
        categoria: null2string(animal.categoryId),
        prenada: animal.reproductiveStatus,
        motivobaja: "",
        raza: animal.breed,
        color: animal.color,
        rp: animal.rpCode,
        created: animal.creationDate,
        updated: animal.updateDate,
        expand: {
            lote: {
                id: animal.lotId,
                nombre: animal.lotName
            },
            rodeo: {
                id: animal.herdId,
                nombre: animal.herdName
            },
            nacimiento: {
                id: animal.birthId,
                fecha: animal.birthDate
            }
        }


    }
    return data_animal
}
function processAnimales(data) {
    let data_animales = []
    for (let i = 0; i < data.length; i++) {
        let fila = data[i]
        data_animales.push(processAnimal(fila))
    }
    return data_animales
}
export async function getAll(cabid=null) {

    let user = getUser();
    let token = user.token;

    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/all`
    // 1. Construir la URL base
    let url = new URL(ruta);

    // 2. Agregar los parámetros de consulta solo si tienen valor
    // Spring ignorará los null/undefined, pero es mejor no enviarlos para limpiar la URL
    if (cabid) {
        url.searchParams.append('establishmentId', cabid);
    }
    let options = {
        headers: {
            //"Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    
    let res_all = await fetch(url.toString(), options)

    let data_all = await res_all.json()


    let procesada = processAnimales(data_all)

    return procesada
}
export async function getAnimalId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/${id}`
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
    let procesada = processAnimal(data_all)
    return procesada
}
function postData(data, establishmentId = 1) {
    let data_animal = {
        tagNumber: data.caravana,
        sex: data.sexo == "H" ? "F" : "M",
        rpCode: data.rp,
        establishmentId,
        birthDate: data.fechanacimiento ? data.fechanacimiento.split(" ")[0] : ""
    }
    return data_animal
}
function updateData(animal) {
    let data_animal = {
        
        tagNumber: animal.caravana,
        birthDate: string2null(animal.fechanacimiento),
        sex:animal.sexo == "H" ? "F" : "M",
        deathDate: string2null(animal.fechafallecimiento),
        reproductiveStatus: animal.prenada,
        categoryId: string2null(animal.categoria),
        breed: string2null(animal.raza),
        color: string2null(animal.color),
        rpCode: animal.rp,

        establishmentId: animal.cab,
        birthId: string2null(animal.nacimiento),
        herdId: string2null(animal.rodeo),
        
        lotId: string2null(animal.lote),

        deathReason: string2null(animal.motivobaja)
    }
    return data_animal
}
export async function saveAnimal(data, establishmentId = 1) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}`
    let data_animal = postData(data, establishmentId)
    let user = getUser();
    let token = user.token;
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_animal), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    let data_save = await res_save.json()
    let animal = processAnimal(data_save)
    return animal

}
export async function editAnimal(id, data) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/${id}`

    let user = getUser();
    let token = user.token;
    let data_animal = updateData(data)
    let res_post = await fetch(ruta,
        {
            method: "PUT",
            body: JSON.stringify(data_animal), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        }
    )

    let data_post = await res_post.json()
    return data_post
}
export async function eliminarAnimal(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/delete/${id}`
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