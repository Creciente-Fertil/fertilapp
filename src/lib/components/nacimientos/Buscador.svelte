<script>
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import ExportarSmall from "../ExportarSmall.svelte";
    
    
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let opcionservicio = [
        { id: 0, nombre: "Todos" },
        { id: 1, nombre: "Solo servicios" },
        { id: 2, nombre: "Solo inseminaciones" },
    ];
    let {
        nacimientosrow,
        cabnombre,
        //filtros

        isOpenFilter = $bindable(false),
        fechadesde = $bindable(""),
        fechahasta = $bindable(""),
        buscar = $bindable(""),
        buscarmadre = $bindable(""),
        buscarpadre = $bindable(""),
        

        //funciones
        limpiarFiltros = () => {},
        prepararData = () => {},
        nuevo = () => {},
        filterUpdate = () => {},
        clickFilter = () => {},
        
    } = $props();

    //buscador
</script>

<svelte:window bind:innerWidth bind:innerHeight />
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
                <h1
                    class={`
                    text-2xl font-bold 

                    dark:text-white text-gray-900
                    
                `}
                >
                    Nacimientos
                </h1>
            </div>
            <button
                class={`btn btn-primary rounded-lg ${estilos.btntext2}`}
                data-theme="forest"
                onclick={nuevo}
            >
                {#if esCelu}
                    <span class="text-lg">Nuevo</span>
                {:else}
                    <span class="text-lg">+ Nuevo nacimiento</span>
                {/if}
            </button>
        </div>
        <!--Filtros-->
        <!-- 🔍 Input de búsqueda -->
        <div
            class={`
            flex items-center flex-1 border
            rounded-md px-3 py-2
            dark:border-gray-600 dark:bg-gray-900
            border-gray-300 bg-white
          `}
        >
            <input
                type="text"
                placeholder="Buscar..."
                class={`
                    dark:placeholder-gray-500 dark:text-gray-100
                    placeholder-gray-400 text-gray-800
                    
                    w-full bg-transparent focus:outline-none
                `}
                bind:value={buscar}
                oninput={filterUpdate}
            />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103 10.5a7.5 7.5 0 0013.15 6.15z"
                />
            </svg>
        </div>
        <!--Servicios encontrados-->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-transparent rounded-lg"
        >
            <!-- Izquierda: texto -->
            <div class="text-md text-gray-700 dark:text-white">
                Total de nacimientos encontrados: {nacimientosrow.length}
            </div>

            <!-- Derecha: botones -->
            <div class="flex flex-wrap gap-2">
                <button
                    class={`
                        hidden
                        border rounded-full px-3 py-1 text-md flex items-center gap-1
                        bg-white  border-gray-300  hover:bg-gray-100
                        dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white
                    `}
                >
                    Importar
                </button>
                <button
                    onclick={limpiarFiltros}
                    class={`
                        
                        border rounded-full px-3 py-1 text-md flex items-center gap-1
                        bg-white  border-gray-300  hover:bg-gray-100
                        dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white
                    `}
                >
                    Limpiar
                </button>
                <button
                    onclick={clickFilter}
                    class={`
                        border rounded-full px-3 py-1 text-md flex items-center gap-1
                        bg-white  border-gray-300  hover:bg-gray-100
                        dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white
                    `}
                >
                    Filtros
                </button>
                <ExportarSmall
                    titulo={"Nacimientos"}
                    filtros={[]}
                    confiltros={false}
                    data={nacimientosrow}
                    sheetname={"Nacimientos"}
                    establecimiento={cabnombre}
                    {prepararData}
                />
            </div>
        </div>
        {#if isOpenFilter}
            <div transition:slide>
                <div class="grid grid-cols-1 lg:grid-cols-2 mb-2 lg:mb-3 gap-1">
                    <div class="">
                        <label
                            class="block tracking-wide mb-2"
                            for="grid-first-name"
                        >
                            Fecha desde
                        </label>
                        <input
                            id="fechadesde"
                            type="date"
                            class={`
                                w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechadesde}
                            onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label
                            class="block tracking-wide mb-2"
                            for="grid-first-name"
                        >
                            Fecha Hasta
                        </label>
                        <input
                            id="fechadesde"
                            type="date"
                            class={`
                                w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechahasta}
                            onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label for="nombremadre" class="label">
                            <span class="label-text text-base">Madre</span>
                        </label>
                        <label class="input-group md:w-1/2 md:flex">
                            <input
                                id="nombremadre"
                                type="text"
                                class={`
                                    input 
                                    input-bordered 
                                    border border-gray-300 rounded-md
                                    focus:outline-none 
                                    focus:ring-2 focus:ring-green-500 
                                    focus:border-green-500
                                    w-full 
                                    ${estilos.bgdark2} 
                                `}
                                bind:value={buscarmadre}
                                oninput={filterUpdate}
                            />
                        </label>
                    </div>
                    <div>
                        <label for="nombrepadre" class="label">
                            <span class="label-text text-base">Padre</span>
                        </label>
                        <label class="input-group md:w-1/2 md:flex">
                            <input
                                id="nombrepadre"
                                type="text"
                                class={`
                                    input 
                                    input-bordered 
                                    border border-gray-300 rounded-md
                                    focus:outline-none 
                                    focus:ring-2 focus:ring-green-500 
                                    focus:border-green-500
                                    w-full 
                                    ${estilos.bgdark2} 
                                `}
                                bind:value={buscarpadre}
                                oninput={filterUpdate}
                            />
                        </label>
                    </div>
                </div>
            </div>
        {/if}
        <!--Ordenar-->
    </div>
</div>
