<script>
    import estilos from "$lib/stores/estilos";
    import AgregarAnimal from "../eventos/AgregarAnimal.svelte";
    import PredictSelect from "../PredictSelect.svelte";
    let {
        edit = false,
        add = false,
        cargado = false,

        idanimal = $bindable(""),
        agregaranimal = $bindable(false),
        caravana = $bindable(""),
        categoria = $bindable(""),
        sexo = $bindable(""),
        peso = $bindable(0),

        caravananimal = "",

        fecha = $bindable(""),
        madre = $bindable(""),
        padre = $bindable(""),
        nombremadre = $bindable(""),
        nombrepadre = $bindable(""),
        observacion = $bindable(""),
        onchange = () => {},
        malfecha = false,
        listamadres = [],
        listapadres = [],
        onelegirMadre = () => {},
        onwriteMadre = () => {},
        onelegirPadre = () => {},
        onwritePadre = () => {},
    } = $props();
    let cadena = $state("");
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-1 p-2 pt-0">
    <div class="col-span-1 md:col-span-2">
        <label for="general" class="label pt-1">
            <span class={`label-text font-medium text-lg ${estilos.subtitle}`}
                >Datos generales</span
            >
        </label>
    </div>
    {#if add}
        <div class="col-span-1 md:col-span-2">
            <AgregarAnimal
                bind:agregaranimal
                bind:caravana
                bind:categoria
                bind:sexo
                bind:peso
                bind:fechanacimiento={fecha}
                confechanac={true}
            />
        </div>
    {:else}
        <div class="col-span-1">
            <label for="caravana" class="label py-0 my-0">
                <span class="label-text text-sm font-normal">Caravana</span>
            </label>
            <label for="caravana" class="label py-0 my-0">
                <span class={`text-lg ${estilos.labelcolor} py-0 my-0`}
                    >{caravananimal.length > 0
                        ? caravananimal
                        : "Sin animal"}</span
                >
            </label>
        </div>
    {/if}
    <div>
        <label for="fechanacimiento" class="label pb-0 mb-0">
            <span class="label-text text-sm py-0 mb-3">Fecha nacimiento</span>
        </label>
        {#if edit}
            <label class="input-group px-2 ">
            
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
                    onchange={() => onchange("FECHA")}
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
            <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                >{new Date(fecha).toLocaleDateString()}</span
            >
        {/if}
    </div>
    {#if cargado}
        <div>
            <PredictSelect
                bind:valor={madre}
                etiqueta={"Madre"}
                bind:cadena={nombremadre}
                lista={listamadres}
                onelegir={onelegirMadre}
                onwrite={onwriteMadre}
                etiquetaDefault={false}
                {edit}
            >
                <label for="nombremadre" class="label pb-0 mb-0">
                    <span class="label-text text-sm py-0 my-0">Madre</span>
                </label>
            </PredictSelect>
        </div>
        <div>
            <PredictSelect
                bind:valor={padre}
                etiqueta={"Padre"}
                bind:cadena={nombrepadre}
                lista={listapadres}
                onelegir={onelegirPadre}
                onwrite={onwritePadre}
                etiquetaDefault={false}
                {edit}
            >
                <label for="nombrepadre" class="label pb-0 mb-0">
                    <span class="label-text text-sm py-0 my-0">Padre</span>
                </label>
            </PredictSelect>
        </div>
    {/if}
    <div class="col-span-1 md:col-span-2 border-t dark:border-gray-800">
        <label class="form-control">
            <div class="label">
                <span
                    class={`label-text font-medium text-sm ${estilos.subtitle}`}
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
