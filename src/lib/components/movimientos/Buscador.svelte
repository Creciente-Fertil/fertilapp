<script>
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import MultiSelect from "../MultiSelect.svelte";
    import Filter from "$lib/svgs/filter.svelte";
    import Sparkies from "$lib/svgs/sparkies.svelte";
    import Arrowback from "$lib/svgs/arrowback.svelte";
    import Sticky from "./Sticky.svelte";
    import Rubber from "$lib/svgs/rubber.svelte";
    import estados from "$lib/stores/estados";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        animalesrows,
        selecthashmap,
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

        isOpenFilter = $bindable(false),
        //funciones

        nuevo = () => {},
        filterUpdate = () => {},
        clickFilter = () => {},
    } = $props();
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div class="container px-0 md:px-1 max-w-7xl w-full">
    <!--Header-->
    <div
        class={`
            rounded-t-xl p-1 shadow-2xl mb-0
            dark:bg-slate-900 bg-white
            px-2
            mt-2 md:mt-0
        `}
    >
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1"
        >
            <div
                class={`
                    bg-transparent
                    px-2 py-0 
                `}
            >
                <h1
                    class={`
                            text-xl font-semibold
                            dark:text-gray-300 text-gray-700
                            flex                    
                        `}
                >
                    Seleccion animales
                </h1>
            </div>
            <button
                class={`hidden btn btn-primary rounded-lg ${estilos.btntext2}`}
                data-theme="forest"
                onclick={nuevo}
            >
                {#if esCelu}
                    <span class="text-lg">Nuevos</span>
                {:else}
                    <span class="text-lg">+ Nuevos movimientos</span>
                {/if}
            </button>
        </div>
        <!--Filtros-->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-1 md:p-2 bg-transparent rounded-lg"
        >
            <!-- Input de búsqueda -->
            <div
                class={`
                  flex items-center flex-1 
                  shadow-2xl
                  rounded-t-full p-3
                   bg-white dark:bg-gray-900
                  shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
                  dark:shadow-[0_4px_8px_-2px_rgba(255,255,255,0.1)]
                `}
            >
                <input
                    type="text"
                    placeholder="Buscar por madre..."
                    class={`
                        shadow-2xl
                        dark:placeholder-gray-500 
                        dark:text-gray-100
                        placeholder-gray-600 text-gray-800
                        
                        w-full bg-transparent focus:outline-none
                        border border-transparent
                    `}
                    bind:value={buscar}
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
                    onclick={clickFilter}
                    class={`
                        border rounded-full px-3 py-1 text-md flex 
                        items-center gap-1
                        
                        ${
                            isOpenFilter
                                ? "bg-[#115642]  hover:bg-[#0f4537] border-[#115642] text-white"
                                : "bg-white  border-gray-300  hover:bg-gray-300 dark:bg-transparent dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white"
                        }
                    `}
                >
                    <Filter size="size-4" />
                    Filtros
                </button>
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
                </div>
                <div
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-transparent"
                >
                    <!-- Izquierda: texto -->
                    <div class="text-md text-gray-700 dark:text-white">
                        Total de animales seleccionados: {Object.keys(
                            selecthashmap,
                        ).length}
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
<Sticky total={Object.keys(selecthashmap).length} />
