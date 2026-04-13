<script>
    import estilos from "$lib/stores/estilos";
    import estados from "$lib/stores/estados";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        fecha = $bindable(""),
        observaciongeneral = $bindable(""),
        pesajegeneral = $bindable(""),
        
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
            <div class="grid grid-cols-1">
                <div class="">
                    <label for="pesaje" class="label mb-0 pb-0">
                        <span
                            class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                        >
                            Pesaje general</span
                        >
                    </label>

                    <span
                        class={`text-lg font-semibold tracking-wide ${estilos.labelcolor} py-0 my-0 px-3 `}
                    >
                        {pesajegeneral}</span
                    >
                </div>
            </div>
            <div class="grid grid-cols-1">
                <div>
                    <label for="fecha" class="label">
                        <span
                            class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                        >
                            Fecha
                        </span>
                    </label>
                    {#if fecha.length > 0}
                        <span
                            class={`text-lg font-semibold tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
                            >{new Date(fecha).toLocaleDateString()}</span
                        >
                    {/if}
                </div>
            </div>
            <!--Observacion general-->
            <div class="hidden">
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
