<script>
    
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import ExportarSmall from "../ExportarSmall.svelte";
    
    
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let opcionservicio = [{id:0,nombre:"Todos"},{id:1,nombre:"Solo servicios"},{id:2,nombre:"Solo inseminaciones"}]
    let {
        serviciosrow,
        cabnombre,
        //filtros
        totalServicios,
        isOpenFilter =$bindable(false),
        fechaservdesdefiltro =$bindable(""),
        fechaservhastafiltro=$bindable(""),
        fechapartodesde=$bindable(""),
        fechapartohasta=$bindable(""),
        
        filtroservicio=$bindable(""),
        buscarpadre=$bindable(""),
        buscar=$bindable(""),
        

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
                    Servicios
                </h1>
            </div>
            <button
                class={`btn btn-primary rounded-lg ${estilos.btntext2}`}
                data-theme="forest"
                onclick={nuevo}
            >
                {#if esCelu}
                    <span class="text-lg">Nuevos</span>
                {:else}
                    <span class="text-lg">+ Nuevos servicios</span>
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
                Total de servicios encontrados: {totalServicios}
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
                    titulo={"Servicios"}
                    filtros={[]}
                    confiltros={false}
                    data={serviciosrow}
                    sheetname={"Servicios"}
                    establecimiento={cabnombre}
                    {prepararData}
                />
            </div>
        </div>
        {#if isOpenFilter}
            <div transition:slide>
                <div
                    class="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-10 w-full"
                >
                    <div class="">
                        <label
                            class="block tracking-wide text-base font-medium mb-2"
                            for="grid-first-name"
                        >
                            Servicio desde
                        </label>
                        <input
                            id="fechainseminaciondesde"
                            type="date"
                            class={`
                                w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechaservdesdefiltro}
                            onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label
                            class="block tracking-wide text-base font-medium mb-2"
                            for="grid-first-name"
                        >
                            Servicio hasta
                        </label>
                        <input
                            id="fechainseminacionhasta"
                            type="date"
                            class={`
                                w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechaservhastafiltro}
                            onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label
                            class="block tracking-wide text-base font-medium mb-2"
                            for="fechapartodesde"
                        >
                            Parto desde
                        </label>
                        <input
                            id="fechapartodesde"
                            type="date"
                            class={`
                                w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechapartodesde}
                            onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label
                            class="block tracking-wide text-base font-medium mb-2"
                            for="fechapartohasta"
                        >
                            Parto hasta
                        </label>
                        <input
                            id="fechapartohasta"
                            type="date"
                            class={`
                                w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechapartohasta}
                            onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label for="tiposer" class="tracking-wide label">
                            <span class="label-text text-base"
                                >Tipo servicio</span
                            >
                        </label>
                        <label class="input-group">
                            <select
                                class={`
                                    select select-bordered
                                    rounded-md
                                    focus:outline-none focus:ring-2 
                                    focus:ring-green-500 
                                    focus:border-green-500
                                    ${estilos.bgdark2}
                                `}
                                bind:value={filtroservicio}
                                onchange={filterUpdate}
                            >
                                {#each opcionservicio as s}
                                    <option value={s.id}>{s.nombre}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                    <div class="">
                        <label for="nombrepadre" class="label">
                            <span class="label-text text-base">Pajuela</span>
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
