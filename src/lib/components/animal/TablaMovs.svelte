<script>
    import estilos from "$lib/stores/estilos";
    import estados from "$lib/stores/estados";
    import categorias from "$lib/stores/categorias";
    import {
        
        capitalize,
        
    } from "$lib/stringutil/lib";
    import {
        getEstadoNombre
    } from "$lib/components/estadosutils/lib";
    
    let {
        movimientos
    } = $props()
    let pageSize = 10
    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        movimientos.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(movimientos.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
</script>
<table class="table table-lg w-full">
    <thead class={`${estilos.tableheader}`}>
        <tr>



            <th
                
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Fecha
                    
                </div>
            </th>
            <th
                
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Categoria
                    
                </div>
            </th>
            
            <th
                
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Lote
                    
                </div>
            </th>
            <th
                
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Rodeo
                    
                </div>
            </th>
            
        </tr>
    </thead>
    <tbody>
        {#each rows as a}
            <tr>
                
                <td 
                    class="text-base mx-1 px-1 border-b dark:border-gray-600"
                >
                    <div class="flex gap-1">
                        {`${new Date(a.created).toLocaleDateString()}`}
                        
                    </div>
                </td>
                
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600"> {capitalize(a.categoria)}</td>
                
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600">
                    {a.expand
                        ? a.expand.lote
                            ? a.expand.lote.nombre
                            : ""
                        : ""}
                </td>
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600">
                    {a.expand
                        ? a.expand.rodeo
                            ? a.expand.rodeo.nombre
                            : ""
                        : ""}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<!-- Texto del total de filas -->
<div class="mb-3 text-sm text-gray-600 dark:text-gray-400">
    Total: <span class="font-medium">{movimientos.length}</span> {movimientos.length === 1 ? 'fila' : 'filas'}
</div>
<!-- Paginación estilo "barra minimalista" -->
<div
    class="mt-6 rounded-xl bg-transparent border border-gray-300 dark:border-gray-700 p-4"
>
    <div class="flex items-center justify-between">
        <!-- Previous -->
        <button
            disabled={paginaActual === 1}
            onclick={() => (paginaActual -= 1)}
            class={`
        flex items-center gap-1 text-base 
        font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white 
        transition-colors 
        ${paginaActual === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Página anterior"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                />
            </svg>
            <span>Antes</span>
        </button>

        <!-- Números de página (centrados) -->
        <div class="flex items-center space-x-1">
            {#each { length: totalPaginas } as _, num}
                <button
                    onclick={() => (paginaActual = num)}
                    class={`w-8 h-8 flex items-center justify-center text-base font-medium rounded-md transition-colors
                ${
                    num === paginaActual
                        ? "text-white bg-[#115642] shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-white hover:bg-gray-600/50 dark:hover:bg-gray-700/50"
                }
                ${num == 0 ? "hidden" : ""} 
            `}
                >
                    {num}
                </button>
            {/each}
        </div>

        <!-- Next -->
        <button
            disabled={paginaActual === totalPaginas}
            onclick={() => (paginaActual += 1)}
            class={`
        flex items-center gap-1 text-base 
        font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
        transition-colors 
        ${
            paginaActual === totalPaginas ? "opacity-50 cursor-not-allowed" : ""
        }`}
            aria-label="Página siguiente"
        >
            <span>Siguiente</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>
    </div>
</div>