<script>
    import estilos from "$lib/stores/estilos";
    import InfoAnimal from "../InfoAnimal.svelte";
    import { shorterWord } from "$lib/stringutil/lib";
    let { selectanimales = $bindable([]) } = $props();
</script>

<div class="block justify-items-center mx-1">
    {#each selectanimales as a, i}
        <div
            class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
        >
            <div class="block p-4">
                <div class="grid grid-cols-2 gap-y-2">
                     <div class="flex items-start col-span-2">
                        <span>Caravana:</span>
                        <span class="font-semibold">
                            {shorterWord(a.caravana)}
                        </span>
                    </div>
                    <div class="flex items-start col-span-2">
                        <InfoAnimal animal={a} />
                    </div>
                    <div class="flex items-start col-span-2">
                        <span>Peso:</span>
                        <span class="font-semibold">
                            {a.peso}
                        </span>
                    </div>
                    <div class="flex items-start col-span-2">
                        <label class="input-group">
                            <input
                                bind:value={selectanimales[i].pesonuevo}
                                oninput={() =>
                                    (selectanimales[i].pesonuevo = Math.max(
                                        0,
                                        selectanimales[i].pesonuevo,
                                    ))}
                                class={`
                                    input input-bordered w-full
                                    border border-gray-300 rounded-md
                                    focus:outline-none focus:ring-2 
                                    focus:ring-green-500 focus:border-green-500
                                    ${estilos.bgdark2}
                                `}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>
