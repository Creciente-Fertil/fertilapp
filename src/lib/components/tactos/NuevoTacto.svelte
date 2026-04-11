<script>
    import estilos from "$lib/stores/estilos";
    import estados from "$lib/stores/estados";
    import tipostacto from "$lib/stores/tipostacto";
    let {
        fecha = $bindable(""),
        observaciongeneral = $bindable(""),
        tipo = $bindable(""),
        prenada = $bindable(1),
        inputObsGeneral = () => {},
        input = () => {},
    } = $props();
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
                Detalles tacto
            </h1>
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3">
        <div class="pr-3">
            <label for="tiposervicio" class="label">
                <span
                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                >
                    Tipo tacto
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
                    bind:value={tipo}
                    onchange={() => input("TIPO")}
                >
                    {#each tipostacto as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
            </label>
        </div>
        <div class="pr-3">
            <label for="fecha" class="label">
                <span
                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                >
                    Fecha
                </span>
            </label>
            <label class="input-group px-3">
                <input
                    id="fecha"
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
                    bind:value={fecha}
                    onchange={() => input("DESDE")}
                />
            </label>
        </div>
        <div class="pr-3">
            <label for="estado" class="label">
                <span
                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                >
                    Estado
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
                    bind:value={prenada}
                    onchange={() => input("PRENADA")}
                >
                    {#each estados.filter(ta=>ta.id>-1) as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
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
                        min-h-16
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
</div>
