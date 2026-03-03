<script>
    import estilos from "$lib/stores/estilos";
    import SelectToros from "../SelectToros.svelte";
    import PredictSelect from "../PredictSelect.svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        //General
        esNatural = true,
        observaciongeneral = "",
        fechaparto = "",
        listapadres = [],
        padres = [],
        input = (campo) => {},
        onInput = (campo) => {},
        agregarPadre = (id) => {},
        quitarPadre = (id) => {},
        inputObsGeneral = () => {},
        onwrite = () => {},
        onelegir = (id) => {},
        cargadoanimales = false,
        mover = () => {},
        volver = () => {},
        //Servicio
        fechadesdeserv = "",
        fechahastaserv = "",
        padreslist = [],
        //Inseminacion
        fechainseminacion = "",
        padre = "",
        pajuela = "",
    } = $props();
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
    class="
        container mx-auto py-3 px-4 max-w-7xl
        "
>
    <!--Header-->
    <div
        class={`
            rounded-2xl p-1 md:p-3 
            dark:bg-slate-900 bg-white
            shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
            dark:shadow-none
            
        `}
    >
        <div class="flex flex-col gap-1 mb-1">
            <div
                class={`
                bg-transparent
                
                 py-1 
            `}
            >
                <h1
                    class={`
                            flex text-left
                            text-2xl font-semibold 
                            dark:text-[#24a579] text-[#115642]
                        `}
                >
                    Información general
                </h1>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <!--Tipo y padres-->
            <div class="grid grid-cols-1">
                <div>
                    <label for="tiposervicio" class="label">
                        <span
                            class="label-text text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                            >Tipo servicio</span
                        >
                    </label>
                    <label class="input-group px-3">
                        <select
                            class={`
                                
                                select select-bordered
                                border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                            value={esNatural}
                        >
                            <option value={true}>Servicio natural</option>
                            <option value={false}
                                >Inseminación inseminación</option
                            >
                        </select>
                    </label>
                </div>
                {#if cargadoanimales}
                    <div>
                        {#if esNatural}
                            <div>
                                <SelectToros
                                    opciones={listapadres}
                                    etiqueta="Padres"
                                    bind:valores={padreslist}
                                    etiquetaDefault={false}
                                    agregarElemento={agregarPadre}
                                    quitarElemento={quitarPadre}
                                    margintop=""
                                    py="py-1"
                                    px="px-1"
                                    edit={false}
                                >
                                    <label for="Padres" class="label">
                                        <span
                                            class="label-text text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                                        >
                                            Padres</span
                                        >
                                    </label>
                                </SelectToros>
                            </div>
                        {:else}
                            <PredictSelect
                                {onwrite}
                                {onelegir}
                                bind:valor={padre}
                                etiqueta={"Padre"}
                                bind:cadena={pajuela}
                                lista={listapadres}
                                size="w-full lg:w-1/3"
                                etiquetaDefault={false}
                                px="px-3"
                                edit={false}
                            >
                                <label for="Padres" class="label">
                                    <span
                                        class="label-text text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                                    >
                                        Padre</span
                                    >
                                </label>
                            </PredictSelect>
                        {/if}
                    </div>
                {/if}
            </div>
            <!--Fechas-->
            <div class="grid grid-cols-1 md:grid-cols-2 mb-6 pb-4">
                {#if esNatural}
                    <div class="">
                        <label for="fechadesde" class="label">
                            <span
                                class="label-text tracking-wide text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                            >
                                Fecha desde</span
                            >
                        </label>
                        {#if fechadesdeserv.length > 0}
                            <span
                                class={`text-lg font-semibold tracking-wide ${estilos.labelcolor} py-0 my-0 px-1`}
                                >{new Date(
                                    fechadesdeserv,
                                ).toLocaleDateString()}</span
                            >
                        {/if}
                    </div>
                    <div class="">
                        <label for="fechahasta" class="label">
                            <span
                                class="label-text tracking-wide text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                            >
                                Fecha hasta</span
                            >
                        </label>
                        {#if fechahastaserv.length > 0}
                            <span
                                class={`text-lg tracking-wide font-semibold  ${estilos.labelcolor} py-0 my-0 px-1`}
                                >{new Date(
                                    fechahastaserv,
                                ).toLocaleDateString()}</span
                            >
                        {/if}
                    </div>
                {:else}
                    <div>
                        <label for="fechains" class="label">
                            <span
                                class="label-text tracking-wide text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                                >Fecha inseminación</span
                            >
                        </label>
                        {#if fechainseminacion.length > 0}
                            <span
                                class={`text-lg  tracking-wide font-semibold  ${estilos.labelcolor} py-0 my-0 px-1`}
                                >{new Date(
                                    fechainseminacion,
                                ).toLocaleDateString() || ""}</span
                            >
                        {/if}
                    </div>
                {/if}
                <div>
                    <label for="fechaparto" class="label">
                        <span
                            class="label-text tracking-wide text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                        >
                            Fecha parto</span
                        >
                    </label>
                    {#if fechaparto.length > 0}
                        <span
                            class={`text-lg tracking-wide font-semibold  ${estilos.crecientecolor} py-0 my-0 px-1 bg-green-100/80 dark:bg-green-900/20 rounded-2xl`}
                            >{new Date(fechaparto).toLocaleDateString() ||
                                ""}</span
                        >
                    {/if}
                </div>
            </div>
            <!--Observacion general-->
            <div>
                <label for="observacion" class="label">
                    <span
                        class="label-text text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                    >
                        Observación general</span
                    >
                </label>
                <p
                    class={`
                            px-3
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            dark:text-gray-400 text-gray-500
                            w-full
                            italic
                            ${estilos.bgdark2untext}
                        `}
                >
                    {observaciongeneral}
                </p>
            </div>
        </div>
    </div>
</div>
