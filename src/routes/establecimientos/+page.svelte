<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import estilos from "$lib/stores/estilos";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { goto } from "$app/navigation";
    import HorizontalTab from "$lib/components/establecimiento/HorizontalTab.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import Plus from "$lib/svgs/plus.svelte";
    //Permisos
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { usuario } from "$lib/stores/usuario";
    import ListaEstablecimientos from "$lib/components/establecimientos/ListaEstablecimientos.svelte";
    import { getAll } from "$lib/java/establecimientos/establecimientosback";
    let esdev = import.meta.env.VITE_DEV == "si";
    let versionjava = $state(false);
    async function toggleJava() {
        versionjava = !versionjava;
        await getEstablecimientos()
    }
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let establecimientos = $state([]);
    let establecimientoscolab = $state([]);
    let totales = $state([]);
    let totalescolab = $state([]);
    let usuarioid = $state("");
    let caber = createCaber();
    let cab = $state({});
    //Pestañas
    let pestañas = $state([
        { id: "propios", nombre: "Tus establecimiento" },
        { id: "ajenos", nombre: "Establecimientos asociados" },
    ]);
    let tab = $state("propios");
    //Guardar establecimiento
    async function irEstablecimientoColab(id) {
        let per = createPer();
        let est = establecimientoscolab.filter((e) => e.id == id)[0];
        let permisos = await getPermisosCabUser(
            pb,
            usuarioid,
            est.expand.cab.id,
        );
        caber.setCab(est.expand.cab.nombre, est.expand.cab.id);
        //Aca debo poner los permisos correctos
        per.setPer(permisos.permisos, usuarioid);

        goto(pre + "/");
    }
    function irEstablecimiento(id) {
        let per = createPer();

        let est = establecimientos.filter((e) => e.id == id)[0];

        caber.setCab(est.nombre, est.id);
        per.setPer("0,1,2,3,4,5", usuarioid);
        goto(pre + "/");
    }
    function crearEstablecimiento() {
        goto(pre + "/establecimientos/nuevo");
    }
    async function getTotalAnimales(cabid) {
        const record = await pb.collection("animales").getList(1, 2, {
            filter: `active=True && delete=false && cab='${cabid}'`,
        });
        return record.totalItems;
    }
    async function eliminar(id) {
        Swal.fire({
            title: "Eliminar establecimiento",
            text: "¿Seguro que deseas eliminar el establecimiento?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                let data = { active: false };
                try {
                    await pb.collection("cabs").update(id, data);
                    Swal.fire(
                        "Éxito",
                        "Se pudo eliminar el establecimiento",
                        "success",
                    );
                } catch (err) {
                    Swal.fire(
                        "Error eliminar",
                        "No se pudo eliminar el establecimiento",
                        "error",
                    );
                }
                const records = await pb.collection("cabs").getFullList({
                    filter: `active = True && user = '${usuarioid}'`,
                });

                establecimientos = records;
                totales = [];
                for (let i = 0; i < establecimientos.length; i++) {
                    totales.push(
                        await getTotalAnimales(establecimientos[i].id),
                    );
                }
            }
        });
    }
    async function getEstablecimientosColab() {
        const restxcolab = await pb.collection("estxcolabs").getFullList({
            filter: `colab.user = '${usuarioid}' && cab.active = true`,
            expand: "colab,cab",
        });
        establecimientoscolab = restxcolab;

        for (let i = 0; i < establecimientoscolab.length; i++) {
            totalescolab.push(
                await getTotalAnimales(establecimientoscolab[i].expand.cab.id),
            );
        }
    }
    async function getEstablecimientos() {
        if (!versionjava) {
            const records = await pb.collection("cabs").getFullList({
                filter: `active = True && user = '${usuarioid}'`,
            });
            establecimientos = records;

            for (let i = 0; i < establecimientos.length; i++) {
                totales.push(await getTotalAnimales(establecimientos[i].id));
            }
        } else {
            let records = await getAll();
            establecimientos = records;
            for (let i = 0; i < establecimientos.length; i++) {
                totales.push(0);
            }
        }
    }
    onMount(async () => {
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        cab = caber.cab;
        await getEstablecimientos();
        await getEstablecimientosColab();
    });
</script>

<Navbar2>
    <div class="container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4">
        <HorizontalTab bind:pestañas bind:tab />

        {#if tab == "propios"}
            <!--Header-->
            <div
                class={`
                    rounded-xl p-1 shadow-2xl mb-0
                    dark:bg-slate-900 bg-white
                    px-2
                    my-2
                `}
            >
                <div
                    class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 mb-2"
                >
                    <div
                        class={`
                            bg-transparent
                            py-2
                        `}
                    >
                        <h1
                            class={`
                                text-3xl font-semibold 
                                dark:text-white text-gray-900
                            `}
                        >
                            Tus establecimientos
                        </h1>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <Success onclick={crearEstablecimiento} conhijo={true}>
                            <Plus size="size-4" margenes="" />
                            Nuevo
                        </Success>
                    </div>
                    {#if esdev}
                        <div class="flex flex-wrap gap-2">
                            <Success onclick={toggleJava} conhijo={true}>
                                {#if versionjava}
                                    cerrar java
                                {:else}
                                    ver java
                                {/if}
                            </Success>
                        </div>
                    {/if}
                </div>
            </div>
            <div
                class={`
                    w-full grid grid-cols-1
                    mx-auto py-4 px-0 max-w-7xl
                `}
            >
                <ListaEstablecimientos
                    {establecimientos}
                    {eliminar}
                    {irEstablecimiento}
                    {cab}
                    {totales}
                />
            </div>
            <div class="hidden grid grid-cols-1 gap-2">
                {#each establecimientos as e, i}
                    <div class="flex items-center justify-center">
                        <div
                            class={`
                            bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2 w-full 
                            max-w-5xl
                    `}
                        >
                            <h1 class="text-2xl font-bold mb-1 text-start p-2">
                                {e.nombre}
                            </h1>
                            <div class="p-2 grid grid-cols-3 lg:grid-cols-6">
                                <span class="text-xl font-semibold text-start"
                                    >Direccion:</span
                                >

                                <span class="text-xl font-medium text-end"
                                    >{e.direccion}</span
                                >
                            </div>
                            <div class="p-2 grid grid-cols-3 lg:grid-cols-6">
                                <span class="text-xl font-semibold text-start"
                                    >Animales:</span
                                >

                                <span class="text-xl font-medium text-end"
                                    >{totales[i]}</span
                                >
                            </div>
                            <div class="p-2">
                                <button
                                    onclick={() => irEstablecimiento(e.id)}
                                    class={`mt-3  hover:text-gray-500 dark:hover:text-gray-600 inline-flex items-center `}
                                    >Ir establecimiento
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        class="w-4 h-4 ml-2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>
                            {#if e.id != cab.id}
                                <button
                                    aria-label="Eliminar"
                                    onclick={() => eliminar(e.id)}
                                    class={`
                                flex 
                                items-center p-2
                                rounded-full 
                                focus:ring-offset-2 transition-colors duration-300 focus:outline-none focus:ring-2
                                bg-red-600 text-white hover:bg-red-700  focus:ring-red-500 
                                
                                
                            `}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="size-6"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                        />
                                    </svg>
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            {#if establecimientoscolab.length != 0}
                <!--Header-->
                <div
                    class={`
                    rounded-xl p-1 shadow-2xl mb-0
                    dark:bg-slate-900 bg-white
                    px-2
                    my-2
                `}
                >
                    <div
                        class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 mb-2"
                    >
                        <div
                            class={`
                            bg-transparent
                            py-2
                        `}
                        >
                            <h1
                                class={`
                                text-3xl font-semibold 
                                dark:text-white text-gray-900
                            `}
                            >
                                Establecimientos asociados
                            </h1>
                        </div>
                    </div>
                </div>
            {/if}
            <div
                class={`
                    w-full grid grid-cols-1
                    mx-auto py-4 px-0 max-w-7xl
                `}
            >
                <ListaEstablecimientos
                    esColab={true}
                    establecimientos={establecimientoscolab}
                    irEstablecimiento={async () =>
                        await irEstablecimientoColab(e.id)}
                    {cab}
                    {totales}
                />
            </div>
            <div class="hidden grid grid-cols-1 gap-2">
                {#if establecimientoscolab.length != 0}
                    {#each establecimientoscolab as e, i}
                        <div class="flex items-center justify-center">
                            <div
                                class={`
                        bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2 w-full 
                        max-w-5xl
                `}
                            >
                                <h1
                                    class="text-2xl font-bold mb-1 text-start p-2"
                                >
                                    {e.expand.cab.nombre}
                                </h1>
                                <div
                                    class="p-2 grid grid-cols-3 lg:grid-cols-6"
                                >
                                    <span
                                        class="text-xl font-semibold text-start"
                                        >Direccion:</span
                                    >

                                    <span class="text-xl font-medium text-end"
                                        >{e.expand.cab.direccion}</span
                                    >
                                </div>
                                <div
                                    class="p-2 grid grid-cols-3 lg:grid-cols-6"
                                >
                                    <span
                                        class="text-xl font-semibold text-start"
                                        >Animales:</span
                                    >

                                    <span class="text-xl font-medium text-end"
                                        >{totalescolab[i]}</span
                                    >
                                </div>
                                <div class="p-2">
                                    <button
                                        onclick={async () =>
                                            await irEstablecimientoColab(e.id)}
                                        class={`mt-3  hover:text-gray-500 dark:hover:text-gray-600 inline-flex items-center `}
                                        >Ir establecimiento
                                        <svg
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            class="w-4 h-4 ml-2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M5 12h14M12 5l7 7-7 7"
                                            ></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        {/if}
    </div>
</Navbar2>
