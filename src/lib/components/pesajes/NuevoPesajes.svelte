<script>
    import estilos from "$lib/stores/estilos";
    import Secondary from "../botones/Secondary.svelte";
    let {
        fecha = $bindable(""),
        pesogeneral = $bindable(""),
        cambioPesoGeneral = () => {},
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
                Detalles pesajes
            </h1>
        </div>
    </div>
    <div class={`grid grid-cols-1 md:grid-cols-2`}>
        <div class="pr-3">
            <label for="fechapesaje" class="label">
                <span
                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                >
                    Fecha</span
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
                    bind:value={fecha}
                />
            </label>
        </div>
        <div class="pr-3">
            <label for="pesopesaje" class="label">
                <span
                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                >
                    Peso general</span
                >
            </label>
            <label class="input-group px-3">
                <input
                    id="pesogeneral"
                    type="text"
                    class={`
                        w-full
                        input input-bordered 
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={pesogeneral}
                    oninput={cambioPesoGeneral}
                />
            </label>
        </div>
    </div>
</div>
