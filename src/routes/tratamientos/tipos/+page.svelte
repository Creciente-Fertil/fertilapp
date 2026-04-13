<script>
    import estilos from "$lib/stores/estilos";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Swal from "sweetalert2";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createUserer } from "$lib/stores/user.svelte";
    import { createPer } from "$lib/stores/permisos.svelte";
    import BuscadorTipos from "$lib/components/tratamientos/BuscadorTipos.svelte";

    import { createStorageProxy } from "$lib/filtros/filtros";
    import TablaTipos from "$lib/components/tratamientos/TablaTipos.svelte";
    import { getPermisosCabUser } from "$lib/permisosutil/lib";
    import { getPermisosList } from "$lib/permisosutil/lib";

    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let caber = createCaber();
    let userer = createUserer();
    let per = createPer();
    let cab = caber.cab;
    let userpermisos = $state([]);
    let usuarioid = $state("");
    let defaulttipos = {
        tipos: [],
    };

    let detallestipos = $state({
        ...defaulttipos,
    });
    let proxy = createStorageProxy("detallestipos", defaulttipos);
    let buscador = $state("");
    //datos
    let tipotratamientos = $state([]);
    let isOpenForm = $state(false);

    let idtipo = $state("");
    let nombretipo = $state("");

    //validaciones
    let botontipo = $state(false);

    //Paginacion
    let rows = $state([]);
    let pageSize = $state(15);
    let paginaActual = $state(1);

    function isEmpty(str) {
        return !str || str.length === 0;
    }
    function validarBotonTipo() {
        botontipo = true;
        if (isEmpty(nombretipo)) {
            botontipo = false;
        }
    }
    function openEditTipoModal(id) {
        idtipo = id;
        let idx_tipo = tipotratamientos.findIndex((tp) => tp.id == id);
        if (idx_tipo != -1) {
            let tipotratamiento = tipotratamientos[idx_tipo];
            nombretipo = tipotratamiento.nombre;

            isOpenForm = true;
        }
    }
    function nuevoTipo() {
        if (isOpenForm) {
            isOpenForm = false;
        } else {
            idtipo = "";
            nombretipo = "";
            isOpenForm = true;
        }
    }
    async function guardarTipo() {
        if (idtipo == "") {
            try {
                let data = {
                    nombre: nombretipo,
                    active: true,
                    cab: cab.id,
                };
                const record = await pb
                    .collection("tipotratamientos")
                    .create(data);
                tipotratamientos.push(record);
                tipotratamientos.sort((tp1, tp2) =>
                    tp1.nombre.toLocaleLowerCase() >
                    tp2.nombre.toLocaleLowerCase()
                        ? 1
                        : -1,
                );
                saveTipos();
                Swal.fire(
                    "Exito guardar",
                    "Se logró guardar el tipo",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se logró guardar el tipo",
                    "error",
                );
            }
        } else {
            await editarTipo();
        }
    }
    async function editarTipo() {
        try {
            let data = {
                nombre: nombretipo,
            };
            const record = await pb
                .collection("tipotratamientos")
                .update(idtipo, data);
            let item = { ...data, id: idtipo };
            tipotratamientos = tipotratamientos.filter(
                (tp) => tp.id != idtipotratamiento,
            );
            tipotratamientos.push(item);
            tipotratamientos.sort((tp1, tp2) =>
                tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                    ? 1
                    : -11,
            );
            saveTipos();
            Swal.fire("Exito editar", "Se logró editar el tipo", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error editar", "No se logró editar el tipo", "error");
        }
    }
    async function eliminarTipo(id) {
        idtipo = id;
        try {
            let data = {
                active: false,
            };
            const record = await pb
                .collection("tipotratamientos")
                .update(idtipotratamiento, data);
            tipotratamientos = tipotratamientos.filter(
                (tp) => tp.id != idtipotratamiento,
            );
            tipotratamientos.sort((tp1, tp2) =>
                tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                    ? 1
                    : -11,
            );
            saveTipos();
            Swal.fire("Exito eliminar", "Se logró eliminar el tipo", "success");
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error eliminar",
                "No se logró eliminar el tipo",
                "error",
            );
        }
    }
    function loadTipos() {
        detallestipos = proxy.load();
        tipotratamientos = detallestipos.tipos;
    }
    function saveTipos() {
        detallestipos.tipos = tipotratamientos;
        proxy.save(detallestipos);
    }
    onMount(async () => {
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        loadTipos();
    });
</script>

<Navbar2>
    <div
        class="
            container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4
            "
    >
        <a
            href={`${pre + "/tratamientos"}`}
            class="
                inline-flex items-center text-sm
                text-gray-700 hover:text-gray-900 dark:text-gray-400
                dark:hover:text-gray-200 mb-4"
        >
            <svg
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            Volver a tratamientos
        </a>
    </div>
    <BuscadorTipos
        nuevo={nuevoTipo}
        editar={editarTipo}
        bind:buscador
        bind:idtipo
        bind:nombretipo
        {isOpenForm}
    />
    <!--Tabla-->
    <div
        class={`
                w-full xl:w-3/4 md:grid
                mx-auto py-1 px-4 max-w-7xl  
            `}
    >
        <div
            class={`
                    overflow-hidden rounded-xl
                    border dark:border-gray-700
                `}
        >
            <TablaTipos 
            
            {idtipo}
            bind:nombretipo
            {isOpenForm}
            tiposrows={tipotratamientos} 

            />
        </div>
    </div>
</Navbar2>
<dialog
    id="tiposmodal"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box max-w-xl w-11/12
            bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-xl font-bold">
            {idtipo.length > 0 ? "Editar " : "Nuevo "}tipo tratamientos
        </h3>
        <div class="modal-action justify-start">
            <button class="btn btn-success text-white">Editar</button>
            <button class="btn btn-error text-white">Eliminar</button>
            <button
                class={`
                    btn 
                    bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                    ${estilos.btnsecondary}`}>Cerrar</button
            >
        </div>
    </div>
</dialog>
