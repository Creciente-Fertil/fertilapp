<script>
    import InfoAnimal from "../InfoAnimal.svelte";
    import { slide } from "svelte/transition";
    import { shorterWord } from "$lib/stringutil/lib";
    import PredictSelect from "../PredictSelect.svelte";
    import MultipleToros from "../MultipleToros.svelte";
    import SelectToros from "../SelectToros.svelte";

    import Arrowdownsimple from "$lib/svgs/arrowdownsimple.svelte";
    import estilos from "$lib/stores/estilos";
    import FilaDetalleMovimiento from "./FilaDetalleMovimiento.svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        selectanimales = $bindable([]),
        abierta = false,
        listapadres,
        padres,
        cambiar = () => {},
        quitarAnimal = (id) => {},
        verAnimal = (id) => {},
        cargadoanimales = false,
        esNatural = true,
    } = $props();
    let mostrarfilas = $state(3);
    function mostrarmas() {
        mostrarfilas = Math.min(mostrarfilas + 3, rows.length);
    }
    function mostrarmenos() {
        mostrarfilas = Math.max(mostrarfilas - 3, 3);
    }
    let buscar = $state("");
    let rows = $derived(
        selectanimales.filter((a) =>
            a.caravana.toLowerCase().includes(buscar.toLocaleLowerCase()),
        ),
    );
    let rowsmostrar = $derived(rows.slice(0, mostrarfilas));
    let verLista = $state(abierta);
    function toggleLista() {
        verLista = !verLista;
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
    class="
        container mx-auto py-3 px-4 max-w-7xl
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
                {#if esNatural}
                    <div class="col-span-3 ">Padres</div>
                {:else}
                    <div class="col-span-3 ">Padre</div>
                {/if}
                <div class="col-span-4 ">Observaciones</div>
                <div class="col-span-2 text-right">Acciones</div>
            </div>

            <div class="divide-y divide-slate-200 dark:divide-slate-700">
                {#if cargadoanimales}
                    {#each rowsmostrar as a, i}
                        <FilaDetalleMovimiento
                            {cargadoanimales}
                            animal={a}
                            id={a.id}
                            {quitarAnimal}
                            {verAnimal}
                            {cambiar}
                            bind:selectanimales
                            {listapadres}
                            {esNatural}
                            {padres}
                            {i}
                        />
                    {/each}
                    {#if rowsmostrar.length < rows.length}
                        <div
                            class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 text-center"
                        >
                            <button
                                onclick={mostrarmas}
                                class="text-sm text-slate-500 dark:text-slate-400  hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors duration-150"
                            >
                                ↓ Cargar más madres
                            </button>
                        </div>
                    {/if}
                    {#if rowsmostrar.length > 3}
                        <div
                            class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 text-center"
                        >
                            
                            <button
                                onclick={mostrarmenos}
                                class="text-sm text-slate-500 dark:text-slate-400  hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors duration-150"
                            >
                                ↑ Cargar menos madres
                            </button>
                        </div>
                    {/if}
                {/if}
            </div>
            <div class="hidden" transition:slide>
                {#if esNatural}
                    <div class="block justify-items-center mx-1">
                        {#each rows as a, i}
                            <div class="card w-full shadow-xl p-2">
                                <button
                                    onclick={() => quitarAnimal(a.id)}
                                    class="absolute top-2 right-2 text-xl text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                    aria-label="Quitar de la lista"
                                >
                                    ✕
                                </button>
                                <div class="block p-4">
                                    <div class="grid grid-cols-1 gap-y-2">
                                        <div
                                            class="flex items-start justify-between px-1 md:px-4"
                                        >
                                            <div>
                                                <span>Caravana:</span>
                                                <br />
                                                <span class="font-semibold"
                                                    >{shorterWord(
                                                        a.caravana,
                                                    )}</span
                                                >
                                            </div>
                                            <button
                                                class={`${estilos.basico} ${estilos.chico} ${estilos.primario}`}
                                                onclick={() => verAnimal(a.id)}
                                            >
                                                Ver
                                            </button>
                                        </div>

                                        <div>
                                            {#if cargadoanimales}
                                                <SelectToros
                                                    opciones={padres}
                                                    bind:valores={
                                                        selectanimales[i].padres
                                                    }
                                                    agregarElemento={cambiar}
                                                    quitarElemento={cambiar}
                                                    margintop=""
                                                    py="py-2"
                                                    px="px-1"
                                                    campo="caravana"
                                                />
                                            {/if}
                                        </div>
                                        <div class="flex items-start">
                                            <input
                                                bind:value={
                                                    selectanimales[i]
                                                        .observacion
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
                {:else}
                    <div class="block justify-items-center mx-1">
                        {#each rows as a, i}
                            <div class="card w-full shadow-xl p-2">
                                <button
                                    onclick={() => quitarAnimal(a.id)}
                                    class="absolute top-2 right-2 text-xl text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                    aria-label="Quitar de la lista"
                                >
                                    ✕
                                </button>
                                <div class="block p-4">
                                    <div class="grid grid-cols-1 gap-y-2">
                                        <div
                                            class="flex items-start justify-between px-1 md:px-4"
                                        >
                                            <div>
                                                <span>Caravana:</span>
                                                <br />
                                                <span class="font-semibold"
                                                    >{shorterWord(
                                                        a.caravana,
                                                    )}</span
                                                >
                                            </div>
                                            <button
                                                class={`${estilos.basico} ${estilos.chico} ${estilos.primario}`}
                                                onclick={() => verAnimal(a.id)}
                                            >
                                                Ver
                                            </button>
                                        </div>

                                        <div
                                            class="flex items-start col-span-2"
                                        >
                                            {#if cargadoanimales}
                                                <PredictSelect
                                                    {cambiar}
                                                    bind:valor={
                                                        selectanimales[i].padre
                                                    }
                                                    etiqueta={"Padre"}
                                                    bind:cadena={
                                                        selectanimales[i]
                                                            .pajuela
                                                    }
                                                    lista={listapadres}
                                                />
                                            {/if}
                                        </div>

                                        <div
                                            class="flex items-start col-span-2"
                                        >
                                            <input
                                                bind:value={
                                                    selectanimales[i]
                                                        .observacion
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
                {/if}
            </div>
        </div>
    </div>
</div>
