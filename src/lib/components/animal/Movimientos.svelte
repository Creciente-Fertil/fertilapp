<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import estilos from "$lib/stores/estilos";
    import PocketBase from 'pocketbase'
    import tiposanimal from '$lib/stores/tiposanimal';
    import categorias from "$lib/stores/categorias";
    import estados from "$lib/stores/estados";
    import {capitalize} from "$lib/stringutil/lib"
    import { getEstadoNombre } from "../estadosutils/lib";
    import TablaMovs from "./TablaMovs.svelte";
    
    
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let id = $state("")
    let historial = $state([])
    let filas = $state([])

    function procesarHistorial(p_historial){

    }
    async function getHistorial(){
        historial = await pb.collection("historialanimales").getFullList({
            filter:`animal='${id}'`,
            sort:"-created",
            expand:"lote,rodeo"
        })

    }
    
    onMount(async ()=>{
        id = $page.params.slug
        await getHistorial()
    })
</script>

<div class="hidden w-full md:block justify-items-center mx-1 lg:w-3/4 overflow-x-auto">
    {#if historial.length == 0}
        <p class="mt-5 text-lg">No recibio modificaciones</p>
    {:else}
        <TablaMovs
            movimientos = {historial}
        />
        
    {/if}
</div>
<div class="block w-full md:hidden justify-items-center mx-1 lg:w-3/4 overflow-x-auto">
    {#if historial.length == 0}
        <p class="mt-5 text-lg">No recibio modificaciones</p>
    {:else}
        {#each historial as h}
        <div class="card  w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900">
            <div class="block p-4">
                <div class="grid grid-cols-2 gap-y-2">
                    <div class="flex items-start">
                      <span >Fecha:</span> 
                      <span class="font-semibold">
                        {`${new Date(h.created).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div class="flex items-start">
                      <span >Lote:</span> 
                      <span class="font-semibold">
                        {
                            h.expand?
                                h.expand.lote?
                                    h.expand.lote.nombre:
                                "":
                            ""
                        }
                      </span>
                    </div>
                    <div class="flex items-start">
                      <span >Rodeo:</span> 
                      <span class="font-semibold">
                        {
                            h.expand?
                                h.expand.rodeo?
                                    h.expand.rodeo.nombre:
                                "":
                            ""
                        }
                      </span>
                    </div>
                    <div class="flex items-start">
                      <span >Categoria:</span> 
                      <span class="font-semibold">
                        {capitalize(h.categoria)}
                      </span>
                    </div>
                    <div class="flex items-start">
                        <span >Estado:</span> 
                        <span class="font-semibold">
                            {getEstadoNombre(h.prenada)}
                        </span>
                    </div>
                    <div class="flex items-start">
                      <span >Peso:</span> 
                      <span class="font-semibold">
                        {h.peso}
                      </span>
                    </div>
                    <div class="flex items-start col-span-2">
                        <span >Nacimiento:</span> 
                        <span class="font-semibold">
                            {`${h.fechanacimiento?new Date(h.fechanacimiento).toLocaleDateString():""}`}
                        </span>
                    </div>
                    <div class="flex items-start">
                        <span >Sexo:</span> 
                        <span class="font-semibold">
                            {h.sexo}
                        </span>
                    </div>
                    <div class="flex items-start">
                        <span >Caravana:</span> 
                        <span class="font-semibold">
                          {h.caravana}
                        </span>
                    </div>



                </div>
            </div>
        </div>
        {/each}
    {/if}
</div>