<script>
    import estilos from "$lib/stores/estilos";
    import PredictSelect from "../PredictSelect.svelte";

    let {
        caravanamadre,
        cargado,
        categoria,
        fechainseminacion = $bindable(""),
        fechaparto = $bindable(""),
        observacion = $bindable(""),
        padre = $bindable(""),
        pajuela = $bindable(""),
        listapadres = [],
        tiposanimal = [],
    } = $props();
    let padresserv = $state("");
    function onelegir(id) {}
    function onwrite() {}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-1">
    <div class="col-span-1 md:col-span-2">
        <label for="nombre" class="label">
            <span class="label-text text-base">Caravana</span>
        </label>

        <label for="nombre" class="label">
            <span class="text-md">{caravanamadre}</span>
        </label>
    </div>
    <div>
        <label for="tipo" class="label">
            <span class="label-text text-base">Categoria</span>
        </label>
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
                disabled
                bind:value={categoria}
            >
                {#each tiposanimal as t}
                    <option value={t.id}>{t.nombre}</option>
                {/each}
            </select>
        </label>
    </div>
    <div>
        {#if cargado}
            <PredictSelect
                {onwrite}
                {onelegir}
                bind:valor={padre}
                etiqueta={"Padre"}
                bind:cadena={pajuela}
                lista={listapadres}
                size="w-1/2"
            />
        {/if}
    </div>
    <div>
        <label for="fechainseminacion" class="label">
            <span class="label-text text-base">Fecha de inseminacion</span>
        </label>
        <label class="input-group">
            <input
                id="fechainseminacion"
                type="date"
                class={`
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                bind:value={fechainseminacion}
            />
        </label>
    </div>
    <div>
        <label for="fechaparto" class="label">
            <span class="label-text text-base">Fecha estimada de parto</span>
        </label>
        <label class="input-group">
            <input
                disabled
                id="fechaparto"
                type="date"
                class={`
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
    <div class="col-span-1 md:col-span-2">
        <label class="form-control">
            <div class="label">
                <span class="label-text">Observacion</span>
            </div>
            <input
                id="observacion"
                type="text"
                class={`
                        input 
                        input-bordered 
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                bind:value={observacion}
            />
        </label>
    </div>
</div>


