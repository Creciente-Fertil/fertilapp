<script>
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import ExportarSmall from "../ExportarSmall.svelte";
    import { goto } from "$app/navigation";
    import Arrowdown from "$lib/svgs/arrowdown.svelte";
    import Sparkies from "$lib/svgs/sparkies.svelte";
    import Rubber from "$lib/svgs/rubber.svelte";
    import Filter from "$lib/svgs/filter.svelte";
    import Limpiar from "$lib/svgs/limpiar.svelte";
    import Sticky from "./Sticky.svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        cabnombre = "",
        selecthash = {},
        pesajesrows = [],
        //paginacion
        pageSize = $bindable(10),
        isOpenFilter = $bindable(false),
        buscar = $bindable(""),

        fechadesde = $bindable(""),
        fechahasta = $bindable(""),
        //funciones
        limpiarFiltros = () => {},
        prepararData = () => {},

        filterUpdate = () => {},
        clickFilter = () => {},
        nuevo = () => {},
        ultimos = () => {},
    } = $props();
    function volver() {
        goto(pre + "/pesajes");
    }
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
                <button onclick={volver}>
                    <h1
                        class={`
                            text-3xl font-semibold 
                            dark:text-white text-gray-900                  
                        `}
                    >
                        Pesajes
                    </h1>
                </button>
            </div>
            <button
                class={`
                    ${estilos.btnbuscador}
                    ${estilos.btntextbuscador}
                `}
                onclick={nuevo}
            >
                + Nuevo Pesaje
            </button>
            <button
                class={`
                    ${estilos.btnbuscador}
                    ${estilos.btntextbuscador}
                `}
                onclick={ultimos}
            >
                Últimos
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
                  rounded-full p-3
                
                  bg-white dark:bg-gray-900
                  shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
                  dark:shadow-[0_4px_8px_-2px_rgba(255,255,255,0.1)]
                `}
            >
                <input
                    type="text"
                    placeholder="Buscar por madre ..."
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
                <ExportarSmall
                    titulo={"Pesajes"}
                    filtros={[]}
                    confiltros={false}
                    data={pesajesrows}
                    sheetname={"Pesajes"}
                    establecimiento={cabnombre}
                    {prepararData}
                    datahash={selecthash}
                    conhash={true}
                    py="py-1"
                    rounded="rounded-full"
                />
            </div>
        </div>
        
        {#if isOpenFilter}
            <div transition:slide>
                <div
                    class="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-10 w-full p-1 md:p-4"
                >
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
                </div>
                <!--Pesajes encontrados-->
                <div
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-1 md:p-4 bg-transparent rounded-lg"
                >
                    <div class="text-md text-gray-700 dark:text-white">
                        <span class="hidden xl:block"
                            >Total de pesajes seleccionados: {Object.keys(
                                selecthash,
                            ).length}</span
                        >
                        <span class="xl:hidden">
                            Pesajes seleccionados: {Object.keys(selecthash)
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
