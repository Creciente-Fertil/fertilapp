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
    import DetalleMovimiento from "$lib/components/pesajes/DetalleMovimiento.svelte";
    import DetallesAnimalesMovimiento from "$lib/components/pesajes/DetallesAnimalesMovimiento.svelte";

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
    let animal = $state({})
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
    
    onMount(async () => {
        loadDetalle();
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
    });
    function quitarAnimal(id){

    }
    function verAnimal(id) {
        let a_idx = selectanimales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = selectanimales[a_idx];
            veranimal.showModal();
        }
    }
    let classbuscador = "container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4";
    let classmove = "container mx-auto py-3 px-4 max-w-6xl w-full";
</script>

<Navbar2>
    <div class={classmove}>
    
        <DetalleMovimiento
            {fecha}
            pesajegeneral={pesogeneral}
        />
        <DetallesAnimalesMovimiento
            bind:selectanimales
            {quitarAnimal}
            {verAnimal}
            
            abierta={false}
        />
        <div
            class="mt-6 flex space-x-3 justify-start md:justify-end border-t dark:border-gray-800"
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
            <!-- Botón Guardar -->
            <button
                class="
                    mt-2 px-10 py-2 bg-[#115642] text-white
                    font-medium rounded-full
                    shadow-sm hover:bg-green-700
                    transition-colors text-base
                    "
                onclick={mover}
            >
                Crear {selectanimales.length > 1 ? "pesajes" : "pesaje"}
            </button>
        </div>
    </div>
    <div class="hidden container mx-auto py-6 px-4 max-w-7xl">
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
    <div class="hidden container mx-auto py-6 px-4 max-w-7xl">
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
    <div class="hidden container mx-auto py-6 px-4 max-w-7xl">
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
<dialog id="veranimal" class="modal modal-middle rounded-xl">
    <div
        class="
            modal-box w-11/12 max-w-6xl
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
        <h3 class="text-xl font-bold">Ver animal</h3>
        <InfoAnimal {animal} forcedOpen={true} />
    </div>
</dialog>