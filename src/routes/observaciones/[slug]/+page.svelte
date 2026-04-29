<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import CardObservacion from "$lib/components/observaciones/CardObservacion.svelte";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import { isEmpty, capitalize } from "$lib/stringutil/lib";
    //permisos
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import categorias from "$lib/stores/categorias";
    import DetalleObservaciones from "$lib/components/observaciones/DetalleObservaciones.svelte";
    import { getAll } from "$lib/java/animales/animalesback";
    import Success from "$lib/components/botones/Success.svelte";
    import {
        editComment,
        eliminarComment,
        saveComment,
    } from "$lib/java/observaciones/observacionesback";
    import { getUser } from "$lib/userstorage/usersotrage";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    async function toggleJava() {
        versionjava = !versionjava;

        await getAnimales();
    }
    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    let per = createPer();
    let userpermisos = $state([]);
    let slug = $state("");
    let usuarioid = $state("");
    //animales
    let animales = $state([]);
    let cargadoanimales = $state(false);
    //datos
    let animal = $state("");
    let idobservacion = $state("");
    let caravana = $state("");
    let categoria = $state("");
    let fecha = $state("");
    let observacion = $state("");

    let edit = $state(false);
    let add = $state(false);
    let malfecha = $state(false);
    //detalle observacion
    let defaulobservacion = {
        id: "",
        animal: "",
        caravana: "",
        categoria: "",
        fecha: "",
        observacion: "",
        edit: false,
    };
    let detalleobservacion = $state({ ...defaulobservacion });
    let proxydetalleobservacion = createStorageProxy(
        "detalleobservacion",
        defaulobservacion,
    );

    async function getAnimales() {
        if (versionjava) {
            let recordsa = await getAll();
            animales = recordsa;
            animales.sort((a1, a2) =>
                a1.caravana.toLocaleLowerCase() >
                a2.caravana.toLocaleLowerCase()
                    ? 1
                    : -1,
            );

            cargadoanimales = true;
        } else {
            //Estaria joya que el animal venga con todos los chiches
            const recordsa = await pb.collection("animales").getFullList({
                filter: `cab='${cab.id}'`,
                expand: "nacimiento",
            });
            animales = recordsa;
            animales.sort((a1, a2) =>
                a1.caravana.toLocaleLowerCase() >
                a2.caravana.toLocaleLowerCase()
                    ? 1
                    : -1,
            );

            cargadoanimales = true;
        }
    }
    async function guardarNuevo() {
        if (versionjava) {
            try {
                let data = {
                    animal,
                    fecha: fecha + " 03:00:00",
                    categoria,
                    cab: cab.id,
                    observacion,
                    active: true
                };
                let res_obs = await saveComment(data);

                volver();
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar la observación",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar la observación",
                    "error",
                );
            }
        } else {
            try {
                let data = {
                    animal,
                    fecha: fecha + " 03:00:00",
                    categoria,
                    cab: cab.id,
                    observacion,
                    active: true,
                };
                const record = await pb
                    .collection("observaciones")
                    .create(data);
                volver();
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar la observación",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar la observación",
                    "error",
                );
            }
        }
    }
    async function editar() {
        if (!edit) {
            edit = true;
            return;
        }
        try {
            let data = {
                fecha: fecha + " 03:00:00",
                categoria,
                observacion,
            };
            if (versionjava) {
                let data_java = {
                    animalId: animal,
                    observationDate: fecha,
                    notes: observacion
                };
                await editComment(idobservacion, data_java);
            } else {
                const record = await pb
                    .collection("observaciones")
                    .update(idobservacion, data);
            }
            volver();
            Swal.fire(
                "Éxito editar",
                "Se pudo editar la observación",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error editar",
                "No se pudo editar la observación",
                "error",
            );
        }
    }
    async function eliminar() {
        Swal.fire({
            title: "Eliminar observación",
            text: "¿Seguro que deseas eliminar la observacion?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                let data = {
                    active: false,
                };
                try {
                    if (versionjava) {
                        await eliminarComment(idobservacion);
                    } else {
                        const recordedit = await pb
                            .collection("observaciones")
                            .update(idobservacion, data);
                    }

                    Swal.fire(
                        "Observación eliminada!",
                        "Se eliminó la observación correctamente.",
                        "success",
                    );
                } catch (err) {
                    Swal.fire(
                        "Acción cancelada",
                        "No se pudo eliminar la observacion",
                        "error",
                    );
                    console.error(err);
                }
                goto(pre + "/observaciones");
            }
        });
    }

    async function guardarNuevoAnimal() {}
    function volver() {
        if (edit) {
            edit = false;
            return;
        }
        goto(pre + "/observaciones");
    }
    function loadObservacion() {
        detalleobservacion = proxydetalleobservacion.load();
        idobservacion = detalleobservacion.id;
        animal = detalleobservacion.animal;
        caravana = detalleobservacion.caravana;
        categoria = detalleobservacion.categoria;
        fecha = detalleobservacion.fecha;
        observacion = detalleobservacion.observacion;
        edit = detalleobservacion.edit;
        versionjava = detalleobservacion.versionjava;
        cargado = true;
    }
    async function getData() {
        if (versionjava) {
            slug = $page.params.slug;
            let user_data = getUser();
            usuarioid = user_data.id;
            cab = loadStorageEstablecimiento()
            await getAnimales();
            if (slug == "0") {
                add = true;
            } else {
                loadObservacion();
            }
        } else {
            slug = $page.params.slug;
            let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
            usuarioid = pb_json.record.id;
            let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

            per.setPer(respermisos.permisos, usuarioid);
            userpermisos = getPermisosList(per.per.permisos);
            await getAnimales();
            if (slug == "0") {
                add = true;
            } else {
                loadObservacion();
            }
        }
    }
    onMount(async () => {
        await getData()
    });
</script>

<Navbar2>
    <CardObservacion cardsize="max-w-7xl" {edit} {add}>
        {#if esdev}
            <Success
                texto={versionjava ? "Cerrar java" : "Ver java"}
                onclick={toggleJava}
            />
        {/if}
        <DetalleObservaciones
            {edit}
            {add}
            {caravana}
            {cargadoanimales}
            {animales}
            bind:animal
            bind:fecha
            bind:categoria
            bind:observacion
            {malfecha}
        />
        <!-- Botones alineados a la derecha, más bajos, en la parte inferior -->
        {#if add}
            <div
                class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                <!-- Botón Cancelar -->
                <button
                    class="
                        hidden md:block
                        mt-2 px-10 py-2
                        dark:bg-transparent
                        bg-white
                        text-gray-800
                        dark:text-white
                        font-medium
                        rounded-full shadow-sm border
                        border-gray-300
                        hover:bg-gray-200
                        dark:hover:bg-gray-800
                        transition-colors
                        text-base"
                    onclick={volver}
                >
                    Volver
                </button>
                <!-- Botón Editar -->
                <button
                    class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                    onclick={guardarNuevo}
                >
                    Guardar
                </button>
            </div>
        {:else if edit}
            <div
                class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                <!-- Botón Cancelar -->
                <button
                    class="
                        hidden md:block
                        mt-2 px-10 py-2
                        dark:bg-transparent
                        bg-white
                        text-gray-800
                        dark:text-white
                        font-medium
                        rounded-full shadow-sm border
                        border-gray-300
                        hover:bg-gray-200
                        dark:hover:bg-gray-800
                        transition-colors
                        text-base"
                    onclick={volver}
                >
                    Cancelar
                </button>

                <!-- Botón Editar -->
                <button
                    class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                    onclick={editar}
                >
                    Guardar cambios
                </button>
            </div>
        {:else}
            <div
                class="mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                <button
                    class="mt-2 px-10 py-2 bg-[#A94442] text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-base"
                    onclick={eliminar}
                >
                    Eliminar
                </button>

                <!-- Botón Editar -->
                <button
                    class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                    onclick={editar}
                >
                    Editar
                </button>
            </div>
        {/if}
    </CardObservacion>
</Navbar2>
