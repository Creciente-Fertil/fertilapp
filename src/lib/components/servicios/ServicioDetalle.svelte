<script>
    import estilos from "$lib/stores/estilos";
    import MultipleToros from "../MultipleToros.svelte";

    let {
        caravanamadre,
        cargado,
        fechadesde = $bindable(""),
        fechahasta = $bindable(""),
        fechaparto = $bindable(""),
        padreslist = $bindable([]),
        observacion = $bindable(""),
        toros = [],
    } = $props();
    let padresserv = $state("");

</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-1">
    <div class="col-span-1 md:col-span-2">
        <label for="madre" class="label">
            <span class="label-text text-base">Madre</span>
        </label>
        <label for="madre" class="label">
            <span class="text-md">{caravanamadre}</span>
        </label>
    </div>
    <div>
        <label for="fechadesde" class="label">
            <span class="label-text text-base">Fecha desde</span>
        </label>
        <label class="input-group">
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
        </label>
    </div>
    <div>
        <label for="fecha" class="label">
            <span class="label-text text-base">Fecha hasta</span>
        </label>
        <label class="input-group">
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
        </label>
    </div>
    <!--Fecha parto-->
    <div class="">
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
    <!--Recordar como hacer offset en tailwind-->
    <div></div>
    <div>
        <label for="padres" class="label">
            <span class="label-text text-base">Padres</span>
        </label>
        <label class="input-group">
            {#if cargado}
                <MultipleToros
                    {toros}
                    bind:valor={padresserv}
                    bind:listavalores={padreslist}
                />
            {/if}
        </label>
    </div>
    
    <!--Observacion-->
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
