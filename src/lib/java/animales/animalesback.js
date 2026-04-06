const RUTA_JAVA = "https://test.crecientefertil.com.ar/api/"
const RUTA_ANIMALES = "animals"

function processAnimal(animal) {
    let data_animal = {

        id: animal.animalId,
        caravana: animal.tagNumber,
        active: animal.isActive,
        delete: false,
        fechanacimiento: animal.birthDate,
        sexo: animal.sex == "F" ? "H" : "M",
        nacimiento: animal.birthId,
        peso: 0,
        cab: animal.establishmentId,
        rodeo: animal.herdId,
        fechafallecimiento: animal.deathDate,
        lote: animal.herdId,
        categoria: animal.categoryId,
        prenada: animal.reproductiveStatus,
        motivobaja: "",
        raza: animal.breed,
        color: animal.color,
        rp: animal.rpCode,
        created: animal.creationDate,
        updated: animal.updateDate,

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
export async function getAll() {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/all`

    let res_all = await fetch(ruta)

    let data_all = await res_all.json()


    let procesada = processAnimales(data_all)

    return procesada
}
export async function getAnimalId(id) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}/${id}`
    let res_all = await fetch(ruta)
    let data_all = await res_all.json()
    let procesada = processAnimal(data_all)
    return procesada
}
function postData(data) {
    let data_animal = {
        tagNumber: data.caravana,
        sex: data.sexo == "H" ? "F" : "M",
        rpCode: data.rp,
        establishmentId: 1
    }
    return data_animal
}
export async function saveAnimal(data) {
    let ruta = `${RUTA_JAVA}${RUTA_ANIMALES}`
    let data_animal = postData(data)
    let res_save = await fetch(ruta, {
        method: "POST",
        body: JSON.stringify(data_animal), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
        },
    })
    let data_save = await res_save.json()
    return data_save

}