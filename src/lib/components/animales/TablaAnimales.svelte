<script>
    import estilos from "$lib/stores/estilos";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";
    import { goto } from "$app/navigation";
    let pre = import.meta.env.VITE_PRE;

    let {
        pageSize = 10,
        selecthash,
        animalesrows,
        ordenarAnimales,
        clickTodos = () => {},
        clickFila = (id) => {},
        todos = $bindable(false),
        ascendente,
        forma,
        shorterWord = (s) => {},
        capitalize,
        getEstadoNombre,
        calcularEdad,
        
    } = $props();
    let firstRun = true;

    $effect(() => {
        if (firstRun) {
            firstRun = false;
            return;
        }
        paginaActual = 1;
    });

    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        animalesrows.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(animalesrows.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
</script>

<table class="table table-lg w-full">
    <thead class={`${estilos.tableheader}`}>
        <tr>
            <th class="text-base mx-2 px-2 ">
                <input type="checkbox" checked={todos} onchange={clickTodos} />
            </th>
            <th
                onclick={() => ordenarAnimales("caravana")}
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Animal

                    {#if forma == "caravana"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    {/if}
                </div>
            </th>

            <th
                onclick={() => ordenarAnimales("sexo")}
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Sexo
                    {#if forma == "sexo"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    {/if}
                </div>
            </th>
            <th
                onclick={() => ordenarAnimales("categoria")}
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Categoria
                    {#if forma == "categoria"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    {/if}
                </div>
            </th>
            <th
                onclick={() => ordenarAnimales("estado")}
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Estado
                    {#if forma == "estado"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    {/if}
                </div>
            </th>
            <th
                onclick={() => ordenarAnimales("lote")}
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Lote
                    {#if forma == "lote"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    {/if}
                </div>
            </th>
            <th
                onclick={() => ordenarAnimales("rodeo")}
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Rodeo
                    {#if forma == "rodeo"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    {/if}
                </div>
            </th>
            <th 
                class={`
                    ${estilos.tableth}   
                `}
            >
               
                <div class="flex flex-row justify-between">Edad</div>
            </th>
            
            <th class="text-base mx-1 px-1">
                Acciones
            </th>
        </tr>
    </thead>
    <tbody>
        {#each rows as a}
            <tr>
                <td class="text-base mx-2 px-2 border-b dark:border-gray-600">
                    <input
                        type="checkbox"
                        checked={selecthash[a.id] ? true : false}
                        onchange={() => clickFila(a.id)}
                    />
                </td>
                <td 
                    class="text-base mx-1 px-1 border-b dark:border-gray-600"
                >
                    <div class="flex gap-1">
                        {`${shorterWord(a.caravana)}`}
                        {#if !a.active}
                            <div
                                class={`
                                    bg-transparent rounded-lg
                                    p-0 m-0  ${estilos.danger}
                                `}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="size-6"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                                    />
                                </svg>
                            </div>
                        {/if}
                    </div>
                </td>
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600"> {a.sexo}</td>
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600"> {capitalize(a.categoria)}</td>
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600">
                    {#if a.sexo == "H"}
                        {getEstadoNombre(a.prenada)}
                    {:else}
                        -
                    {/if}
                </td>
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
                <td
                    class="text-base mx-1 px-1 border-b dark:border-gray-600"
                >
                    {a.fechanacimiento != ""
                        ? calcularEdad(a.fechanacimiento)
                        : "-"}
                </td>

                
                <td class=" border-b dark:border-gray-600 gap-1">
                    <button
                        onclick={() => goto(`${pre}/animales/${a.id}`)}
                    >
                        <Eye size="size-5" />
                    </button>
                    <button
                        class="hidden"
                        onclick={() => goto(`${pre}/animales/${a.id}`)}
                    >
                        <Trash size="size-5" />
                    </button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<!-- Texto del total de filas -->
<div class="mb-3 text-sm text-gray-600 dark:text-gray-400">
    Total: <span class="font-medium">{animalesrows.length}</span> {animalesrows.length === 1 ? 'fila' : 'filas'}
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
