<script>
    import InfoAnimal from "../InfoAnimal.svelte";
    import { shorterWord } from "$lib/stringutil/lib";
    import PredictSelect from "../PredictSelect.svelte";
    import MultipleToros from "../MultipleToros.svelte";
    import estilos from "$lib/stores/estilos";
    let {
        selectanimales = $bindable([]),
        listapadres,
        padres,
        quitarAnimal = (id) => {},
        cargadoanimales = true,
        esNatural = true,
    } = $props();
</script>

{#if esNatural}
    <div class="block justify-items-center mx-1">
        {#each selectanimales as a, i}
            <div
                class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
            >
                <div class="block p-4">
                    <div class="grid grid-cols-1 gap-y-2">
                        <div class="flex items-start">
                            <span>Caravana:</span>
                            <span class="font-semibold">
                                {shorterWord(a.caravana)}
                            </span>
                        </div>
                        <div class="flex items-start ">
                            <InfoAnimal animal={a} />
                        </div>
                        <div>
                            {#if cargadoanimales}
                                <MultipleToros
                                    
                                    toros={padres}
                                    bind:valor={selectanimales[i].padresserv}
                                    bind:listavalores={selectanimales[i].padres}
                                />
                            {/if}
                        </div>
                        <div class="flex items-start">
                            <input
                                bind:value={selectanimales[i].observacion}
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
            <div
                class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
            >
                <button
                    onclick={() => quitarAnimal(a.id)}
                    class="absolute top-2 right-2 text-xl text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    aria-label="Quitar de la lista"
                >
                    ✕
                </button>
                <div class="block p-4">
                    <div class="grid grid-cols-1 gap-y-2">
                        <div class="flex items-start col-span-1">
                            <span>Caravana:</span>
                            <span class="font-semibold">
                                {shorterWord(a.caravana)}
                            </span>
                        </div>
                        <div class="flex items-start col-span-2">
                            <InfoAnimal animal={a} />
                        </div>
                        <div class="flex items-start col-span-2">
                            {#if cargadoanimales}
                                <PredictSelect
                                    bind:valor={selectanimales[i].padre}
                                    etiqueta={"Padre"}
                                    bind:cadena={selectanimales[i].pajuela}
                                    lista={listapadres}
                                />
                            {/if}
                        </div>

                        <div class="flex items-start col-span-2">
                            <input
                                bind:value={selectanimales[i].observacion}
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
