<script>
    import InfoAnimal from "../InfoAnimal.svelte";
    import { slide } from "svelte/transition";
    import { shorterWord } from "$lib/stringutil/lib";
    import PredictSelect from "../PredictSelect.svelte";
    import MultipleToros from "../MultipleToros.svelte";
    import SelectToros from "../SelectToros.svelte";

    import Arrowdownsimple from "$lib/svgs/arrowdownsimple.svelte";
    import estilos from "$lib/stores/estilos";
    import { onMount } from "svelte";

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
    let verLista = $state(false);
    function toggleLista() {
        verLista = !verLista;
    }
    onMount(()=>{
         verLista = abierta
    })
</script>

{#if selectanimales.length > 0}
    <button
        onclick={toggleLista}
        class="flex items-center justify-between w-full px-4 py-2"
    >
        <h1
            class={`
                    text-xl font-normal 
                    dark:text-white text-gray-900
                `}
        >
            Madres seleccionadas
        </h1>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class={`h-5 w-5 transition-transform duration-300 ${verLista ? "" : "rotate-180"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
            />
        </svg>
    </button>
{/if}
{#if verLista}
    <div transition:slide>
        {#if esNatural}
            <div class="block justify-items-center mx-1">
                {#each selectanimales as a, i}
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
                                            >{shorterWord(a.caravana)}</span
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
                                    class="hidden"
                                >
                                    {#if cargadoanimales}
                                        <MultipleToros
                                            toros={padres}
                                            {cambiar}
                                            bind:valor={
                                                selectanimales[i].padresserv
                                            }
                                            bind:listavalores={
                                                selectanimales[i].padres
                                            }
                                        />
                                    {/if}
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
                                            selectanimales[i].observacion
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
                {#each selectanimales as a, i}
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
                                            >{shorterWord(a.caravana)}</span
                                        >
                                    </div>
                                    <button
                                        class={`${estilos.basico} ${estilos.chico} ${estilos.primario}`}
                                        onclick={() => verAnimal(a.id)}
                                    >
                                        Ver
                                    </button>
                                </div>

                                <div class="flex items-start col-span-2">
                                    {#if cargadoanimales}
                                        <PredictSelect
                                            {cambiar}
                                            bind:valor={selectanimales[i].padre}
                                            etiqueta={"Padre"}
                                            bind:cadena={
                                                selectanimales[i].pajuela
                                            }
                                            lista={listapadres}
                                        />
                                    {/if}
                                </div>

                                <div class="flex items-start col-span-2">
                                    <input
                                        bind:value={
                                            selectanimales[i].observacion
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
{/if}
