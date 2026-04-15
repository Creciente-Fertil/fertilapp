<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import Lote from "$lib/svgs/lote.svelte";
    import Danger from "$lib/components/botones/Danger.svelte";
    import Secondary from "$lib/components/botones/Secondary.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import { saveLot } from "$lib/java/lotes/lotesback";
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    const pb = new PocketBase(ruta);
    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    let per = createPer();
    let userpermisos = $state([]);
    let slug = $state("");
    let nombre = $state("");
    let edit = $state(false);
    let add = $state(false);
    let animales = $state([]);

    //ver java
    let versionjava = $state(false);

    async function toggleJava() {
        versionjava = !versionjava;
    }
    let defaultLote = {
        id: "",
        nombre: "",
        edit: false,
    };
    let detalleLote = $state({ ...defaultLote });
    let proxyLote = createStorageProxy("detalleLote", defaultLote);

    let usuarioid = $state("");
    function getLote() {
        detalleLote = proxyLote.load();
        nombre = detalleLote.nombre;
        edit = detalleLote.edit;
    }
    onMount(async () => {
        slug = $page.params.slug;
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;

        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);
        per.setPer(respermisos.permisos, usuarioid);

        userpermisos = getPermisosList(per.per.permisos);
        if (slug == "0") {
            add = true;
            nombre = "";
            edit = false;
        } else {
            getLote();
        }
    });
    async function editar() {
        edit = true;
    }
    async function eliminar() {
        try {
            let data = {
                active: false,
            };
            const record = await pb.collection("lotes").update(slug, data);
            goto(`${pre + "/lotes"}`);
            //ver como hago para actualizar la lista
            Swal.fire(
                "Lote eliminada!",
                "Se eliminó el lote correctamente.",
                "success",
            );
        } catch (e) {
            Swal.fire(
                "Acción cancelada",
                "No se pudo eliminar el lote",
                "error",
            );
        }
    }
    async function guardarCambio() {
        try {
            let data = {
                nombre,
            };
            const record = await pb.collection("lotes").update(slug, data);

            Swal.fire("Éxito editar", "Se pudo editar el lote", "success");
            volver();
        } catch (err) {
            console.error(err);
            Swal.fire("Error editar", "No se pudo editar el lote", "error");
        }
    }
    async function guardarNuevo() {
        if (versionjava) {
            let data = {
                nombre,
                active: true,
                cab: 1,
            };
            let res = await saveLot(data);
            Swal.fire("Éxito guardar", "Se pudo guardar el lote", "success");
            volver();
        } else {
            try {
                let data = {
                    nombre,
                    active: true,
                    cab: cab.id,
                };
                let record = await pb.collection("lotes").create(data);

                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el lote",
                    "success",
                );
                volver();
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar el lote",
                    "error",
                );
            }
        }
    }
    async function getAnimales() {}

    async function confirmDelete() {
        Swal.fire({
            title: "Eliminar lote",
            text: "¿Seguro que deseas eliminar el lote?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                await eliminar();
            }
        });
    }
    function volver() {
        if (add) {
            goto(pre + "/lotes");
        }
        if (edit) {
            edit = false;
            return;
        }

        goto(pre + "/lotes");
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <div
        class="
        container mx-auto py-6 px-4 max-w-7xl
        w-full xl:w-3/4
        pb-16
        "
    >
        <a
            href={`${pre + "/lotes"}`}
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
            Volver a lotes
        </a>
        <!--Header-->
        <div
            class={`
            rounded-2xl p-2  mb-2
            dark:bg-slate-900 bg-white
            shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
            dark:shadow-none
            
        `}
        >
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b dark:border-gray-800"
            >
                <div
                    class={`
                        bg-transparent
                        px-3 py-4 
                    `}
                >
                    <button onclick={() => goto(pre + "/lotes")}>
                        <h1
                            class={`
                            flex text-left
                            text-3xl font-medium 
                            ${estilos.subtitle}
                        `}
                        >
                            {add ? "Nuevo" : edit ? "Editar" : "Ver"}
                            Lote
                        </h1>
                    </button>
                    {#if esdev}
                        <button
                            class={`
                            ${estilos.btnbuscador}
                            ${estilos.btntextbuscador}
                        `}
                            onclick={toggleJava}
                        >
                            {#if versionjava}
                                <span class="text-lg">Cerrar java</span>
                            {:else}
                                <span class="text-lg">Ver java</span>
                            {/if}
                        </button>
                    {/if}
                </div>

                <div class="hidden md:block text-[#115642]">
                    <Lote size="size-12" />
                </div>
            </div>
            <!--Detalle-->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-1 p-2 pt-0">
                <div class="col-span-1 md:col-span-2">
                    <label for="datos generales" class="label pt-1">
                        <span
                            class={`label-text font-medium text-lg ${estilos.subtitle}`}
                            >Datos generales</span
                        >
                    </label>
                </div>
                <div class="col-span-1">
                    <label for="nombre" class="label py-0 my-0">
                        <span class="label-text text-sm font-normal"
                            >Nombre</span
                        >
                    </label>
                    {#if add || edit}
                        <input
                            id="nombre"
                            type="text"
                            class={`
                            input input-bordered 
                            w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ps-3
                            ${estilos.bgdark2} 
                        `}
                            bind:value={nombre}
                        />
                    {:else}
                        <label for="nombre" class="label py-0 my-0 ps-3">
                            <span
                                class={`text-lg ${estilos.labelcolor} py-0 my-0`}
                                >{nombre}</span
                            >
                        </label>
                    {/if}
                </div>
            </div>
            <!--FIN Detalle-->
            <div
                class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                {#if add}
                    <Secondary onclick={volver} texto="Volver" />
                    <Success onclick={guardarNuevo} texto="Guardar nuevo" />
                {:else if edit}
                    <Secondary onclick={volver} texto="Cancelar" />
                    <Success onclick={guardarCambio} texto="Guardar edición" />
                {:else}
                    <Danger onclick={confirmDelete} texto="Eliminar" />
                    <Secondary onclick={editar} texto="Editar" />
                {/if}
            </div>
        </div>
    </div>
</Navbar2>
