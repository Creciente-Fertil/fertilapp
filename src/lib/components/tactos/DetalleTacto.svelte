<script>
    import estilos from "$lib/stores/estilos";
    import categorias from "$lib/stores/categorias";
    import tipostacto from "$lib/stores/tipostacto";
    import estados from "$lib/stores/estados";
    import { getEstadoNombre } from "../estadosutils/lib";
    import { getCategoriaNombre } from "../categoriasutil/lib";
    
    let {
        edit = false,
        idtacto = $bindable(""),
        
        caravana = $bindable(""),
        fecha = $bindable(""),
        observacion = $bindable(""),
        prenada = $bindable(1),
        tipo = $bindable(""),
        categoria = $bindable(""),
        malfecha = false,
        oninput = () => {},
    } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-1 p-2 pt-0">
    <div class="col-span-1 md:col-span-2">
        <label for="general" class="label pt-1">
            <span class={`label-text font-medium text-lg ${estilos.subtitle}`}
                >Datos generales </span
            >
        </label>
    </div>
    <div class="col-span-1">
        <label for="caravana" class="label py-0 my-0">
            <span class="label-text text-sm font-normal">Caravana</span>
        </label>
        <label for="caravana" class="label py-0 my-0">
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0`}
                >{caravana}</span
            >
        </label>
    </div>
    <div>
        <label for="tipo" class="label pb-0 mb-0">
            <span class="label-text text-base">Categoria</span>
        </label>
        {#if edit}
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
                {#each categorias.filter((c) => c.sexo == "H") as t}
                    <option value={t.id}>{t.nombre}</option>
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
    <div>
        <label for="prenada" class="label mb-0 pb-0">
            <span class="label-text text-base"> Estado</span>
        </label>
        {#if edit}
            <label class="input-group">
                <select
                    class={`
                        select select-bordered
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={prenada}
                >
                    {#each estados as s}
                        <option value={s.id}>{s.nombre}</option>
                    {/each}
                </select>
            </label>
        {:else}
            <label
                for="prenada"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {getEstadoNombre(prenada)}
            </label>
        {/if}
    </div>
    <div>
        <label for="fecha" class="label pb-0 mb-0">
            <span class="label-text text-base">Fecha </span>
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
                    bind:value={fecha}
                    onchange={() => oninput("FECHA")}
                />
                {#if malfecha}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar la fecha del tacto</span
                        >
                    </div>
                {/if}
            {:else}
                <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-3`}
                    >{new Date(fecha).toLocaleDateString()}</span
                >
            {/if}
        </label>
    </div>
    <div>
        <label for="tipo" class="label pb-0 mb-0">
            <span class="label-text text-base">Tacto/Ecografia</span>
        </label>
        {#if edit}
        <label class="input-group">
            <select
                class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                bind:value={tipo}
            >
                {#each tipostacto as t}
                    <option value={t.id}>{t.nombre}</option>
                {/each}
            </select>
        </label>
        {:else}
            <label
                for="tipotacto"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {tipo=="eco"?"Ecografía":"Tacto"}
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
                {#if edit}
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
