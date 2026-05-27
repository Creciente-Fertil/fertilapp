import { getUser } from "$lib/userstorage/usersotrage"
import { handleAuthenticatedRequest } from "../errores/erroresback"
let ruta_java = import.meta.env.VITE_RUTA_JAVA_SERVER;
let ruta_local_java = import.meta.env.VITE_RUTA_LOCAL_JAVA_SERVER;
let bd_local = import.meta.env.VITE_LOCAL_BD=="si";
let RUTA_JAVA =bd_local? ruta_local_java:ruta_java;
const RUTA_NACIMIENTOS = "notifications"
function processNotificacion(birth){
}