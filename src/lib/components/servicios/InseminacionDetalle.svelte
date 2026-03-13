<script>
    import estilos from "$lib/stores/estilos";
    import PredictSelect from "../PredictSelect.svelte";

    let {
        edit,
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

<div class="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 pt-0">
    <div class="col-span-1 md:col-span-2">
        <label for="madre" class="label pt-1">
            <span class={`label-text font-medium text-lg ${estilos.subtitle}`}
                >Datos generales</span
            >
        </label>
    </div>
    <div class="col-span-1">
        <label for="nombre" class="label py-0 my-0">
            <span class="label-text text-sm font-normal">Madre</span>
        </label>

        <label for="nombre" class="label py-0 my-0 pl-2">
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0`}
                >{caravanamadre}</span
            >
        </label>
    </div>
    <div class="col-span-1">
        <label for="tipo" class="label py-0 my-0">
            <span class="label-text text-sm font-normal">Tipo</span>
        </label>
        <label for="tipo" class="label py-0 my-0 pl-2">
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0`}
                >Artificial</span
            >
        </label>
    </div>
    <div class="col-span-1 md:col-span-2 border-t dark:border-gray-800">
        <label for="madre" class="label">
            <span class={`label-text font-medium text-lg ${estilos.subtitle}`}
                >Fechas</span
            >
        </label>
    </div>
    <div>
        <label for="fechainseminacion" class="label py-0 my-0">
            <span class="label-text text-sm py-0 my-0"
                >Fecha de inseminacion</span
            >
        </label>
        <label class="input-group pl-2">
            {#if edit}
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
            {:else}
                <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                    >{new Date(fechainseminacion).toLocaleDateString()}</span
                >
            {/if}
        </label>
    </div>
    <div>
        <label for="fechaparto" class="label py-0 my-0">
            <span class="label-text text-sm">Fecha estimada de parto</span>
        </label>

        <label for="fechaparto" class="input-group pl-2">
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                    >{new Date(fechaparto).toLocaleDateString()}</span
                >
        </label>
    </div>
    <div>
        {#if cargado}
            <PredictSelect
                {edit}
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

    <div class="col-span-1 md:col-span-2 border-t dark:border-gray-800">
        <label class="form-control">
            <div class="label">
                <span class={`label-text font-medium text-lg ${estilos.subtitle}`}>Observacion</span>
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
