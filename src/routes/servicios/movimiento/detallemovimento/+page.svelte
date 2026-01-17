<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
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
    import MultipleToros from "$lib/components/MultipleToros.svelte";
    import PredictSelect from "$lib/components/PredictSelect.svelte";

    import estilos from "$lib/stores/estilos";
    import ListaAnimales from "$lib/components/servicios/ListaAnimales.svelte";

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
    let listaanimales = $state([]);
    let selecthashmap = $state({});
    let listapadres = $state([]);
    let padres = $state([]);
    //valores
    let defaultmovimiento = {
        //general
        esNatural: true,
        observacion: "",
        fechaparto: "",
        //servicio
        fechadesdeserv: "",
        fechahastaserv: "",
        madre: "",
        padreslist: [],
        padresserv: "",
        pajuelasserv: "",
        //inseminacion
        fechainseminacion: "",
        pajuela: "",
        padre: "",
        cadenapadre: "",
        //animales
        selecthashmap: {},
        listapadres: [],
        padres: [],
    };
    let proxymovimiento = $state({
        ...defaultmovimiento,
    });
    let proxy = createStorageProxy(
        "detallemovimientoservicio",
        defaultmovimiento,
    );
    //valores
    //general
    let esNatural = $state(true);
    let esservicio = $derived(esNatural);
    let observacion = $state("");
    let observaciongeneral = $state("");
    let fechaparto = $state("");
    //servicio
    let fechadesdeserv = $state("");
    let fechahastaserv = $state("");
    let madre = $state("");
    let padreslist = $state([]);
    let padresserv = $state("");
    let pajuelasserv = $state("");
    //inseminacion
    let fechainseminacion = $state("");
    let pajuela = $state("");
    let padre = $state("");
    let cadenapadre = $state("");
    //Validaciones
    let malfechadese = $state(false);
    let malpadre = $state(false);
    let botonhabilitado = $state(false);
    let malfecha = $state(false);
    let cargadoanimales = $state(true);
    function quitarAnimal(id) {
        if (selecthashmap[id]) {
            delete selecthashmap[id];
            setDetalle();
            listaanimales = [];
            for (const [key, value] of Object.entries(selecthashmap)) {
                if (value != null) {
                    listaanimales.push(value);
                }
            }
        }
    }
    function setDetalle() {
        proxymovimiento.selecthashmap = selecthashmap;
        proxy.save(proxymovimiento);
    }
    function loadDetalle() {
        proxymovimiento = proxy.load();
        esNatural = proxymovimiento.esNatural;
        selecthashmap = proxymovimiento.selecthashmap;
        listapadres = proxymovimiento.listapadres;
        padres = proxymovimiento.padres;
        listaanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                listaanimales.push(value);
            }
        }
        cargadoanimales = true;
    }
    function validarBoton() {
        botonhabilitado = true;
        if (esservicio) {
            if (fechadesdeserv == "") {
                botonhabilitado = false;
            }
        }
        
    }
    function input(campo) {
        validarBoton();
        if (esservicio) {
            if (campo == "DESDE") {
                if (fechadesdeserv == "") {
                    malfechadese = true;
                } else {
                    malfechadese = false;
                    fechaparto = addDays(fechadesdeserv, 280)
                        .toISOString()
                        .split("T")[0];
                }
            }
        }
        if (!esservicio) {
            if (campo == "FECHA") {
                if (isEmpty(fechainseminacion)) {
                    malfecha = true;
                } else {
                    malfecha = false;
                    fechaparto = addDays(fechainseminacion, 280)
                        .toISOString()
                        .split("T")[0];
                }
            }
            if (campo == "PAJUELA") {
                if (isEmpty(pajuela)) {
                    malpadre = true;
                } else {
                    malfecha = false;
                    for (let i = 0; i < listaanimales.length; i++) {
                        listaanimales[i].pajuela = pajuela;
                    }
                }
            }
        }
    }
    function onInput(campo) {
        input(campo);
    }
    function onelegir(id) {
        let p = listapadres.filter((pa) => pa.id == id)[0];
        for (let i = 0; i < listaanimales.length; i++) {
            listaanimales[i].pajuela = p.nombre;
            listaanimales[i].padre = id;
        }
        pajuela = p.nombre;
        onInput("PAJUELA");
    }
    function onwrite() {
        for (let i = 0; i < listaanimales.length; i++) {
            listaanimales[i].pajuela = pajuela;
        }
        onInput("PAJUELA");
    }
    function agregarPadre(id) {
        for (let i = 0; i < listaanimales.length; i++) {
            let servicio = listaanimales[i];
            if (!servicio.padres.includes(id)) {
                listaanimales[i].padres.push(id);
            }
        }
    }
    function quitarPadre(id) {
        for (let i = 0; i < listaanimales.length; i++) {
            let servicio = listaanimales[i];
            let idx = servicio.padres.findIndex((p) => p == id);
            if (idx != -1) {
                listaanimales[i].padres.splice(idx, 1);
            }
        }
    }
    function inputObsGeneral() {
        for (let i = 0; i < listaanimales.length; i++) {
            listaanimales[i].observacion = observaciongeneral;
        }
    }
    async function mover() {
        if (esservicio) {
            if (listapadres.length == 0) {
                Swal.fire("Sin padres", "No hay padres seleccionados", "error");
            }
            let errores = false;
            let serverrores = [];
            for (let i = 0; i < listaanimales.length; i++) {
                let servicio = listaanimales[i];
                try {
                    let s_padres = servicio.padres.join();
                    if (s_padres.length == 0) {
                        throw 101;
                    }
                    let dataser = {
                        fechadesde: fechadesdeserv + " 03:00:00",
                        fechaparto: fechaparto + " 03:00:00",
                        observacion: servicio.observacion,
                        madre: servicio.id,
                        padres: s_padres,
                        active: true,
                        cab: cab.id,
                    };

                    if (fechahastaserv != "") {
                        dataser.fechahasta = fechahastaserv + " 03:00:00";
                    }
                    await pb.collection("servicios").create(dataser);
                    //Revisar las fechas
                    await guardarHistorial(pb, servicio.id);
                    await pb
                        .collection("animales")
                        .update(servicio.id, { prenada: 3 });
                    
                } catch (err) {
                    serverrores.push(servicio.id);
                    console.error(err);
                    errores = true;
                }
            }
            if (errores) {
                Swal.fire(
                    "Error servicios",
                    "Hubo algun error en algun servico",
                    "error",
                );
            } else {
                Swal.fire(
                    "Éxito servicios",
                    "Se lograron registrar todos los servicios",
                    "success",
                );
            }
            for (let i = 0; i < listaanimales.length; i++) {
                let servicio = listaanimales[i];
                let i_error = serverrores.findIndex(
                    (pid) => pid == servicio.id,
                );
                if (i_error == -1) {
                    delete selecthashmap[servicio.id];
                }
            }
            
            
        }
        else {
            if (fechainseminacion == "") {
                Swal.fire(
                    "Error inseminaciones",
                    "Debe seleccionar una fecha",
                    "error",
                );
                esinseminacion = false;
                return;
            }
            let errores = false;
            let erroresins = [];
            for (let i = 0; i < listaanimales.length; i++) {
                let inseminacion = listaanimales[i];

                let data = {
                    cab: cab.id,
                    animal: inseminacion.id,
                    fechaparto: fechaparto + " 03:00:00",
                    fechainseminacion: fechainseminacion + " 03:00:00",
                    active: true,
                    padre: inseminacion.padre,
                    pajuela: inseminacion.pajuela,
                    categoria: inseminacion.categoria,
                    observacion: inseminacion.observacion,
                };
                try {
                    const record = await pb
                        .collection("inseminacion")
                        .create(data);
                    await guardarHistorial(pb, inseminacion.id);
                    await pb
                        .collection("animales")
                        .update(inseminacion.id, { prenada: 3 });
                    
                } catch (err) {
                    erroresins.push(inseminacion.id);
                    console.error(err);
                }
            }
            if (errores) {
                Swal.fire(
                    "Error inseminaciones",
                    "Hubo algun error en alguna inseminación",
                    "error",
                );
            } else {
                Swal.fire(
                    "Éxito inseminaciones",
                    "Se lograron registrar todas las inseminaciones",
                    "success",
                );
            }
            
            for (let i = 0; i < listaanimales.length; i++) {
                let inseminacion = listaanimales[i];
                let i_error = erroresins.findIndex(
                    (pid) => pid == inseminacion.id,
                );
                if (i_error == -1) {
                    delete selecthashmap[inseminacion.id];
                }
            }
            
        }
        setDetalle()
        volver()

    }
    function volver() {
        goto(pre + "/servicios/movimiento");
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

<svelte:window bind:innerWidth bind:innerHeight />
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
                            {esNatural ? "Servicios" : "Inseminaciones"}
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
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            {#if esNatural}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-1">
                    <div>
                        <label for="fechadesde" class="label">
                            <span class="label-text text-base">Fecha desde</span
                            >
                        </label>
                        <label class="input-group">
                            <input
                                id="fechadesde"
                                type="date"
                                class={`
                                input input-bordered w-full
                                border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 
                                focus:ring-green-500 
                                focus:border-green-500
                                ${estilos.bgdark2} 
                            `}
                                bind:value={fechadesdeserv}
                                onchange={() => input("DESDE")}
                            />
                            {#if malfechadese}
                                <div class="label">
                                    <span class="label-text-alt text-red-500"
                                        >Debe seleccionar la fecha inicial del
                                        servicio</span
                                    >
                                </div>
                            {/if}
                        </label>
                    </div>
                    <div>
                        <label for="fechahasta" class="label">
                            <span class="label-text text-base">Fecha hasta</span
                            >
                        </label>
                        <label class="input-group">
                            <input
                                id="fechahasta"
                                type="date"
                                class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                                bind:value={fechahastaserv}
                            />
                        </label>
                    </div>
                    <div>
                        <label for="fechaparto" class="label">
                            <span class="label-text text-base">Fecha parto</span
                            >
                        </label>
                        <label class="input-group">
                            <input
                                id="fechaparto"
                                type="date"
                                class={`
                                    input input-bordered w-full
                                    border border-gray-300 rounded-md
                                    focus:outline-none focus:ring-2 
                                    focus:ring-green-500 
                                    focus:border-green-500
                                    ${estilos.bgdark2} 
                                `}
                                bind:value={fechaparto}
                            />
                        </label>
                    </div>
                    <div class="lg:col-span-2">
                        <label for="toros" class="label">
                            <span class="label-text text-base">Toros</span>
                        </label>
                        <label class="input-group">
                            {#if cargadoanimales}
                                <MultipleToros
                                    toros={padres}
                                    bind:valor={padresserv}
                                    bind:listavalores={padreslist}
                                    agregarElemento={agregarPadre}
                                    quitarElemento={quitarPadre}
                                />
                                {#if malpadre}
                                    <div class="label">
                                        <span
                                            class="label-text-alt text-red-500"
                                            >Debe seleccionar al menos un padre</span
                                        >
                                    </div>
                                {/if}
                            {/if}
                        </label>
                    </div>
                    <div class="lg:col-span-2">
                        <label for="observacion" class="label">
                            <span class="label-text text-base">Observación</span
                            >
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
            {:else}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-1">
                    <div>
                        <label for="fechains" class="label">
                            <span class="label-text text-base"
                                >Fecha inseminación</span
                            >
                        </label>
                        <label class="input-group">
                            <input
                                id="fechainseminacion"
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
                                bind:value={fechainseminacion}
                                onchange={() => onInput("FECHA")}
                            />
                            {#if malfecha}
                                <div class="label">
                                    <span class="label-text-alt text-red-500"
                                        >Debe seleccionar la fecha de
                                        inseminacion</span
                                    >
                                </div>
                            {/if}
                        </label>
                    </div>
                    <div>
                        <label for="fechaparto" class="label">
                            <span class="label-text text-base">Fecha parto</span
                            >
                        </label>
                        <label class="input-group">
                            <input
                                id="fechains"
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
                                disabled
                                bind:value={fechaparto}
                            />
                        </label>
                    </div>
                    {#if cargadoanimales}
                        <PredictSelect
                            {onwrite}
                            {onelegir}
                            bind:valor={padre}
                            etiqueta={"Padre"}
                            bind:cadena={pajuela}
                            lista={listapadres}
                            size="w-1/2"
                        />
                    {/if}
                    <div class="">
                        <label for="obs" class="label">
                            <span class="label-text text-base"
                                >Observacion
                            </span>
                        </label>

                        <input
                            id="observacion"
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
            {/if}
        </div>
    </div>
    <div class="container mx-auto py-6 px-4 max-w-7xl">
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <ListaAnimales
                {esNatural}
                bind:selectanimales={listaanimales}
                {quitarAnimal}
                {listapadres}
                {padres}
                {cargadoanimales}
            />
        </div>
    </div>
</Navbar2>
