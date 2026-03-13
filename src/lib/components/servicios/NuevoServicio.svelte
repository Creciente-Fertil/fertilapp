<script>
    import estilos from "$lib/stores/estilos";
    import MultipleToros from "../MultipleToros.svelte";
    import PredictSelect from "../PredictSelect.svelte";
    import SelectToros from "../SelectToros.svelte";
    let {
        //natural
        esNatural = $bindable(true),
        fechadesdeserv = $bindable(""),
        fechahastaserv = $bindable(""),
        padresserv = $bindable(""),
        padreslist = $bindable([]),
        fechaparto = $bindable(""),
        observaciongeneral = $bindable(""),
        //inseminacion
        fechainseminacion = $bindable(""),
        padre = $bindable(""),
        pajuela = $bindable(""),
        //general
        listapadres = $bindable([]),

        agregarPadre,
        quitarPadre,
        cargadoanimales = false,
        padres = [],

        malfechadese = false,
        malpadre = false,
        malfecha = false,
        input = (campo) => {},
        onInput = (campo) => {},
        inputObsGeneral = () => {},
        onwrite = () => {},
        onelegir = () => {},
    } = $props();
    const HOY = new Date().toISOString().split("T")[0];
</script>

<div
    class={`
            rounded-xl p-1 shadow-2xl mb-1
            dark:bg-slate-900 bg-white
            px-6
        `}
>
    <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 mb-2 border-b dark:border-gray-800"
    >
        <div
            class={`
                    bg-transparent
                    py-2
                `}
        >
            <h1
                class={`
                    text-xl font-semibold 
                    dark:text-gray-300 text-gray-700
                `}
            >
                Detalles servicio
            </h1>
        </div>
    </div>
    {#if esNatural}
        <div class="grid grid-cols-1">
            <div class="pr-3">
                <label for="tiposervicio" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Tipo servicio
                    </span>
                </label>
                <label class="input-group pl-3">
                    <select
                        class={`
                        w-full
                        select select-bordered
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                        pr-3
                    `}
                        bind:value={esNatural}
                        onchange={() => input("TIPO")}
                    >
                        <option value={true}>Servicio natural</option>
                        <option value={false}>Inseminación artificial</option>
                    </select>
                </label>
            </div>
            <div class="pr-3">
                <label for="fechadesde" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Fecha desde</span
                    >
                </label>
                <label class="input-group px-3">
                    <input
                        id="fechadesde"
                        type="date"
                        class={`
                                w-full
                                input input-bordered 
                                border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 
                                focus:ring-green-500 
                                focus:border-green-500
                                ${estilos.bgdark2} 
                            `}
                        bind:value={fechadesdeserv}
                        onchange={() => input("DESDE")}
                    />
                    {#if malfechadese}
                        <div class="label">
                            <span class="label-text-alt text-red-500"
                                >Debe seleccionar la fecha inicial del servicio</span
                            >
                        </div>
                    {/if}
                </label>
            </div>
            <div class="pr-3">
                <label for="fechahasta" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Fecha hasta</span
                    >
                </label>
                <label class="input-group px-3">
                    <input
                        id="fechahasta"
                        type="date"
                        class={`
                            w-full
                            input input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        onchange={() => input("HASTA")}
                        bind:value={fechahastaserv}
                    />
                </label>
            </div>
            {#if cargadoanimales}
                <SelectToros
                    opciones={listapadres}
                    etiqueta="Padres"
                    bind:valores={padreslist}
                    etiquetaDefault={false}
                    py="py-1"
                    px="pl-3"
                    margintop=""
                    
                    agregarElemento={agregarPadre}
                    quitarElemento={quitarPadre}
                    
                >
                    <label for="Padres" class="label">
                        <span
                            class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                        >
                            Padres</span
                        >
                    </label>
                </SelectToros>
                {#if malpadre}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar al menos un padre</span
                        >
                    </div>
                {/if}
            {/if}
            <div class="pr-3">
                <label for="fechaparto" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Fecha parto</span
                    >
                </label>
                <label class="input-group px-3">
                    <input
                        id="fechaparto"
                        type="date"
                        class={`
                            w-full
                            input input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        disabled
                        bind:value={fechaparto}
                    />
                </label>
            </div>
            <div class="">
                <label for="observacion" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Observación general</span
                    >
                </label>
                <div class="pl-3">
                    <textarea
                        name="observacion"
                        id="observacion"
                        class={`
                        w-full
                        px-2 m-0
                        py-1
                        min-h-32
                        leading-tight
                        textarea textarea-bordered textarea-lg
                        
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        
                        ${estilos.bgdark2}
                        
                    `}
                        bind:value={observaciongeneral}
                        oninput={inputObsGeneral}
                    >
                    </textarea>
                </div>
            </div>
        </div>
    {:else}
        <div class="grid grid-cols-1">
            <div class="pl-3">
                <label for="tiposervicio" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Tipo servicio</span
                    >
                </label>
                <label class="input-group pr-3">
                    <select
                        class={`
                                w-full  
                                select select-bordered
                                border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                        bind:value={esNatural}
                        onchange={() => input("TIPO")}
                    >
                        <option value={true}>Servicio natural</option>
                        <option value={false}>Inseminación artificial</option>
                    </select>
                </label>
            </div>
            <div class="pr-3">
                <label for="fechains" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Fecha inseminación</span
                    >
                </label>
                <label class="input-group pl-3">
                    <input
                        id="fechainseminacion"
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
                        bind:value={fechainseminacion}
                        onchange={() => onInput("FECHA")}
                    />
                    {#if malfecha}
                        <div class="label">
                            <span class="label-text-alt text-red-500"
                                >Debe seleccionar la fecha de inseminacion</span
                            >
                        </div>
                    {/if}
                </label>
            </div>
            <div class="">
                {#if cargadoanimales}
                    <PredictSelect
                        {onwrite}
                        {onelegir}
                        cambiar = {()=>input("PAJUELA")}
                        bind:valor={padre}
                        etiqueta={"Padre"}
                        bind:cadena={pajuela}
                        lista={listapadres}
                        size="w-full lg:w-1/3"
                        etiquetaDefault={false}
                        px="pl-3"
                    >
                        <label for="Padres" class="label">
                            <span
                                class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                            >
                                Padre</span
                            >
                        </label>
                    </PredictSelect>
                {/if}
            </div>
            <div class="pr-3">
                <label for="fechaparto" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Fecha parto</span
                    >
                </label>
                <label class="input-group pl-3">
                    <input
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
                        disabled
                        bind:value={fechaparto}
                    />
                </label>
            </div>
            <div class="">
                <label for="obs" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                    >
                        Observacion general</span
                    >
                </label>
                <div class="pl-3">
                    <textarea
                        name="observacion"
                        id="observacion"
                        class={`
                        px-2 m-0
                        py-1
                        min-h-32
                        leading-tight
                        textarea textarea-bordered textarea-lg                        
                        focus:outline-none focus:ring-2 
                        focus:ring-[#115642] 
                        w-full
                        ${estilos.bgdark2}
                    `}
                        bind:value={observaciongeneral}
                        oninput={inputObsGeneral}
                    >
                    </textarea>
                </div>
            </div>
        </div>
    {/if}
</div>
