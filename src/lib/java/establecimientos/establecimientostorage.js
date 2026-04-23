import { browser } from "$app/environment"


let defaultcab = {
    exist: false,
    nombre: "",
    id: "",
}
let defaultper={
    permisos:"",
    //ID del usuario
    id:""
}
export function saveStorageEstablecimiento(data) {
    let storageKey = "establecimiento"
    localStorage.setItem(storageKey, JSON.stringify(data));
}
export function loadStorageEstablecimiento() {
    let storageKey = "establecimiento"
    if (browser) {
        const data = localStorage.getItem(storageKey);
        if (data) {
            try {
                const parsedData = JSON.parse(data);

                const mergedData = { ...defaultcab, ...parsedData };

                localStorage.setItem(storageKey, JSON.stringify(mergedData));
                return mergedData;
            } catch (e) {
                console.error("Error parseando", storageKey, e);
                localStorage.setItem(storageKey, JSON.stringify(defaultcab));
                return structuredClone(defaultcab);
            }
        }
        else {
            localStorage.setItem(storageKey, JSON.stringify(defaultcab));
            return structuredClone(defaultcab);
        }


    }
    else {
        return structuredClone(defaultObj);
    }
}
export function saveStoragePermiso(data) {
    let storageKey = "permisos"
    localStorage.setItem(storageKey, JSON.stringify(data));
}
export function loadStoragePermiso() {
    let storageKey = "permisos"
    if (browser) {
        const data = localStorage.getItem(storageKey);
        if (data) {
            try {
                const parsedData = JSON.parse(data);

                const mergedData = { ...defaultcab, ...parsedData };

                localStorage.setItem(storageKey, JSON.stringify(mergedData));
                return mergedData;
            } catch (e) {
                console.error("Error parseando", storageKey, e);
                localStorage.setItem(storageKey, JSON.stringify(defaultcab));
                return structuredClone(defaultcab);
            }
        }
        else {
            localStorage.setItem(storageKey, JSON.stringify(defaultcab));
            return structuredClone(defaultcab);
        }


    }
    else {
        return structuredClone(defaultObj);
    }
}