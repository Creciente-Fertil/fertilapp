<script>
    import InfoAnimal from "../InfoAnimal.svelte";
    import { slide } from "svelte/transition";
    import { shorterWord } from "$lib/stringutil/lib";


    import Arrowdownsimple from "$lib/svgs/arrowdownsimple.svelte";
    import estilos from "$lib/stores/estilos";
    import FilaDetalleMovimiento from "./FilaDetalleMovimiento.svelte";
    import { onMount } from "svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        selectanimales = $bindable([]),
        abierta = false,
        
        cambiar = () => {},
        quitarAnimal = (id) => {},
        verAnimal = (id) => {},
        cargadoanimales = false,
        
    } = $props();
    let minimo = 3
    let mostrarfilas = $state(minimo);
    function mostrarmas() {
        mostrarfilas = Math.min(mostrarfilas + minimo, rows.length);
    }
    function mostrarmenos() {
        mostrarfilas = Math.max(mostrarfilas - minimo, minimo);
    }
    let buscar = $state("");
    let rows = $derived(
        selectanimales.filter((a) =>
            a.caravana.toLowerCase().includes(buscar.toLocaleLowerCase()),
        ),
    );
    let rowsmostrar = $derived(rows.slice(0, mostrarfilas));
    let verLista = $state(false);
    function toggleLista() {
        verLista = !verLista;
    }
    onMount(()=>{
        verLista = abierta
    })
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
    class="
    pt-1 md:pt-2 lg:pt-5
        container mx-auto  px-4 max-w-7xl
        max-h-[500px] overflow-y-auto custom-scrollbar  
        "
>
    <div
        class={`
            rounded-2xl p-1 md:p-3  mb-1
            dark:bg-slate-900 bg-white
            shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
            dark:shadow-none
            
        `}
    >
        <div class="flex flex-col gap-1 mb-1">
            <div
                class={`
                    bg-transparent
                    py-1 
                `}
            >
                <div class="flex items-center justify-between gap-4">
                    <!-- Lado izquierdo: Icono + Título + Badge -->
                    <div class="flex items-center gap-3">
                        <h1
                            class={`
                            flex text-left
                            text-2xl font-semibold 
                            dark:text-[#24a579] text-[#115642]
                        `}
                        >
                            Madres seleccionadas
                        </h1>
                        <!-- Badge -->
                        <span
                            class={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            bg-gray-100 text-gray-800
                            dark:bg-gray-700 dark:text-gray-200
                        `}
                        >
                            {rows.length} animales
                        </span>
                    </div>
                    <!-- Lado derecho: Buscador + Botón toggle -->
                    <div class="flex items-center gap-3">
                        <!--Buscador-->
                        <div class="relative">
                            <div
                                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                            >
                                <svg
                                    class="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                class={`
                                    pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300
                                    dark:border-gray-600 focus:outline-none focus:ring-2
                                    focus:ring-green-500 focus:border-green-500
                                    ${estilos.bgdark2} dark:bg-gray-800 dark:text-white
                                    placeholder-gray-500 dark:placeholder-gray-400
                                `}
                                placeholder="Buscar caravana..."
                                bind:value={buscar}
                                onclick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <!-- Encabezados de columnas -->
            <div
                class="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
                <div class="col-span-3">Caravana</div>
                <div class="col-span-3 ">Estado</div>
                <div class="col-span-4 ">Observaciones</div>
                <div class="col-span-2 text-right">Acciones</div>
            </div>

            <div class="divide-y divide-slate-200 dark:divide-slate-700">
                
                    {#each rows as a, i}
                        <FilaDetalleMovimiento
                            bind:selectanimales
                            animal={a}
                            id={a.id}
                            {quitarAnimal}
                            {verAnimal}
                            {cambiar}
                            
                            {i}
                        />
                    {/each}
                    
                
            </div>
        </div>
    </div>
</div>
