<script>
    import estilos from "$lib/stores/estilos";
    import MultipleToros from "../MultipleToros.svelte";
    import MultiSelect from "../MultiSelect.svelte";
    import SelectToros from "../SelectToros.svelte";

    let {
        edit,
        caravanamadre,
        cargado,
        fechadesde = $bindable(""),
        fechahasta = $bindable(""),
        fechaparto = $bindable(""),
        padreslist = $bindable([]),
        observacion = $bindable(""),
        toros = [],
        versionjava=false
    } = $props();
    let padresserv = $state("");
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-1 p-2 pt-0">
    <div class="col-span-1 md:col-span-2">
        <label for="datosgenerales" class="label pt-1">
            <span class={`label-text font-medium text-lg ${estilos.subtitle}`}>Datos generales</span>
        </label>
    </div>
    <div class="col-span-1">
        <label for="madre" class="label py-0 my-0">
            <span class="label-text text-sm font-normal">Madre</span>
        </label>
        <label for="madre" class="label py-0 my-0">
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0`}>{caravanamadre}</span>
        </label>
    </div>
    <div class="col-span-1">
        <label for="tipo" class="label py-0 my-0">
            <span class="label-text text-sm font-normal">Tipo</span>
        </label>
        <label for="tipo" class="label py-0 my-0">
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0`}>Natural</span>
        </label>
    </div>
    <div class="col-span-1 md:col-span-2 border-t dark:border-gray-800">
        <label for="madre" class="label">
            <span class={`label-text font-medium text-lg ${estilos.subtitle}`}>Fechas</span>
        </label>
    </div>
    <div>
        <label for="fechadesde" class="label py-0 my-0">
            <span class="label-text text-sm py-0 my-0">Fecha desde</span>
        </label>
        <label class="input-group">
            {#if edit}
                <input
                    id="fechadesde"
                    type="date"
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={fechadesde}
                />
            {:else}
                <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                    >{new Date(fechadesde).toLocaleDateString()}</span
                >
            {/if}
        </label>
    </div>
    
    <div>
        <label for="fecha" class="label py-0 my-0">
            <span class="label-text text-sm py-0 my-0">Fecha hasta</span>
        </label>
        <label class="input-group">
            {#if edit}
                <input
                    id="fecha"
                    type="date"
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={fechahasta}
                />
            {:else}
                <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                    >{fechahasta.length > 0
                        ? new Date(fechahasta).toLocaleDateString()
                        : "Sin fecha"}</span
                >
            {/if}
        </label>
    </div>
    
    <!--Fecha parto-->
    <div class="pt-2    ">
        <label for="fechaparto" class="label py-0 my-0">
            <span class="label-text text-sm">Fecha parto</span>
        </label>

        <label class="input-group">
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                >{new Date(fechaparto).toLocaleDateString()}</span
            >
            <input
                disabled
                id="fechaparto"
                type="date"
                class={`
                        hidden
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                bind:value={fechaparto}
            />
        </label>
    </div>

    <div class="hidden">
        <label for="padres" class="label">
            <span class="label-text text-sm font-normal">Padres</span>
        </label>
        <label class="input-group">
            {#if cargado }
                <MultipleToros
                    {toros}
                    {edit}
                    bind:valor={padresserv}
                    bind:listavalores={padreslist}
                />
                
            {/if}
        </label>
    </div>
    {#if cargado }
        <div>
            <SelectToros
                opciones={toros}
                campo="caravana"
                bind:valores={padreslist}
                {edit}
                etiquetaDefault={false}
                py={"py-0"}
            
            >
            <label for="padres" class="label pb-0 mb-0">
                <span class="label-text text-sm font-normal">Padres</span>
            </label>
            </SelectToros>
        </div>
    {/if}

    <!--Observacion-->
    <div class="col-span-1 md:col-span-2 border-t dark:border-gray-800">
        <label class="form-control">
            <div class="label">
                <span class={`label-text font-medium text-lg ${estilos.subtitle}`}>Observacion</span>
            </div>
            {#if edit}
                <textarea
                    
                    name="observacion"
                    id="observacion"
                    class={`
                        textarea textarea-bordered textarea-lg
                        
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                    bind:value={observacion}
                >
                </textarea>
                
            {:else}
                <p class={`text-lg ${estilos.labelcolor} py-2 my-0 px-1`}>{observacion}</p>
            {/if}
        </label>
    </div>
</div>
