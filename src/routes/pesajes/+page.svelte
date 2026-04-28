<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Buscador from "$lib/components/pesajes/Buscador.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import estilos from "$lib/stores/estilos";
    import { createCaber } from "$lib/stores/cab.svelte";
    import categorias from "$lib/stores/categorias";
    import sexos from "$lib/stores/sexos";
    import { capitalize } from "$lib/stringutil/lib";
    import { guardarHistorial } from "$lib/historial/lib";
    import MultiSelect from "$lib/components/MultiSelect.svelte";
    import {
        getEstadoNombre,
        getEstadoColor,
    } from "$lib/components/estadosutils/lib";
    import { getSexoNombre } from "$lib/stringutil/lib";
    import { shorterWord } from "$lib/stringutil/lib";
    import Success from "$lib/components/botones/Success.svelte";
    //FILTROS
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import InfoAnimal from "$lib/components/InfoAnimal.svelte";
    import { goto } from "$app/navigation";
    import AnimalesSeleccionados from "$lib/components/pesajes/AnimalesSeleccionados.svelte";
    import TablaMovimiento from "$lib/components/TablaMovimiento.svelte";
    import NuevoPesajes from "$lib/components/pesajes/NuevoPesajes.svelte";
    import { getAll } from "$lib/java/animales/animalesback";

    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let esdev = import.meta.env.VITE_DEV == "si";
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    async function toggleJava() {
        versionjava = !versionjava;
        await getAnimales();
    }
    //boton
    let textoboton = $state("Mover");
    //paginacon
    let pageSize = $state(5);
    let paginaActual = $state(1);
    //Datos animales
    let animal = $state({});
    let animales = $state([]);
    let animalesrows = $state([]);
    //Filtros
    let buscar = $state("");
    let lote = $state("");
    let rodeo = $state("");
    let loteseleccion = $state([]);
    let rodeoseleccion = $state([]);
    let categoriaseleccion = $state([]);
    let categoria = $state("");
    let sexo = $state("");
    let raza = $state("");
    let color = $state("");

    let lotes = $state([]);
    let rodeos = $state([]);

    let defaultfiltro = {
        buscar: "",
        loteseleccion: [],
        rodeoseleccion: [],
        categoriaseleccion: [],
        categoria: "",
        sexo: "",
        lote: "",
        rodeo: "",
        raza: "",
        color: "",
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("pesajesanimales", defaultfiltro);
    //movimento
    let defaultmovimiento = {
        fecha: "",
        pesogeneral: "",
        selecthashmap: {},
    };
    let detallemovimiento = $state({
        ...defaultmovimiento,
    });
    let proxymovimiento = createStorageProxy(
        "movimientodetallepesaje",
        defaultmovimiento,
    );

    let tipos = $state([]);
    let isOpenFilter = $state(false);
    //Seleccionados
    let selectanimales = $state([]);
    let selecthashmap = $state({});
    let todos = $state(false);
    let algunos = $state(false);
    let ninguno = $state(true);

    //movimiento
    let fecha = $state("");
    let nuevospesos = $state({});
    let pesogeneral = $state("");

    //Seleecionar
    let selectcategoria = $state(true);
    let selectlote = $state(false);
    let selectrodeo = $state(false);
    let selecttratamiento = $state(false);

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
        loteseleccion = proxyfiltros.loteseleccion;
        rodeoseleccion = proxyfiltros.rodeoseleccion;
        categoriaseleccion = proxyfiltros.categoriaseleccion;
        categoria = proxyfiltros.categoria;
        sexo = proxyfiltros.sexo;
        lote = proxyfiltros.lote;
        rodeo = proxyfiltros.rodeo;
        raza = proxyfiltros.raza;
        color = proxyfiltros.color;
    }

    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.loteseleccion = loteseleccion;
        proxyfiltros.rodeoseleccion = rodeoseleccion;
        proxyfiltros.categoriaseleccion = categoriaseleccion;
        proxyfiltros.categoria = categoria;
        proxyfiltros.sexo = sexo;
        proxyfiltros.lote = lote;
        proxyfiltros.rodeo = rodeo;
        proxyfiltros.color = color;
        proxyfiltros.raza = raza;
    }

    function setDetalle() {
        detallemovimiento.selecthashmap = selecthashmap;
        detallemovimiento.fecha = fecha;
        detallemovimiento.pesogeneral = pesogeneral;
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
        if (rodeoseleccion.length != 0) {
            if (rodeoseleccion.length == 1 && rodeoseleccion[0] == "-1") {
                animalesrows = animalesrows.filter((a) => !a.rodeo);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    rodeoseleccion.includes(a.rodeo),
                );
            }
        }
        if (loteseleccion.length != 0) {
            if (loteseleccion.length == 1 && loteseleccion[0] == "-1") {
                animalesrows = animalesrows.filter((a) => !a.lote);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    loteseleccion.includes(a.lote),
                );
            }
        }
        if (categoriaseleccion.length != 0) {
            if (
                categoriaseleccion.length == 1 &&
                categoriaseleccion[0] == "-1"
            ) {
                animalesrows = animalesrows.filter((a) => !a.categoria);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    categoriaseleccion.includes(a.categoria),
                );
            }
        }
        if (categoria != "") {
            animalesrows = animalesrows.filter((a) => a.categoria == categoria);
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
            delete selecthashmap[id];
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
    async function getTipos() {
        const records = await pb.collection("tipotratamientos").getFullList({
            filter: `(cab='${cab.id}' || generico = true) && active = true`,
            sort: "-created",
        });
        tipos = records;
        tipos.sort((tp1, tp2) => (tp1.nombre > tp2.nombre ? 1 : -1));
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
            filterUpdate();
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
            filterUpdate();
        }
    }
    function irDetalle() {
        if (ninguno) {
            Swal.fire("Error pesaje", "No hay animales seleccionados", "error");
            return;
        }
        setDetalle();
        goto(pre + "/pesajes/detallemovimiento");
    }
    function openNewModal() {
        if (ninguno) {
            Swal.fire("Error pesaje", "No hay animales seleccionados", "error");
            return;
        }
        selectanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                selectanimales.push({ ...value, pesonuevo: value.peso });
            }
        }
        if (selectanimales.length == 0) {
            Swal.fire("Error pesaje", "No hay animales seleccionados", "error");
            return;
        }
        nuevoModal.showModal();
    }
    function cambioPesoGeneral() {
        pesogeneral = Math.max(0, pesogeneral);
        for (let i = 0; i < selectanimales.length; i++) {
            selectanimales[i].pesonuevo = pesogeneral;
        }
        setDetalle();
    }
    async function crearPesaje() {
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
        selectanimales = [];

        await getAnimales();
        filterUpdate();
    }
    function verAnimal(id) {
        let a_idx = animales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = animales[a_idx];
            veranimal.showModal();
        }
    }
    function cancelar() {
        goto(pre + "/pesajes");
    }
    function siguiente() {
        setDetalle();
        goto(pre + "/pesajes/detallemovimiento");
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        await getAnimales();
        await getRodeos();
        await getLotes();
        await getTipos();
        loadDetalle();
    });
    function nuevo() {
        openNewModal();
    }
    function ultimos() {
        goto(pre + "/pesajes/lista");
    }
</script>

<Navbar2>
    <div
        class="
            container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4
            "
    >
        <a
            href={`${pre + "/pesajes/historial"}`}
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
            Volver a pesajes
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
                    Nuevo pesajes
                </h1>
            </div>
        </div>
        {#if esdev}
            <Success
                texto={versionjava ? "Cerrar java" : "Ver java"}
                onclick={toggleJava}
            />
        {/if}
        <div class={`grid grid-cols-1   max-h-screen gap-1 md:gap-2`}>
            <div>
                <NuevoPesajes bind:fecha bind:pesogeneral {cambioPesoGeneral} />
                <div class="hidden">
                    <AnimalesSeleccionados
                        {selecthashmap}
                        quitarAnimal={clickAnimal}
                    />
                </div>
            </div>
            <div class="md:col-span-2">
                <Buscador
                    {animalesrows}
                    {selecthashmap}
                    bind:buscar
                    {rodeos}
                    bind:rodeoseleccion
                    bind:sexobuscar={sexo}
                    {sexos}
                    {lotes}
                    bind:loteseleccion
                    {categorias}
                    bind:categoriaseleccion
                    bind:raza
                    bind:color
                    bind:isOpenFilter
                    {limpiarFiltros}
                    nuevo={irDetalle}
                    {ultimos}
                    {filterUpdate}
                    {clickFilter}
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
                    <div class="block md:hidden justify-items-center mx-1">
                        <div class="w-full flex justify-start">
                            <button
                                aria-label="Todos"
                                onclick={clickTodos}
                                class={`
                    text-base bg-transparent rounded-lg
                    p-1 text-base flex flex-row
                    ${estilos.secundario}
                `}
                            >
                                {#if todos}
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
                                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>
                                {/if}
                                {#if ninguno}
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
                                            d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>
                                {/if}
                                {#if algunos}
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
                                            d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>
                                {/if}

                                <span class="mt-1"> Seleccionar todos </span>
                            </button>
                        </div>

                        {#each animalesrows as a}
                            <div
                                class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
                            >
                                <div class="block p-4">
                                    <div
                                        class="flex justify-between items-start mb-2"
                                    >
                                        <h3 class="font-medium">
                                            <button
                                                aria-label="fila"
                                                onclick={() =>
                                                    clickAnimal(a.id)}
                                                class={`
                                font-medium bg-transparent rounded-lg
                                px-3 py-3 text-base
                                ${selecthashmap[a.id] ? estilos.danger : estilos.primario}
                            `}
                                            >
                                                {#if selecthashmap[a.id]}
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
                                                            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                        />
                                                    </svg>
                                                {:else}
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
                                                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                        />
                                                    </svg>
                                                {/if}
                                            </button>
                                            {a.caravana}
                                        </h3>
                                        {#if a.sexo == "H" && a.prenada != 1}
                                            <div
                                                class={`badge badge-outline badge-${getEstadoColor(a.prenada)}`}
                                            >
                                                {getEstadoNombre(a.prenada)}
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="grid grid-cols-2 gap-y-2">
                                        <div class="flex items-start">
                                            <span class="font-semibold"
                                                >{getSexoNombre(a.sexo)}</span
                                            >
                                        </div>
                                        <div class="flex items-start">
                                            <span>Categoría:</span>
                                            <span class="font-semibold">
                                                {a.categoria}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Peso:</span>
                                            <span class="font-semibold">
                                                {a.peso}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Lote:</span>
                                            <span class="font-semibold">
                                                {a.expand
                                                    ? a.expand.lote
                                                        ? a.expand.lote.nombre
                                                        : ""
                                                    : ""}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Rodeo:</span>
                                            <span class="font-semibold">
                                                {a.expand
                                                    ? a.expand.rodeo
                                                        ? a.expand.rodeo.nombre
                                                        : ""
                                                    : ""}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Raza:</span>
                                            <span class="font-semibold">
                                                {a.raza}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Color:</span>
                                            <span class="font-semibold">
                                                {a.color}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</Navbar2>
<dialog
    id="nuevoModal"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box w-11/12 max-w-xl
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

        <h3 class="text-lg font-bold">Movimiento</h3>
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
        <div class="block justify-items-center mx-1">
            {#each selectanimales as a, i}
                <div
                    class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
                >
                    <div class="block p-4">
                        <div class="grid grid-cols-2 gap-y-2">
                            <div class="flex items-start col-span-2">
                                <InfoAnimal animal={a} />
                                <span>Caravana:</span>
                                <span class="font-semibold">
                                    {shorterWord(a.caravana)}
                                </span>
                            </div>
                            <div class="flex items-start col-span-2">
                                <span>Peso:</span>
                                <span class="font-semibold">
                                    {a.peso}
                                </span>
                            </div>
                            <div class="flex items-start col-span-2">
                                <label class="input-group">
                                    <input
                                        bind:value={selectanimales[i].pesonuevo}
                                        oninput={() =>
                                            (selectanimales[i].pesonuevo =
                                                Math.max(
                                                    0,
                                                    selectanimales[i].pesonuevo,
                                                ))}
                                        class={`
                                    input input-bordered w-full
                                    border border-gray-300 rounded-md
                                    focus:outline-none focus:ring-2 
                                    focus:ring-green-500 focus:border-green-500
                                    ${estilos.bgdark2}
                                `}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <button class="btn btn-success text-white" onclick={crearPesaje}
                    >Crear pesaje</button
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
