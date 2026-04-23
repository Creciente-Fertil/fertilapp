<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import ListadoAnimales from "$lib/components/tratamientos/ListadoAnimales.svelte";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import { onMount } from "svelte";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import { guardarHistorial } from "$lib/historial/lib";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { getPermisosCabUser } from "$lib/permisosutil/lib";
    import { createUserer } from "$lib/stores/user.svelte";
    import { goto } from "$app/navigation";
    import { isEmpty, addDays } from "$lib/stringutil/lib";
    import estilos from "$lib/stores/estilos";
    import InfoAnimal from "$lib/components/InfoAnimal.svelte";
    import DetalleMovimiento from "$lib/components/tratamientos/DetalleMovimiento.svelte";
    import DetallesAnimalesMovimiento from "$lib/components/tratamientos/DetallesAnimalesMovimiento.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import { saveTrata } from "$lib/java/tratamientos/tratamientosback";
    let versionjava = $state(false);
    function toggleJava() {
        versionjava = !versionjava;
    }
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
    let tipotratamientos = $state([]);
    //movimientot
    let defaultmovimiento = {
        selecthashmap: {},
        tipos: [],
        fecha: "",
        tipotratamientoselect: "",
        observaciongeneral: "",
    };
    let detallemovimento = $state({ ...defaultmovimiento });
    let proxymovimiento = createStorageProxy(
        "detallemovimientotrata",
        defaultmovimiento,
    );

    //Valores
    let animal = $state({});
    //movimiento
    let fecha = $state("");
    let tipotratamientoselect = $state("");
    let observaciongeneral = $state("");

    //validacion
    let malfecha = $state(false);
    let maltipo = $state(false);
    let botonhabilitado = $state(false);

    function loadDetalle() {
        detallemovimento = proxymovimiento.load();
        tipotratamientos = detallemovimento.tipos;
        selecthashmap = detallemovimento.selecthashmap;
        fecha = detallemovimento.fecha;
        tipotratamientoselect = detallemovimento.tipotratamientoselect;
        observaciongeneral = detallemovimento.observaciongeneral;
        selectanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                selectanimales.push({
                    ...value,
                    tipotratamiento: tipotratamientoselect,
                    observacionnuevo: observaciongeneral,
                });
            }
        }
    }
    function quitarAnimal(id) {
        if (selecthashmap[id]) {
            delete selecthashmap[id];
            setDetalle();
            selectanimales = [];
            for (const [key, value] of Object.entries(selecthashmap)) {
                if (value != null) {
                    selectanimales.push({
                        ...value,
                        tipotratamiento: "",
                        observacionnuevo: "",
                    });
                }
            }
        }
    }
    function setDetalle() {
        detallemovimento.selecthashmap = selecthashmap;
        proxymovimiento.save(detallemovimento);
    }
    function volver() {
        goto(pre + "/tratamientos/movimiento");
    }
    function inputObsGeneral() {
        for (let i = 0; i < selectanimales.length; i++) {
            selectanimales[i].observacionnuevo = observaciongeneral;
        }
    }
    async function mover() {
        if (versionjava) {
            let errores = false;

            let errorestrata = [];
            for (let i = 0; i < selectanimales.length; i++) {
                let tratamientoanimal = selectanimales[i];
                let datatratamiento = {
                    fecha: fecha + " 03:00:00",
                    observacion: tratamientoanimal.observacionnuevo,
                    categoria: tratamientoanimal.categoria,
                    animal: tratamientoanimal.id,
                    tipo: tipotratamientoselect,
                    active: true,
                    cab: cab.id,
                };
                try {
                    let res_trata = await saveTrata(datatratamiento);
                } catch (err) {
                    errorestrata.push(tratamientoanimal.id);
                    console.error(err);
                    errores = true;
                }
            }
            if (!errores) {
                Swal.fire(
                    "Éxito guardar",
                    "Se logró guardar los tratamientos",
                    "success",
                );
            } else {
                Swal.fire(
                    "Error guardar",
                    "No se logró guardar todos los tratamientos",
                    "error",
                );
            }
            volver()
        } else {

            let errores = false;
            let bulkdata = [];
            let errorestrata = [];
            for (let i = 0; i < selectanimales.length; i++) {
                let tratamientoanimal = selectanimales[i];
                let datatratamiento = {
                    fecha: fecha + " 03:00:00",
                    observacion: tratamientoanimal.observacionnuevo,
                    categoria: tratamientoanimal.categoria,
                    animal: tratamientoanimal.id,
                    tipo: tipotratamientoselect,
                    active: true,
                    cab: cab.id,
                };
                try {
                    await pb.collection("tratamientos").create(datatratamiento);
                } catch (err) {
                    errorestrata.push(tratamientoanimal.id);
                    console.error(err);
                    errores = true;
                }
            }
            // await guardarBulkTratamiento(bulkdata)
            fecha = "";
            malfecha = false;
            maltipo = false;
            tipotratamientoselect = "";
            botonhabilitado = false;
            for (let i = 0; i < selectanimales.length; i++) {
                let ts = selectanimales[i];
                let i_error = errorestrata.findIndex((pid) => pid == ts.id);
                if (i_error == -1) {
                    delete selecthashmap[ts.id];
                }
            }
            if (!errores) {
                Swal.fire(
                    "Éxito guardar",
                    "Se logró guardar los tratamientos",
                    "success",
                );
            } else {
                Swal.fire(
                    "Error guardar",
                    "No se logró guardar todos los tratamientos",
                    "error",
                );
            }
            selectanimales = [];
            volver()
        }
    }
    onMount(async () => {
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        loadDetalle();
    });
    function verAnimal(id) {
        let a_idx = listaanimales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = listaanimales[a_idx];
            veranimal.showModal();
        }
    }
    let classbuscador = "container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4";
    let classmove = "container mx-auto py-3 px-4 max-w-6xl w-full";
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <div class={classmove}>
        {#if esdev}
            <Success
                texto={versionjava ? "cerrar java" : "ver java"}
                onclick={toggleJava}
            />
        {/if}
        <DetalleMovimiento
            {fecha}
            tipo={tipotratamientoselect}
            {observaciongeneral}
            tipos={tipotratamientos}
        />
        <DetallesAnimalesMovimiento
            bind:selectanimales
            tipos={tipotratamientos}
            {quitarAnimal}
            {verAnimal}
            cambiar={setDetalle}
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
                Crear {selectanimales.length > 1
                    ? "tratamientos"
                    : "tratamiento"}
            </button>
        </div>
    </div>
    <div class="hidden container mx-auto py-1 px-4 max-w-7xl">
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
                            Tratamientos
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
    <div class="hidden container mx-auto py-1 px-4 max-w-7xl">
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-1">
                <div>
                    <label for="fechatrata" class="label">
                        <span class="label-text text-base">Fecha </span>
                    </label>
                    <label class="input-group">
                        <input
                            id="fechtrata"
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
                            onchange={() => {
                                if (fecha == "") {
                                    malfecha = true;
                                    botonhabilitado = false;
                                } else {
                                    malfecha = false;
                                    if (
                                        !maltipo &&
                                        tipotratamientoselect != ""
                                    ) {
                                        botonhabilitado = true;
                                    }
                                }
                            }}
                        />
                        {#if malfecha}
                            <div class="label">
                                <span class="label-text-alt text-red-500"
                                    >Debe seleccionar la fecha del tratamiento</span
                                >
                            </div>
                        {/if}
                    </label>
                </div>
                <div>
                    <label for="tipo" class="label">
                        <span class="label-text text-base"
                            >Tipo tratamiento</span
                        >
                    </label>
                    <label class="input-group">
                        <select
                            class={`
                            select select-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                            bind:value={tipotratamientoselect}
                            onchange={() => {
                                if (tipotratamientoselect == "") {
                                    maltipo = true;

                                    botonhabilitado = false;
                                } else {
                                    maltipo = false;
                                    if (!malfecha && fecha != "") {
                                        botonhabilitado = true;
                                    }
                                }
                            }}
                        >
                            {#each tipotratamientos as t}
                                <option value={t.id}>{t.nombre}</option>
                            {/each}
                        </select>
                        <div class={`label ${maltipo ? "" : "hidden"}`}>
                            <span class="label-text-alt text-red-400"
                                >Debe seleccionar un tipo</span
                            >
                        </div>
                    </label>
                </div>
                <div>
                    <label for="obs" class="label">
                        <span class="label-text text-base">Observación </span>
                    </label>
                    <input
                        id="obs"
                        type="text"
                        class={`
                        input 
                        input-bordered 
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                        bind:value={observaciongeneral}
                        oninput={inputObsGeneral}
                    />
                </div>
            </div>
        </div>
    </div>

    <div class="hidden container mx-auto py-1 px-4 max-w-7xl">
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
