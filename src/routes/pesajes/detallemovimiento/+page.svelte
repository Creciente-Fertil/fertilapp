<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Swal from "sweetalert2";
    import PocketBase from "pocketbase";
    import ListadoAnimales from "$lib/components/pesajes/ListadoAnimales.svelte";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import { onMount } from "svelte";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import { guardarHistorial } from "$lib/historial/lib";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { getPermisosCabUser } from "$lib/permisosutil/lib";
    import { createUserer } from "$lib/stores/user.svelte";
    import { goto } from "$app/navigation";

    import InfoAnimal from "$lib/components/InfoAnimal.svelte";
    import estilos from "$lib/stores/estilos";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let caber = createCaber();
    let userer = createUserer();
    let per = createPer();
    let cab = caber.cab;
    let userpermisos = $state([]);
    let usuarioid = $state("");
    let selectanimales = $state([]);
    let selecthashmap = $state({});
    
    //movimento
    let defaultmovimiento = {
        selecthashmap: {},
    };
    let detallemovimiento = $state({
        ...defaultmovimiento,
    });
    let proxymovimiento = createStorageProxy(
        "movimientodetallepesaje",
        defaultmovimiento,
    );
    //movimiento
    let fecha = $state("");
    let nuevospesos = $state({});
    let pesogeneral = $state("");
    let botonhabilitado = $state(true);

    function setDetalle() {
        detallemovimiento.selecthashmap = selecthashmap;
        proxymovimiento.save(detallemovimiento);
    }
    function loadDetalle() {
        detallemovimiento = proxymovimiento.load();
        selecthashmap = detallemovimiento.selecthashmap;
        selectanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                selectanimales.push({ ...value, pesonuevo: value.peso });
            }
        }
    }
    function cambioPesoGeneral() {
        pesogeneral = Math.max(0, pesogeneral);
        for (let i = 0; i < selectanimales.length; i++) {
            selectanimales[i].pesonuevo = pesogeneral;
        }
    }
    function volver() {
        goto(pre + "/pesajes");
    }
    async function mover() {
        let errores = false;
        let pesajeserror = [];
        for (let i = 0; i < selectanimales.length; i++) {
            let ps = selectanimales[i];

            try {
                let dataupdate = {
                    peso: ps.pesonuevo,
                };
                let data = {
                    pesonuevo: ps.pesonuevo,
                    pesoanterior: ps.peso,
                    fecha: fecha + " 03:00:00",
                    animal: ps.id,
                };
                await guardarHistorial(pb, selectanimales[i].id);
                let r = await pb
                    .collection("animales")
                    .update(selectanimales[i].id, dataupdate);
                await pb.collection("pesaje").create(data);
            } catch (err) {
                pesajeserror.push(ps.id);
                console.error(err);
                errores = true;
            }
        }
        if (errores) {
            Swal.fire(
                "Error pesaje",
                "Hubo algun error en algun pesaje",
                "error",
            );
        } else {
            Swal.fire(
                "Éxito pesaje",
                "Se lograron registar todos los pesajes",
                "success",
            );
        }

        for (let i = 0; i < selectanimales.length; i++) {
            let ps = selectanimales[i];
            let i_error = pesajeserror.findIndex((pid) => pid == ps.id);
            if (i_error == -1) {
                delete selecthashmap[ps.id];
            }
        }
        setDetalle();
        volver();
    }
    function verAnimal(id){

    }
    onMount(async () => {
        loadDetalle();
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
    });
</script>

<Navbar2>
    <div class="container mx-auto py-6 px-4 max-w-7xl">
        <!--Header-->
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            >
                <div
                    class={`
                        bg-transparent        
                        px-4 py-4 
                    `}
                >
                    <button onclick={volver}>
                        <h1
                            class={`
                                flex text-left
                                text-2xl font-bold 
                                dark:text-white text-gray-900
                            `}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-5 mt-1"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>
                            Pesaje
                        </h1>
                    </button>
                </div>
                <button
                    class={`btn btn-primary rounded-lg ${estilos.btntext2}`}
                    data-theme="forest"
                    disabled={!botonhabilitado}
                    onclick={mover}
                >
                    {#if esCelu}
                        <span class="text-lg">Movimientos</span>
                    {:else}
                        <span class="text-lg">+ Crear movimientos</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
    <div class="container mx-auto py-6 px-4 max-w-7xl">
        <!--Header-->
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <label for="fechapesaje" class="label">
                <span class="label-text text-base">Fecha </span>
            </label>
            <label class="input-group">
                <input
                    id="fechapesaje"
                    type="date"
                    max={HOY}
                    class={`
                    input input-bordered w-full
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 
                    focus:ring-green-500 
                    focus:border-green-500
                    ${estilos.bgdark2} 
                `}
                    bind:value={fecha}
                />
            </label>
            <label for="fechapesaje" class="label">
                <span class="label-text text-base">Peso general </span>
            </label>
            <label class="input-group">
                <input
                    id="pesogeneral"
                    type="text"
                    class={`
                    input input-bordered w-full
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 
                    focus:ring-green-500 
                    focus:border-green-500
                    ${estilos.bgdark2} 
                `}
                    bind:value={pesogeneral}
                    oninput={cambioPesoGeneral}
                />
            </label>
        </div>
    </div>
    <div class="container mx-auto py-6 px-4 max-w-7xl">
        <!--Header-->
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <ListadoAnimales bind:selectanimales />
        </div>
    </div>
</Navbar2>
