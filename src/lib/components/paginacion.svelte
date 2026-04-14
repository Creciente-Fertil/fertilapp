<script>
    import paginacion from "$lib/stores/paginacion";
    let {
        rows = [],
        pageSize = $bindable(30),
        paginaActual = $bindable(1),
        totalPaginas,
        onChangePageSize = () => {},
        rounded = "rounded-b-xl",
        esCelu=false
    } = $props();
    let minimo = $derived((paginaActual - 1) * pageSize + 1);
    let maximo = $derived(Math.min(paginaActual * pageSize, rows.length));
    let anterior = $derived(paginaActual - 1);
    let posterior = $derived(paginaActual + 1);
    let puntosanterior = $derived(anterior - 1 > 1 );
    let puntosposterior = $derived(totalPaginas - posterior > 1);
</script>

<div class={`${rounded} bg-white dark:bg-slate-900 p-4 shadow-sm`}>
    <div class="flex items-center justify-between flex-wrap gap-4">
        <!-- Texto "Mostrando X a Y de Z resultados" -->
        <div class="text-sm text-gray-700 dark:text-gray-300 font-medium">
            
            <span class="font-bold">
                {minimo}
            </span>
            a
            <span class="font-bold">
                {maximo}
            </span>
            de
            <span class="font-bold">{rows.length}</span>
            resultados
        </div>
        <!-- Selector de cantidad por página -->
        <div
            class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
        >
            <span>Filas:</span>
            <select
                class="
                bg-white dark:bg-slate-900
                border-gray-300 dark:border-gray-600
                rounded-md px-3 py-1.5 text-sm
                focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700
                "
                bind:value={pageSize}
                onchange={onChangePageSize}
            >
                {#each paginacion as s}
                    <option value={s.id}>{s.value}</option>
                {/each}
            </select>
        </div>
        <!-- Botones de navegación y números de página -->
        <div class={`flex ${esCelu?"items-end":"items-center"}   space-x-1`}>
            <!-- Botón "Anterior" -->
            <button
                disabled={paginaActual === 1}
                onclick={() => (paginaActual -= 1)}
                class={`
                    px-3 py-1.5 text-sm font-medium 
                    text-gray-700 dark:text-gray-300 
                    bg-white dark:bg-gray-800 border 
                    border-gray-300 dark:border-gray-600 
                    hover:bg-gray-50 dark:hover:bg-gray-700 
                    rounded-md transition-colors

                    ${paginaActual === 1 ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                ‹ {#if !esCelu}
                    Anterior
                {/if}
            </button>

            {#if paginaActual != 1}
                <button
                    onclick={() => (paginaActual = 1)}
                    class={`
                    w-6 h-8 flex items-center
                    justify-center text-sm font-semibold 
                    rounded-md shadow-sm
                `}
                >
                    {1}
                </button>
            {/if}
            {#if puntosanterior}
                <div
                    class={`
                    w-6 h-8 flex items-center
                    justify-center text-sm font-semibold 
                    
                `}
                >
                    ...
                </div>
            {/if}
            {#if anterior > 1}
                <button
                    onclick={() => (paginaActual = anterior)}
                    class={`
                    w-6 h-8 flex items-center
                    justify-center text-sm font-semibold 
                    rounded-md shadow-sm
                `}
                >
                    {anterior}
                </button>
            {/if}
            <button
                class={`
                    w-6 h-8 flex items-center
                    justify-center text-sm font-semibold 
                    rounded-md shadow-sm
                    text-white bg-[#115642] dark:bg-green-700
                `}
            >
                {paginaActual}
            </button>
            {#if posterior < totalPaginas}
                <button
                    onclick={() => (paginaActual = posterior)}
                    class={`
                    w-6 h-8 flex items-center
                    justify-center text-sm font-semibold 
                    rounded-md shadow-sm
                `}
                >
                    {posterior}
                </button>
            {/if}
            {#if puntosposterior}
                <div
                    class={`
                    w-6 h-8 flex items-center
                    justify-center text-sm font-semibold 
                    
                `}
                >
                    ...
                </div>
            {/if}
            {#if paginaActual != totalPaginas}
                <button
                    onclick={() => (paginaActual = totalPaginas)}
                    class={`
                    w-6 h-8 flex items-center
                    justify-center text-sm font-semibold 
                    rounded-md shadow-sm
                `}
                >
                    {totalPaginas}
                </button>
            {/if}

            <!-- Botón "Siguiente" -->
            <button
                disabled={paginaActual === totalPaginas}
                onclick={() => (paginaActual += 1)}
                class={`
                    px-3 py-1.5 text-sm font-medium 
                    text-gray-700 dark:text-gray-300 
                    bg-white dark:bg-gray-800 border 
                    border-gray-300 dark:border-gray-600 
                    hover:bg-gray-50 dark:hover:bg-gray-700 
                    rounded-md transition-colors
                    ${
                        paginaActual === totalPaginas
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }
                `}
            >
                {#if !esCelu}
                    Siguiente
                {/if}›
            </button>
        </div>
    </div>
</div>
