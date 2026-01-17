<script>
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import ExportarSmall from "../ExportarSmall.svelte";
    import { onMount } from "svelte";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        rodeosrows,
        buscar = $bindable(""),
        vacios = $bindable(false),
        nuevo = () => {},
        limpiarFiltros = () => {},
        filterUpdate = () => {}
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
                    Rodeos
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
                    <span class="text-lg">+ Nuevo rodeo</span>
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
        <!--Rodeos encontrados-->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-transparent rounded-lg"
        >
            <!-- Izquierda: texto -->
            <div class="text-md text-gray-700 dark:text-white">
                Total de rodeos encontrados: {rodeosrows.length}
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
                
                
            </div>
        </div>
    </div>
</div>
