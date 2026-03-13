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
    
    import Rodeo from "$lib/svgs/rodeo.svelte";
    import Danger from "$lib/components/botones/Danger.svelte";
    import Secondary from "$lib/components/botones/Secondary.svelte";
    import Success from "$lib/components/botones/Success.svelte";
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
    let animales = $state([]);
    let defaultRodeo = {
        id: "",
        nombre: "",
        edit: false,
    };
    let detalleRodeo = $state({ ...defaultRodeo });
    let proxyLote = createStorageProxy("detalleRodeo", defaultRodeo);

    let usuarioid = $state("");
    function getRodeo() {
        detalleRodeo = proxyLote.load();
        nombre = detalleRodeo.nombre;
        edit = detalleRodeo.edit
    }
    onMount(async () => {
        slug = $page.params.slug;
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;

        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);
        per.setPer(respermisos.permisos, usuarioid);

        userpermisos = getPermisosList(per.per.permisos);
        getRodeo();
    });
    async function editar() {
        edit = true;
    }
    async function eliminar() {}
    async function guardarCambio() {}
    async function getAnimales() {}

    async function confirmDelete() {
        Swal.fire({
            title: "Eliminar rodeo",
            text: "¿Seguro que deseas eliminar el rodeo?",
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
        if (edit) {
            edit = false;
            return;
        }
        goto(pre + "/rodeos");
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
            href={`${pre + "/rodeos"}`}
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
            Volver a rodeos
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
                    <button onclick={() => goto(pre + "/rodeos")}>
                        <h1
                            class={`
                            flex text-left
                            text-3xl font-medium 
                            ${estilos.subtitle}
                        `}
                        >
                            {edit ? "Editar" : "Ver"}
                            Rodeo
                        </h1>
                    </button>
                </div>

                <div class="hidden md:block text-[#115642]">
                    <Rodeo size="size-12" />
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
                    <label for="nombre" class="label py-0 my-0">
                        <span class={`text-lg ${estilos.labelcolor} py-0 my-0`}
                            >{nombre}</span
                        >
                    </label>
                </div>
            </div>
            <!--FIN Detalle-->
            <div
                class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                {#if edit}

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
