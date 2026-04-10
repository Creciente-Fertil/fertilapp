<script>
    import estilos from "$lib/stores/estilos";
    import PredictSelect from "../PredictSelect.svelte";
    const HOY = new Date().toISOString().split("T")[0];
    let {
        connacimiento,
        fecha = $bindable(""),
        madre = $bindable(""),
        nombremadre = $bindable(""),
        onelegir = () => {},
        onwrite = () => {},
        listamadres,
        cargadoanimales,
        padre = $bindable(""),
        nombrepadre = $bindable(""),
        listapadres,
        observacion = $bindable(""),
        modoedicionnacimiento,
    } = $props();
</script>

<div class="">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2 form-control">
        <div class="lg:col-span-2 lg:w-1/2">
            <label for="fechanacimiento" class="label mb-0 pb-0">
                <span class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                ">Fecha nacimiento</span>
            </label>
            <label class="input-group">
                <input
                    id="fechanacimiento"
                    type="date"
                    max={HOY}
                    class={`
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={fecha}
                />
            </label>
        </div>

        {#if cargadoanimales}
            <div>
                <PredictSelect
                    bind:valor={madre}
                    etiqueta={"Madre"}
                    bind:cadena={nombremadre}
                    lista={listamadres}
                    {onelegir}
                    {onwrite}
                    size={"w-2/3 md:w-1/2 lg:w-1/4"}
                    etiquetaDefault={false}
                    py={"py-0"}

                >
                <label for="nombremadre" class="label my-0 py-0">
                    <span class="label-text text-base my-0 py-0">
                        <span
                            class="label-text tracking-wide text-md uppercase font-semibold dark:text-gray-400 text-gray-500"
                        >
                            Madre
                        </span>
                    </span>
                </label>
                </PredictSelect>
            </div>
            <div>
                <PredictSelect
                    bind:valor={padre}
                    etiqueta={"Padre"}
                    bind:cadena={nombrepadre}
                    lista={listapadres}
                    {onelegir}
                    {onwrite}
                    size={"w-2/3 md:w-1/2 lg:w-1/4"}
                    etiquetaDefault={false}
                    py={"py-0"}
                >
                <label for="nombrepadre" class="label my-0 py-0">
                    <span class="label-text text-base my-0 py-0">
                        <span
                            class="label-text tracking-wide text-md uppercase font-semibold dark:text-gray-400 text-gray-500"
                        >
                            Padre
                        </span>
                        
                    </span>
                </label>
                </PredictSelect>
            </div>
        {/if}
        <div class="lg:col-span-2">
            <label class="form-control">
                <label for="observacion" class="label my-0 py-0">
                    <span class="label-text text-base my-0 py-0">
                        <span
                            class="label-text tracking-wide text-md uppercase font-semibold dark:text-gray-400 text-gray-500"
                        >
                            Observacion
                        </span>
                        
                    </span>
                </label>
                <div class="px-2">
                    <textarea
                    
                    name="observacion"
                    id="observacion"
                    class={`
                        textarea textarea-bordered textarea-lg
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        w-full 
                        ${estilos.bgdark2}
                    `}
                    bind:value={observacion}
                >
                </textarea>
                </div>
                
                
            </label>
        </div>
    </div>
</div>
