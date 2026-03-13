<script>
    import estilos from "$lib/stores/estilos";
    import paginacion from "$lib/stores/paginacion";
    import { slide } from "svelte/transition";
    import ExportarSmall from "../ExportarSmall.svelte";
    import Arrowdown from "$lib/svgs/arrowdown.svelte";
    import Sparkies from "$lib/svgs/sparkies.svelte";
    import Filter from "$lib/svgs/filter.svelte";
    import Limpiar from "$lib/svgs/limpiar.svelte";
    import Sticky from "./Sticky.svelte";
    import Rubber from "$lib/svgs/rubber.svelte";

    import MultiSelect from "../MultiSelect.svelte";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        animalesrows,
        cabnombre,
        selecthash = {},
        //paginacion
        pageSize = $bindable(10),
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
<div class="container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4">
    <!--Header-->
    <div
        class={`
        rounded-xl p-1 shadow-2xl mb-1
            dark:bg-slate-900 bg-white
            px-6
    `}
    >
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 mb-2 border-b dark:border-gray-800"
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
                    Animales
                </h1>
            </div>
            <button
                class={`
                    ${estilos.btnbuscador}
                    ${estilos.btntextbuscador}
                `}
                onclick={nuevo}
            >
                {#if esCelu}
                    <span class="text-lg">Nuevo</span>
                {:else}
                    <span class="text-lg">+ Nuevo animal</span>
                {/if}
            </button>
            <button
                class={`
                        hidden
                        bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                        ${estilos.btnsecondary}
                        rounded-full
                        px-4 pt-2 pb-3
                    `}
                onclick={estadisticas}
            >
                <span class="text-lg font-semibold">Estadísticas</span>
            </button>
        </div>
        <!--Filtros-->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-1 md:p-2 bg-transparent rounded-lg"
        >
            <!-- 🔍 Input de búsqueda -->
            <div
                class={`
                  flex items-center flex-1 border
                  shadow-2xl
                  rounded-full 
                  p-3
                  dark:border-gray-600 
                  border-transparent bg-white dark:bg-gray-900
                  shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
                  dark:shadow-[0_4px_8px_-2px_rgba(255,255,255,0.1)]
                `}
            >
                <input
                    type="text"
                    placeholder="Buscar por caravana..."
                    class={`
                    shadow-2xl
                    dark:placeholder-gray-500 
                    dark:text-gray-100
                    placeholder-gray-600 text-gray-800
                    
                    w-full bg-transparent focus:outline-none
                    border border-transparent
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
            <!-- Derecha: botones -->
            <div class="flex flex-wrap gap-2">
                <button
                    class={`
                        border rounded-full px-3 py-1 text-md flex items-center gap-1
                        bg-white  border-gray-300  hover:bg-gray-300 dark:bg-transparent 
                        dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white
                    `}
                >
                    <Arrowdown size="size-4" />
                    Importar
                </button>

                <button
                    onclick={clickFilter}
                    class={`
                        border rounded-full px-3 py-1 text-md flex items-center gap-1
                        bg-white  border-gray-300  hover:bg-gray-300 dark:bg-transparent dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white
                    `}
                >
                    <Filter size="size-4" />
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
                    datahash={selecthash}
                    conhash={true}
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
                <!--Animales encontrados-->
                <div
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-1 md:p-4 bg-transparent rounded-lg"
                >
                    <div class="text-md text-gray-700 dark:text-white">
                        <span class="hidden xl:block"
                            >Total de animales seleccionados: {Object.keys(
                                selecthash,
                            ).length}</span
                        >
                        <span class="xl:hidden">
                            animales seleccionados: {Object.keys(selecthash)
                                .length}
                        </span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button
                            onclick={limpiarFiltros}
                            class={`
                            rounded-full px-0 md:px-3 py-1 text-md flex items-center gap-1
                            bg-white  hover:bg-gray-300 dark:bg-transparent
                            dark:hover:bg-gray-600 dark:text-white
                        `}
                        >
                            <Rubber size="size-4" />
                            Limpiar
                        </button>
                        <button
                            onclick={filterUpdate}
                            class={`
                                border rounded-full px-3 py-1 text-md flex items-center gap-1
                                bg-[#115642]  hover:bg-[#0f4537] border-[#115642] text-white
                            `}
                        >
                            Aplicar filtros
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
<Sticky total={Object.keys(selecthash).length} />
