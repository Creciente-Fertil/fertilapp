<script>
    import { shorterWord } from "$lib/stringutil/lib";
    import estilos from "$lib/stores/estilos";
    import { capitalize } from "$lib/stringutil/lib";    
    let {
        listaanimales=[],
        quitarAnimal = (id)=>{}
    } = $props()

</script>
<div class="block justify-items-center mx-1">
    {#each listaanimales as a,i}
        <div class="card  w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900">
            <!-- Botón "Quitar" en la esquina superior derecha -->
            <button
                onclick={()=>quitarAnimal(a.id)}
                class="absolute top-2 right-2 text-xl text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Quitar de la lista"
            >
                ✕
            </button>
            <div class="block p-4 pt-6">
                <div class="grid grid-cols-2 gap-y-2">
                    <div class="flex items-start col-span-2">
                        <span >Caravana:</span> 
                        <span class="font-semibold">
                          {shorterWord(a.caravana)}
                        </span>
                    </div>
                    <div class="flex items-start col-span-2">
                        <span >Lote:</span> 
                        <span class="font-semibold">
                            {
                                a.expand?
                                a.expand.lote?
                                a.expand.lote.nombre:
                                "":
                                ""
                            }
                        </span>
                    </div>
                    <div class="flex items-start col-span-2">
                        <span >Rodeo:</span> 
                        <span class="font-semibold">
                            {
                                a.expand?
                                a.expand.rodeo?
                                a.expand.rodeo.nombre:
                                "":
                                ""
                            }
                        </span>
                    </div>
                    <div class="flex items-start col-span-2">
                        <span >Categoria:</span> 
                        <span class="font-semibold">
                            {
                                capitalize(a.categoria)
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>