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
        container py-3 px-4 max-w-7xl
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
                <div class="">
                    <label for="tipo" class="label mb-0 pb-0">
                        <span
                            class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                        >
                            Tipo de servicio</span
                        >
                    </label>

                    <span
                        class={`text-lg font-semibold tracking-wide ${estilos.labelcolor} py-0 my-0 px-3 `}
                    >
                        {#if esNatural}
                            Servicio natural
                        {:else}
                            Inseminación artificial
                        {/if}</span
                    >
                </div>
                {#if cargadoanimales}
                    <div>
                        {#if esNatural}
                            <div>
                                <SelectToros
                                    opciones={listapadres}
                                    etiqueta="Padres"
                                    valores={padreslist}
                                    etiquetaDefault={false}
                                    agregarElemento={agregarPadre}
                                    quitarElemento={quitarPadre}
                                    margintop=""
                                    py="py-1"
                                    px="px-3"
                                    edit={false}
                                >
                                    <label for="Padres" class="label mb-0 pb-0">
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
                                valor={padre}
                                etiqueta={"Padre"}
                                cadena={pajuela}
                                lista={listapadres}
                                size="w-full lg:w-1/3"
                                etiquetaDefault={false}
                                px="px-3"
                                edit={false}
                            >
                                <label for="Padres" class="label mb-0 pb-0">
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
            <div
                class="grid grid-cols-1 md:grid-cols-2 pb-1 mb-1 md:mb-6 md:pb-4"
            >
                {#if esNatural}
                    <div class="">
                        <label for="fechadesde" class="label mb-0 pb-0">
                            <span
                                class="label-text tracking-wide text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                            >
                                Fecha desde</span
                            >
                        </label>
                        {#if fechadesdeserv.length > 0}
                            <span
                                class={`text-lg font-semibold tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
                                >{new Date(
                                    fechadesdeserv,
                                ).toLocaleDateString()}</span
                            >
                        {/if}
                    </div>
                    <div class="">
                        <label for="fechahasta" class="label mb-0 pb-0">
                            <span
                                class="label-text tracking-wide text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                            >
                                Fecha hasta</span
                            >
                        </label>
                        {#if fechahastaserv.length > 0}
                            <span
                                class={`text-lg tracking-wide font-semibold  ${estilos.labelcolor} py-0 my-0 px-3`}
                                >{new Date(
                                    fechahastaserv,
                                ).toLocaleDateString()}</span
                            >
                        {/if}
                    </div>
                {:else}
                    <div>
                        <label for="fechains" class="label mb-0 pb-0">
                            <span
                                class="label-text tracking-wide text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                                >Fecha inseminación</span
                            >
                        </label>
                        {#if fechainseminacion.length > 0}
                            <span
                                class={`text-lg  tracking-wide font-semibold  ${estilos.labelcolor} py-0 my-0 px-3`}
                                >{new Date(
                                    fechainseminacion,
                                ).toLocaleDateString() || ""}</span
                            >
                        {/if}
                    </div>
                {/if}
                <div>
                    <label for="fechaparto" class="label mb-0 pb-0 pt-4">
                        <span
                            class="label-text tracking-wide text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                        >
                            Fecha parto</span
                        >
                    </label>
                    {#if fechaparto.length > 0}
                        <span
                            class={`text-lg tracking-wide font-semibold  ${estilos.crecientecolor} py-0 my-0 px-1 bg-green-100/80 dark:bg-green-900/20 rounded-2xl px-3`}
                            >{new Date(fechaparto).toLocaleDateString() ||
                                ""}</span
                        >
                    {/if}
                </div>
            </div>
            <!--Observacion general-->
            <div>
                <label for="observacion" class="label mb-0 pb-0">
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
