// Pegamento entre el modelo del front (6 grupos x 1-3 acciones) y el
// catalogo del backend (64 permisos `RESOURCE:ACTION`).
//
// Reglas:
// - Todo permiso del catalogo backend tiene que estar en PERMISSION_MAP
//   en algun grupo/accion. Si no, se "pierde" cuando el usuario hace
//   round-trip por el screen (no es revocado pero queda invisible).
// - Una accion del front se considera "encendida" si TODOS los permisos
//   backend que mapea estan otorgados (ver `permsFromBackend`).

// PERMISSION_GROUPS: grupos de la UI (titulo + acciones).
// Source of truth para los checkboxes que se pintan en el screen.
export const PERMISSION_GROUPS = [
    {
        id: "establecimiento",
        icon: "settings",
        title: "Establecimiento y colaboradores",
        required: true,
        actions: [
            { id: "ver", label: "Ver" },
            { id: "editar", label: "Editar datos del establecimiento" },
            { id: "colabs", label: "Asociar / desasociar colaboradores" },
        ],
    },
    {
        id: "grupos",
        icon: "layers",
        title: "Grupos: lotes y rodeos",
        actions: [
            { id: "ver", label: "Ver" },
            { id: "crear", label: "Crear grupos" },
            { id: "editar", label: "Editar y disolver" },
        ],
    },
    {
        id: "importar",
        icon: "upload",
        title: "Importar archivos",
        actions: [{ id: "importar", label: "Subir e importar archivos" }],
    },
    {
        id: "movimientos",
        icon: "arrows",
        title: "Movimientos masivos",
        actions: [
            { id: "ver", label: "Ver historial" },
            { id: "crear", label: "Crear movimientos" },
        ],
    },
    {
        id: "eventos",
        icon: "calendar",
        title: "Eventos del establecimiento",
        actions: [
            { id: "ver", label: "Ver" },
            { id: "crear", label: "Registrar eventos" },
            { id: "editar", label: "Editar y eliminar" },
        ],
    },
    {
        id: "animales",
        icon: "cow",
        title: "Animales",
        actions: [
            { id: "ver", label: "Ver" },
            { id: "editar", label: "Editar datos básicos" },
            { id: "eliminar", label: "Dar de baja" },
        ],
    },
];

// PERMISSION_MAP: (groupId, actionId) -> array de "RESOURCE:ACTION".
//
// Permisos NO mapeados (intencionalmente admin-only, solo via
// assignRole(ADM)): COLLABORATOR:REMOVE, HERD:DELETE, LOT:DELETE,
// CATEGORY:DELETE, MOVEMENT:DELETE, ESTABLISHMENT:DELETE,
// PERMISSION:VIEW, ROLE:VIEW, ROLE:EDIT, USER_PERMISSION:VIEW,
// USER_PERMISSION:EDIT, AUDIT_LOG:VIEW.
//
// `animales.editar` bundlea ANIMAL:CREATE + ANIMAL:EDIT porque el
// modelo del front no tiene accion "crear" para animales (la legacy
// app las agrupaba).
export const PERMISSION_MAP = {
    establecimiento: {
        ver: [
            "ESTABLISHMENT:VIEW",
            "COLLABORATOR:VIEW",
            "DASHBOARD:VIEW",
            "NOTIFICATION:VIEW",
            "NOTIFICATION:EDIT",
        ],
        editar: ["ESTABLISHMENT:EDIT"],
        colabs: ["COLLABORATOR:INVITE"],
    },
    grupos: {
        ver: ["HERD:VIEW", "LOT:VIEW", "CATEGORY:VIEW"],
        crear: ["HERD:CREATE", "LOT:CREATE", "CATEGORY:CREATE"],
        editar: ["HERD:EDIT", "LOT:EDIT", "CATEGORY:EDIT"],
    },
    importar: {
        importar: ["ANIMAL:IMPORT"],
    },
    movimientos: {
        ver: ["MOVEMENT:VIEW"],
        crear: ["MOVEMENT:CREATE", "MOVEMENT:EDIT"],
    },
    eventos: {
        ver: [
            "BIRTH:VIEW",
            "SERVICE:VIEW",
            "PREGNANCY_CHECK:VIEW",
            "TREATMENT:VIEW",
            "TREATMENT_TYPE:VIEW",
            "COMMENT:VIEW",
            "WEIGHT:VIEW",
        ],
        crear: [
            "BIRTH:CREATE",
            "SERVICE:CREATE",
            "PREGNANCY_CHECK:CREATE",
            "TREATMENT:CREATE",
            "TREATMENT_TYPE:CREATE",
            "COMMENT:CREATE",
            "WEIGHT:CREATE",
        ],
        editar: [
            "BIRTH:EDIT", "BIRTH:DELETE",
            "SERVICE:EDIT", "SERVICE:DELETE",
            "PREGNANCY_CHECK:EDIT", "PREGNANCY_CHECK:DELETE",
            "TREATMENT:EDIT", "TREATMENT:DELETE",
            "TREATMENT_TYPE:EDIT", "TREATMENT_TYPE:DELETE",
            "COMMENT:EDIT", "COMMENT:DELETE",
            "WEIGHT:EDIT", "WEIGHT:DELETE",
        ],
    },
    animales: {
        ver: ["ANIMAL:VIEW"],
        editar: ["ANIMAL:CREATE", "ANIMAL:EDIT"],
        eliminar: ["ANIMAL:DELETE"],
    },
};

// ROLE_PRESETS: 3 + "custom" implicito (cuando los checkboxes no
// coinciden con ningun preset). El roleCode es estable entre DBs y se
// usa para resolver el roleId via `getRoles()` en runtime.
//
// Las permissions de cada preset deben coincidir EXACTAMENTE con lo
// que `permsFromBackend` devuelve para un usuario con ese template,
// si no detectPreset cae a "custom".
export const ROLE_PRESETS = [
    {
        id: "admin",
        roleCode: "ADM",
        name: "Administrador",
        icon: "shield",
        summary: "Control total del establecimiento. Modifica datos del campo y administra colaboradores.",
        permissions: {
            establecimiento: ["ver", "editar", "colabs"],
            grupos: ["ver", "crear", "editar"],
            importar: ["importar"],
            movimientos: ["ver", "crear"],
            eventos: ["ver", "crear", "editar"],
            animales: ["ver", "editar", "eliminar"],
        },
    },
    {
        id: "encargado",
        roleCode: "ENC",
        name: "Encargado",
        icon: "hat",
        summary: "Operativo completo. Puede asociar colaboradores pero no editar datos del establecimiento ni eliminar.",
        permissions: {
            establecimiento: ["ver", "colabs"],
            grupos: ["ver", "crear", "editar"],
            importar: ["importar"],
            movimientos: ["ver", "crear"],
            eventos: ["ver", "crear", "editar"],
            animales: ["ver", "editar"],
        },
    },
    {
        id: "operario",
        roleCode: "OPE",
        name: "Operario",
        icon: "eye",
        summary: "Solo lectura más registro de eventos y pesajes. No edita ni elimina.",
        permissions: {
            establecimiento: ["ver"],
            grupos: ["ver"],
            importar: [],
            movimientos: ["ver"],
            eventos: ["ver", "crear"],
            animales: ["ver"],
        },
    },
];

// permsToBackend: del modelo agrupado del front a Set<permissionId>.
//   grouped: { groupId: ["actionId", ...] }
//   catalog: [{ permissionId, resource, action }, ...]
export function permsToBackend(grouped, catalog) {
    const ids = new Set()
    for (const groupId in grouped) {
        const groupActions = PERMISSION_MAP[groupId] || {}
        for (const actionId of grouped[groupId]) {
            const ras = groupActions[actionId] || []
            for (const ra of ras) {
                const entry = catalog.find(c => `${c.resource}:${c.action}` === ra)
                if (entry) ids.add(entry.permissionId)
            }
        }
    }
    return ids
}

// permsFromBackend: de IDs del catalogo al modelo agrupado del front.
// Una accion se considera "encendida" si TODOS sus permisos backend
// estan presentes (semantica de toggle: o la tiene completa o no).
//   backendIds: number[]
//   catalog: [{ permissionId, resource, action }, ...]
export function permsFromBackend(backendIds, catalog) {
    const ras = new Set()
    for (const id of backendIds) {
        const entry = catalog.find(c => c.permissionId === id)
        if (entry) ras.add(`${entry.resource}:${entry.action}`)
    }

    const grouped = {}
    for (const groupId in PERMISSION_MAP) {
        grouped[groupId] = []
        for (const actionId in PERMISSION_MAP[groupId]) {
            const required = PERMISSION_MAP[groupId][actionId]
            if (required.length > 0 && required.every(ra => ras.has(ra))) {
                grouped[groupId].push(actionId)
            }
        }
    }
    return grouped
}

// detectPreset: si el grouped coincide exacto con un preset, devuelve
// su id; si no, "custom".
export function detectPreset(grouped) {
    for (const preset of ROLE_PRESETS) {
        if (sameGrouped(grouped, preset.permissions)) return preset.id
    }
    return "custom"
}

function sameGrouped(a, b) {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    for (const key of aKeys) {
        const aArr = (a[key] || []).slice().sort()
        const bArr = (b[key] || []).slice().sort()
        if (aArr.length !== bArr.length) return false
        for (let i = 0; i < aArr.length; i++) {
            if (aArr[i] !== bArr[i]) return false
        }
    }
    return true
}
