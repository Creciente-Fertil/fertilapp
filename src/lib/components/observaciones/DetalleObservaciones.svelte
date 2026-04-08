<script>
    import estilos from "$lib/stores/estilos";
    import { getCategoriaNombre } from "../categoriasutil/lib";
    import categorias from "$lib/stores/categorias";
    import PredictSelect from "../PredictSelect.svelte";
    let {
        add = false,
        edit = false,
        cargadoanimales = false,
        animal = $bindable(""),
        animales = [],
        caravana = "",
        fecha = $bindable(""),
        categoria = $bindable(""),
        observacion = $bindable(""),
        malfecha = false,
    } = $props();

    let cadenaanimal = $state("");
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-1 p-2 pt-0">
    <div class="col-span-1 md:col-span-2">
        <label for="general" class="label pt-1">
            <span class={`label-text font-medium text-lg ${estilos.subtitle}`}
                >Datos generales</span
            >
        </label>
    </div>

    <div class="col-span-1">
        {#if add}
            {#if cargadoanimales}
                <PredictSelect
                    lista={animales}
                    etiqueta={"Animal"}
                    bind:valor={animal}
                    bind:cadena={cadenaanimal}
                    etiquetaDefault={false}
                    campo={"caravana"}
                >
                    <label for="caravana" class="label py-0 my-0">
                        <span class="label-text text-sm font-normal"
                            >Caravana</span
                        >
                    </label>
                </PredictSelect>
            {/if}
        {:else}
            <label for="caravana" class="label py-0 my-0">
                <span class="label-text text-sm font-normal">Caravana</span>
            </label>
            <label for="caravana" class="label py-0 my-0">
                <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-3`}
                    >{caravana}</span
                >
            </label>
        {/if}
    </div>
    <div>
        <label for="fecha" class="label pb-0 mb-0">
            <span class="label-text text-base">Fecha</span>
        </label>
        {#if edit || add}
            <label class="input-group">
                <input
                    id="fechanacimiento"
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
                    bind:value={fecha}
                    
                />
                {#if malfecha}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar la fecha del nacimiento</span
                        >
                    </div>
                {/if}
            </label>
        {:else}
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-3`}
                >{new Date(fecha).toLocaleDateString()}</span
            >
        {/if}
    </div>
    <div>
        <label for="tipo" class="label pb-0 mb-0">
            <span class="label-text text-base">Categoria</span>
        </label>
        {#if edit || add}
            <label class="input-group">
                <select
                    class={`
                        select select-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={categoria}
                >
                    {#each categorias as c}
                        <option value={c.id}>{c.nombre}</option>
                    {/each}
                </select>
            </label>
        {:else}
            <label
                for="categoria"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {getCategoriaNombre(categoria)}
            </label>
        {/if}
    </div>
    <div class="col-span-1 md:col-span-2 border-t dark:border-gray-800">
        <label class="form-control">
            <div class="label">
                <span
                    class={`label-text font-medium text-lg ${estilos.subtitle}`}
                    >Observacion</span
                >
            </div>
            <div class="pl-2">
                {#if edit || add}
                    <textarea
                        name="observacion"
                        id="observacion"
                        class={`
                        p-2 m-1
                        min-h-32
                        leading-tight
                        textarea textarea-bordered textarea-lg
                        
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                        bind:value={observacion}
                    >
                    </textarea>
                {:else}
                    <p class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}>
                        {observacion}
                    </p>
                {/if}
            </div>
        </label>
    </div>
</div>
