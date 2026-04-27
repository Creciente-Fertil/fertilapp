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
    import {
        deleteEstablishment,
        getAll,
        getAllColabs,
    } from "$lib/java/establecimientos/establecimientosback";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    let esdev = import.meta.env.VITE_DEV == "si";
    let versionjava = $state(false);
    
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
    async function toggleJava() {
        versionjava = !versionjava;
        if(versionjava){
            cab = loadStorageEstablecimiento()
        }
        else{
            cab = caber.cab
        }
        await getEstablecimientos();
        await getEstablecimientosColab()
    }
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
                    if (versionjava) {
                        await deleteEstablishment(id);
                        await getEstablecimientos();
                        await getEstablecimientosColab();
                    } else {
                        await pb.collection("cabs").update(id, data);
                        await getEstablecimientos();
                        await getEstablecimientosColab();
                    }

                    Swal.fire(
                        "Éxito",
                        "Se pudo eliminar el establecimiento",
                        "success",
                    );
                } catch (err) {
                    console.error(err);
                    Swal.fire(
                        "Error eliminar",
                        "No se pudo eliminar el establecimiento",
                        "error",
                    );
                }
            }
        });
    }
    async function getEstablecimientosColab() {
        if (versionjava) {
            totalescolab = []
            establecimientoscolab = await getAllColabs();
            
            for (let i = 0; i < establecimientoscolab.length; i++) {
                totalescolab.push(0);
            }
        
        } else {
            const restxcolab = await pb.collection("estxcolabs").getFullList({
                filter: `colab.user = '${usuarioid}' && cab.active = true`,
                expand: "colab,cab",
            });
            establecimientoscolab = restxcolab;
            totalescolab = []
            for (let i = 0; i < establecimientoscolab.length; i++) {
                totalescolab.push(
                    await getTotalAnimales(
                        establecimientoscolab[i].expand.cab.id,
                    ),
                );
            }
        }
    }
    async function getEstablecimientos() {
        if (!versionjava) {
            const records = await pb.collection("cabs").getFullList({
                filter: `active = True && user = '${usuarioid}'`,
            });
            establecimientos = records;
            totales = []
            for (let i = 0; i < establecimientos.length; i++) {
                totales.push(await getTotalAnimales(establecimientos[i].id));
            }
        } else {
            let records = await getAll();
            establecimientos = records;
            totales = []
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
                    esColab={versionjava?false:true}
                    establecimientos={establecimientoscolab}
                    irEstablecimiento={async () =>
                        await irEstablecimientoColab(e.id)}
                    {cab}
                    {totales}
                />
            </div>
        {/if}
    </div>
</Navbar2>
