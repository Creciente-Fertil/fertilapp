<script>
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import MultiSelect from "../MultiSelect.svelte";
    import { goto } from "$app/navigation";
    let pre = import.meta.env.VITE_PRE;
    function volver(){
        goto(pre+"/animales")
    }
    let innerWidth = $state(0);

    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        animalesrows,
        cabnombre,
        //filtros
        buscar = $bindable(""),
        rodeos = [],
        rodeoseleccion = $bindable([]),
        sexobuscar = $bindable(""),
        sexos = [],
        lotes = [],
        loteseleccion = $bindable([]),
        categorias = [],
        categoriaseleccion = $bindable([]),
        raza = $bindable(""),
        color = $bindable(""),
        estadobuscar = $bindable(""),
        estados = [],
        activosbuscar = $bindable(""),
        activos = [],
        fechadesde = $bindable(""),
        fechahasta = $bindable(""),
        isOpenFilter = $bindable(false),
        //funciones
        limpiarFiltros = () => {},
        prepararData = () => {},
        nuevo = () => {},
        estadisticas = () => {},
        filterUpdate = () => {},
        clickFilter = () => {},
        
    } = $props();
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
                    Estadísticas
                </h1>
            </div>
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
        <!--Animales encontrados-->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-transparent rounded-lg"
        >
            <!-- Izquierda: texto -->
            <div class="text-md text-gray-700 dark:text-white">
                Total de animales encontrados: {animalesrows.length}
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
                    titulo={"Animales"}
                    filtros={[]}
                    confiltros={false}
                    data={animalesrows}
                    sheetname={"Animales"}
                    establecimiento={cabnombre}
                    {prepararData}
                />
            </div>
        </div>
        {#if isOpenFilter}
            <div transition:slide>
                <div
                    class="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-10 w-full my-1"
                >
                    <div class="mt-1">
                        <MultiSelect
                            opciones={[
                                { id: "-1", nombre: "Sin rodeo" },
                            ].concat(rodeos)}
                            bind:valores={rodeoseleccion}
                            etiqueta="Rodeos"
                            {filterUpdate}
                        />
                    </div>
                    <div class="my-0 py-0">
                        <label for="sexo" class="label mb-0">
                            <span class="label-text text-base">Sexo</span>
                        </label>
                        <label class="input-group">
                            <select
                                class={`
                                        select select-bordered w-full
                                        rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        
                                        ${estilos.bgdark2}
                                    `}
                                bind:value={sexobuscar}
                                onchange={filterUpdate}
                            >
                                <option value="" class="rounded">Todos</option>
                                {#each sexos as s}
                                    <option value={s.id} class="rounded"
                                        >{s.nombre}</option
                                    >
                                {/each}
                            </select>
                        </label>
                    </div>
                    <div class="mt-0">
                        <MultiSelect
                            opciones={[{ id: "-1", nombre: "Sin lote" }].concat(
                                lotes,
                            )}
                            bind:valores={loteseleccion}
                            etiqueta="Lotes"
                            {filterUpdate}
                        />
                    </div>
                    <div class="mt-1">
                        <MultiSelect
                            opciones={[
                                { id: "-1", nombre: "Sin categoria" },
                            ].concat(categorias)}
                            bind:valores={categoriaseleccion}
                            etiqueta="Categorias"
                            {filterUpdate}
                        />
                    </div>
                    <div class="my-0 py-0">
                        <label for="raza" class="label mb-0">
                            <span class="label-text text-base">Raza</span>
                        </label>
                        <label class="input-group">
                            <input
                                type="text"
                                class={`
                                        input input-bordered w-full
                                        rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        
                                        ${estilos.bgdark2}
                                    `}
                                bind:value={raza}
                                oninput={filterUpdate}
                            />
                        </label>
                    </div>
                    <div class="my-0 py-0">
                        <label for="color" class="label mb-0">
                            <span class="label-text text-base">Color</span>
                        </label>
                        <label class="input-group">
                            <input
                                type="text"
                                class={`
                                        input input-bordered w-full
                                        rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        
                                        ${estilos.bgdark2}
                                    `}
                                bind:value={color}
                                oninput={filterUpdate}
                            />
                        </label>
                    </div>
                    <div>
                        <label for="estado" class="label">
                            <span class="label-text text-base">Estado</span>
                        </label>
                        <label class="input-group">
                            <select
                                class={`
                                        select select-bordered w-full
                                        rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        ${estilos.bgdark2}
                                    `}
                                bind:value={estadobuscar}
                                onchange={filterUpdate}
                            >
                                {#each estados as s}
                                    <option value={s.id}
                                        >{s.id == -1
                                            ? "Todos"
                                            : s.nombre}</option
                                    >
                                {/each}
                            </select>
                        </label>
                    </div>
                    <div>
                        <label for="activos" class="label">
                            <span class="label-text text-base">Activos</span>
                        </label>
                        <label class="input-group">
                            <select
                                class={`
                                        select select-bordered w-full
                                        rounded-md
                                        focus:outline-none 
                                        focus:ring-2 
                                        focus:ring-green-500 focus:border-green-500
                                        ${estilos.bgdark2}
                                    `}
                                bind:value={activosbuscar}
                                onchange={filterUpdate}
                            >
                                {#each activos as a}
                                    <option value={a.id}>{a.nombre}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
