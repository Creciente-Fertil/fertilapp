<script>
    import { goto } from "$app/navigation";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import BuscadorTratamientos from "$lib/components/tratamientos/BuscadorTratamientos.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import estilos from "$lib/stores/estilos";
    import estados from "$lib/stores/estados";
    import { createCaber } from "$lib/stores/cab.svelte";
    import categorias from "$lib/stores/categorias";
    import sexos from "$lib/stores/sexos";
    import { capitalize } from "$lib/stringutil/lib";
    import { guardarHistorial } from "$lib/historial/lib";
    import MultiSelect from "$lib/components/MultiSelect.svelte";
    import { getSexoNombre } from "$lib/stringutil/lib";
    import { shorterWord } from "$lib/stringutil/lib";
    //FILTROS
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import InfoAnimal from "$lib/components/InfoAnimal.svelte";
    import TablaMovimiento from "$lib/components/TablaMovimiento.svelte";
    import ListaMovimiento from "$lib/components/ListaMovimiento.svelte";
    import NuevoTratamiento from "$lib/components/tratamientos/NuevoTratamiento.svelte";

    import AnimalesSeleccionados from "$lib/components/tratamientos/AnimalesSeleccionados.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import { getAllTipos } from "$lib/java/tratamientos/tratamientosback";
    import { getAll } from "$lib/java/animales/animalesback";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let esdev = import.meta.env.VITE_DEV == "si";
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    async function toggleJava() {
        versionjava = !versionjava;
        await getTiposTratamientos();
        await getAnimales();
        if(versionjava){
            
            detallemovimento = defaultmovimiento
            
            setDetalle();
            loadDetalleMovimiento()
        }
        
    }
    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    //paginacon
    let pageSize = $state(5);
    let paginaActual = $state(1);
    //boton
    let textoboton = $state("Tratamientos");
    //Datos animales
    let animal = $state({});
    let animales = $state([]);
    let animalesrows = $state([]);

    //Filtros
    let buscar = $state("");
    let lote = $state("");
    let rodeo = $state("");
    let raza = $state("");
    let color = $state("");
    let loteseleccion = $state([]);
    let rodeoseleccion = $state([]);
    let categoriaseleccion = $state([]);

    let defaultfiltro = {
        buscar: "",
        lote: "",
        rodeo: "",
        categoria: "",
        raza: "",
        color: "",
        sexo: "H",
        rodeoseleccion: [],
        loteseleccion: [],
        categoriaseleccion: [],
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("tratamientosanimales", defaultfiltro);
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

    let categoria = $state("");
    let sexo = $state("H");

    let lotes = $state([]);
    let rodeos = $state([]);
    let isOpenFilter = $state(false);
    let tipotratamientos = $state([]);

    //Seleccionados
    let selectanimales = $state([]);
    let selecthashmap = $state({});
    let todos = $state(false);
    let algunos = $state(false);
    let ninguno = $state(true);

    //movimiento
    let fecha = $state("");
    let tipotratamientoselect = $state("");
    let observaciongeneral = $state("");

    //validacion
    let malfecha = $state(false);
    let maltipo = $state(false);
    let botonhabilitado = $state(false);

    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    function limpiar() {
        selectanimales = [];
        let lista = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            lista.push(key);
        }
        for (let i = 0; i < lista.length; i++) {
            selecthashmap[lista[i]] = null;
        }
        algunos = false;
        todos = false;
        ninguno = true;
    }
    function setFilters() {
        buscar = proxyfiltros.buscar;
        lote = proxyfiltros.lote;
        rodeo = proxyfiltros.rodeo;
        categoria = proxyfiltros.categoria;
        sexo = proxyfiltros.sexo;
        raza = proxyfiltros.raza;
        color = proxyfiltros.color;
        rodeoseleccion = proxyfiltros.rodeoseleccion;
        loteseleccion = proxyfiltros.loteseleccion;
        categoriaseleccion = proxyfiltros.categoriaseleccion;
    }

    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.lote = lote;
        proxyfiltros.rodeo = rodeo;
        proxyfiltros.categoria = categoria;
        proxyfiltros.sexo = sexo;
        proxyfiltros.raza = raza;
        proxyfiltros.color = color;
        proxyfiltros.rodeoseleccion = rodeoseleccion;
        proxyfiltros.loteseleccion = loteseleccion;
        proxyfiltros.categoriaseleccion = categoriaseleccion;
    }
    function setDetalle() {
        detallemovimento.selecthashmap = selecthashmap;
        detallemovimento.tipos = tipotratamientos;
        detallemovimento.tipotratamientoselect = tipotratamientoselect;
        detallemovimento.fecha = fecha;
        detallemovimento.observaciongeneral = observaciongeneral;
        
        proxymovimiento.save(detallemovimento);
    }
    function loadDetalleMovimiento() {
        detallemovimento = proxymovimiento.load();
        selecthashmap = detallemovimento.selecthashmap;
        tipotratamientoselect = detallemovimento.tipotratamientoselect;
        fecha = detallemovimento.fecha;
        observaciongeneral = detallemovimento.observaciongeneral;
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
        if (selectanimales.length == animalesrows.length) {
            todos = true;
            algunos = false;
            ninguno = false;
        } else if (selectanimales.length > 0) {
            todos = false;
            algunos = true;
            ninguno = false;
        } else {
            todos = false;
            algunos = false;
            ninguno = true;
        }
    }
    function setLista() {
        selectanimales = [];
    }
    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
        animalesrows = animales;
        if (buscar != "") {
            animalesrows = animalesrows.filter((a) =>
                a.caravana
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
        }
        if (raza != "") {
            animalesrows = animalesrows.filter((a) =>
                a.raza.toLocaleLowerCase().includes(raza.toLocaleLowerCase()),
            );
        }
        if (color != "") {
            animalesrows = animalesrows.filter((a) =>
                a.color.toLocaleLowerCase().includes(color.toLocaleLowerCase()),
            );
        }
        if (sexo != "") {
            animalesrows = animalesrows.filter((a) => a.sexo == sexo);
        }
        if (rodeo != "") {
            animalesrows = animalesrows.filter((a) => a.rodeo == rodeo);
        }
        if (lote != "") {
            animalesrows = animalesrows.filter((a) => a.lote == lote);
        }
        if (categoria != "") {
            animalesrows = animalesrows.filter((a) => a.categoria == categoria);
        }
        if (rodeoseleccion.length != 0) {
            if (rodeoseleccion.length == 1 && rodeoseleccion[0] == "-1") {
                animalesrows = animalesrows.filter((a) => !a.rodeo);
                totalAnimalesEncontrados = animalesrows.length;
            } else {
                animalesrows = animalesrows.filter((a) =>
                    rodeoseleccion.includes(a.rodeo),
                );
                totalAnimalesEncontrados = animalesrows.length;
            }
        }
        if (loteseleccion.length != 0) {
            if (loteseleccion.length == 1 && loteseleccion[0] == "-1") {
                animalesrows = animalesrows.filter((a) => !a.lote);
                totalAnimalesEncontrados = animalesrows.length;
            } else {
                animalesrows = animalesrows.filter((a) =>
                    loteseleccion.includes(a.lote),
                );
                totalAnimalesEncontrados = animalesrows.length;
            }
        }
        if (categoriaseleccion.length != 0) {
            if (
                categoriaseleccion.length == 1 &&
                categoriaseleccion[0] == "-1"
            ) {
                animalesrows = animalesrows.filter((a) => !a.categoria);
                totalAnimalesEncontrados = animalesrows.length;
            } else {
                animalesrows = animalesrows.filter((a) =>
                    categoriaseleccion.includes(a.categoria),
                );
                totalAnimalesEncontrados = animalesrows.length;
            }
        }
    }
    function ordenarNombre(lista) {
        lista.sort((r1, r2) =>
            r1.nombre.toLocaleLowerCase() > r2.nombre.toLocaleLowerCase()
                ? 1
                : -1,
        );
    }

    function clickAnimal(id) {
        if (selecthashmap[id]) {
            if (todos) {
                todos = false;
                algunos = true;
            }
            selecthashmap[id] = null;
        } else {
            if (ninguno) {
                algunos = true;
                ninguno = false;
            }
            let a = animales.filter((an) => an.id == id)[0];
            selecthashmap[id] = {
                ...a,
            };
        }
        setDetalle();
    }
    function clickTodos() {
        if (todos) {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthashmap = {};
        } else if (ninguno) {
            ninguno = false;
            todos = true;
            for (let i = 0; i < animalesrows.length; i++) {
                let a = animalesrows[i];
                selecthashmap[animalesrows[i].id] = {
                    ...a,
                };
            }
        } else if (algunos) {
            selecthashmap = {};
            algunos = false;
            todos = false;
            ninguno = true;
        }
        setDetalle();
    }
    function inputObsGeneral() {
        for (let i = 0; i < selectanimales.length; i++) {
            selectanimales[i].observacionnuevo = observaciongeneral;
        }
    }
    async function getLotes() {
        const records = await pb.collection("lotes").getFullList({
            filter: `active = true && cab ~ '${cab.id}'`,
            sort: "nombre",
        });
        lotes = records;
        ordenarNombre(lotes);
    }
    async function getRodeos() {
        const records = await pb.collection("rodeos").getFullList({
            filter: `active = true && cab ~ '${cab.id}'`,
            sort: "nombre",
        });
        rodeos = records;
        //ordenarNombre(rodeos)
    }
    async function getTiposTratamientos() {
        if (versionjava) {
            let records = await getAllTipos();
            tipotratamientos = records;
            tipotratamientos.sort((tp1, tp2) =>
                tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                    ? 1
                    : -1,
            );
        } else {
            const records = await pb
                .collection("tipotratamientos")
                .getFullList({
                    filter: `(cab='${cab.id}' || generico = true) && active = true`,
                    sort: "-created",
                });
            tipotratamientos = records;
            tipotratamientos.sort((tp1, tp2) =>
                tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                    ? 1
                    : -1,
            );
        }
    }
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
            animalesrows = animales;
            cargado = true;
        } else {
            const recordsa = await pb.collection("animales").getFullList({
                filter: `active=true && delete=false && cab='${cab.id}'`,
                expand: "rodeo,lote",
            });

            animales = recordsa;
            animales.sort((a1, a2) =>
                a1.caravana.toLocaleLowerCase() >
                a2.caravana.toLocaleLowerCase()
                    ? 1
                    : -1,
            );
            animalesrows = animales;
            cargado = true;
        }
    }
    function irDetalle() {
        if (ninguno) {
            Swal.fire(
                "Error tratamiento",
                "No hay animales seleccionados",
                "error",
            );
            return;
        }
        setDetalle();
        goto(pre + "/tratamientos/movimiento/detallemovimiento");
    }
    function openNewModal() {
        if (ninguno) {
            Swal.fire(
                "Error tratamiento",
                "No hay animales seleccionados",
                "error",
            );
            return;
        }
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
        tratamientoMasivo.showModal();
    }
    async function guardarBulkTratamiento(bulkdata) {
        try {
            const batch = pb.createBatch();
            for (let i = 0; i < bulkdata.length; i++) {
                let t = bulkdata[i];
                batch.collection("tratamientos").create(t);
            }

            const result = await batch.send();

            Swal.fire(
                "Éxito tratamientos",
                "Se lograron registrar todos los tratamientos",
                "success",
            );
        } catch (err) {
            Swal.fire(
                "Error tratamientos",
                "Hubo algun error en algun tratamiento",
                "error",
            );
        }
    }
    async function guardarTratamiento() {
        
        if (fecha == "" || tipotratamientoselect == "") {
            Swal.fire(
                "Error tratamientos",
                "Debe seleccionar una fecha",
                "error",
            );
            return;
        }
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
    }
    function verAnimal(id) {
        let a_idx = animales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = animales[a_idx];
            veranimal.showModal();
        }
    }
    function cancelar() {
        goto(pre + "/tratamientos");
    }
    function siguiente() {
        setDetalle()
        goto(pre + "/tratamientos/movimiento/detallemovimiento");
    }
    function input(campo) {}
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        await getAnimales();
        await getLotes();
        await getRodeos();
        await getTiposTratamientos();
        
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
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3"
        >
            <div
                class={`
                            bg-transparent
                            px-2 py-1
                        `}
            >
                <h1
                    class={`
                            text-4xl font-semibold 
                            dark:text-[#24a579] text-[#115642]
                            
                        `}
                >
                    Nuevo tratamientos
                </h1>
            </div>
        </div>
        {#if esdev}
            <Success
                texto={versionjava ? "Cerrar ajva" : "ver java"}
                onclick={toggleJava}
            />
        {/if}
        <div class="grid grid-cols-1 max-h-screen gap-1 md:gap-2">
            <!--Lado izquierd-->
            <div>
                <NuevoTratamiento
                    bind:fecha
                    bind:tipotratamientoselect
                    bind:observaciongeneral
                    tipos={tipotratamientos}
                    {inputObsGeneral}
                    {input}
                />
                <div class="hidden">
                    <AnimalesSeleccionados
                        {selecthashmap}
                        quitarAnimal={clickAnimal}
                    />
                </div>
            </div>
            <!--Lado derecho-->
            <div class="md:col-span-2">
                <BuscadorTratamientos
                    {animalesrows}
                    {selecthashmap}
                    bind:buscar
                    {rodeos}
                    bind:rodeoseleccion
                    {lotes}
                    bind:loteseleccion
                    {categorias}
                    bind:categoriaseleccion
                    bind:raza
                    bind:color
                    bind:isOpenFilter
                    {clickFilter}
                    {filterUpdate}
                    nuevoTratamiento={() => irDetalle()}
                    {limpiarFiltros}
                />
                {#if cargado}
                    <div
                        class={`
                            pt-0 my-0
                            hidden w-full md:grid
                            mx-auto px-2 md:px-1 max-w-7xl
                        `}
                    >
                        <div
                            class={`
                                overflow-hidden 
                            `}
                        >
                            <TablaMovimiento
                                bind:paginaActual
                                bind:pageSize
                                selecthash={selecthashmap}
                                {animalesrows}
                                clickFila={clickAnimal}
                                {clickTodos}
                                {todos}
                                {ninguno}
                                {algunos}
                                verFila={verAnimal}
                                conEstado={false}
                                {cancelar}
                                {siguiente}
                            />
                        </div>
                    </div>
                    <div
                        class={`
                        pt-0 my-0
                        w-full md:hidden
                        mx-auto px-2 md:px-1 max-w-7xl
                    `}
                    >
                        <ListaMovimiento
                            bind:paginaActual
                            bind:pageSize
                            selecthash={selecthashmap}
                            {animalesrows}
                            clickFila={clickAnimal}
                            {clickTodos}
                            {todos}
                            {ninguno}
                            {algunos}
                            verFila={verAnimal}
                            conEstado={true}
                            {cancelar}
                            {siguiente}
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>
</Navbar2>
<dialog id="tratamientoMasivo" class="modal modal-middle rounded-xl">
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
        <h3 class="text-lg font-bold">Tratamientos</h3>
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
                                if (!maltipo && tipotratamientoselect != "") {
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
                    <span class="label-text text-base">Tipo tratamiento</span>
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
        <div class="block justify-items-center mx-1">
            {#each selectanimales as a, i}
                <div
                    class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
                >
                    <div class="block p-4">
                        <div class="grid grid-cols-2 gap-y-2">
                            <div class="flex items-start col-span-2">
                                <span>Caravana:</span>
                                <span class="font-semibold">
                                    {shorterWord(a.caravana)}
                                </span>
                            </div>
                            <div class="flex items-start col-span-2">
                                <InfoAnimal animal={a} />
                            </div>
                            <div class="flex items-start col-span-2">
                                <input
                                    bind:value={
                                        selectanimales[i].observacionnuevo
                                    }
                                    placeholder="Observación"
                                    class={`
                                    h-12 border border-gray-300
                                    px-2 
                                    w-full
                                    rounded-md
                                    focus:outline-none focus:ring-2 
                                    focus:ring-green-500 
                                    focus:border-green-500
                                    ${estilos.bgdark2}
                                `}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <button
                    class="btn btn-success text-white"
                    disabled={!botonhabilitado}
                    onclick={guardarTratamiento}>Crear tratamientos</button
                >
                <button class="btn btn-error text-white">Cancelar</button>
            </form>
        </div>
    </div>
</dialog>
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
