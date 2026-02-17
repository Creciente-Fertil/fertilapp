<script>
    import estilos from "$lib/stores/estilos";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";
    let {
        pageSize = 10,
        selecthash,
        serviciosrow,
        ordenarServicios = (campo, mantener) => {},
        openViewModal = (_p) => {},
        openViewModalIns = (_p) => {},
        openEditModal = (_p) => {},
        openEditModalIns = (_p) => {},
        openDelModal = (_p) => {},
        openDelModalIns = (_p) => {},
        shorterWord = (s) => {},
        getNombrePadres = (p) => {},
        clickTodos = () => {},
        clickFila = (id) => {},
        todos = $bindable(false),
        ascendente,
        forma,
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
        serviciosrow.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(serviciosrow.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
</script>

<table class="table table-lg w-full">
    <thead class={`${estilos.tableheader}`}>
        <tr>
            <th class="text-base mx-2 px-2 border-b border-emerald-700">
                <input type="checkbox" checked={todos} onchange={clickTodos} />
            </th>
            <th
                onclick={() => ordenarServicios("fecha", false)}
                class={`
                    ${estilos.tableth}   
                `}
            >
                <div class="flex flex-row justify-between">
                    Fecha
                    {#if forma == "fecha"}
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
            <th class="text-base mx-1 px-1 border-b border-emerald-700">
                Fecha Hasta
            </th>
            <th
                onclick={() => ordenarServicios("fechaparto", false)}
                class={`
                                ${estilos.tableth}   
                            `}
            >
                <div class="flex flex-row justify-between">
                    Fecha Parto
                    {#if forma == "fechaparto"}
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
                onclick={() => ordenarServicios("madre", false)}
                class={`
                                ${estilos.tableth}   
                            `}
            >
                <div class="flex flex-row justify-between">
                    Madre
                    {#if forma == "madre"}
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
            <th class="text-base mx-1 px-1 border-b border-emerald-700">
                Padres
            </th>
            <th
                onclick={() => ordenarServicios("tipo", false)}
                class={`
                                ${estilos.tableth}   
                            `}
            >
                <div class="flex flex-row justify-between">
                    Tipo
                    {#if forma == "tipo"}
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
            <th class="text-base mx-1 px-1 border-b border-emerald-700">
                Acciones
            </th>
        </tr>
    </thead>
    <tbody>
        {#each rows as s}
            <tr>
                <td class="text-base mx-2 px-2 border-b dark:border-gray-600">
                    <input
                        type="checkbox"
                        checked={selecthash[s.id] ? true : false}
                        onchange={() => clickFila(s.id)}
                    />
                </td>
                <td
                    class="text-base ml-3 pl-3 mr-1 pr-1 border-b dark:border-gray-600"
                >
                    {s.fechadesde
                        ? new Date(s.fechadesde).toLocaleDateString()
                        : s.fechainseminacion
                          ? new Date(s.fechainseminacion).toLocaleDateString()
                          : ""}
                </td>
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600"
                    >{s.fechahasta
                        ? new Date(s.fechahasta).toLocaleDateString()
                        : ""}</td
                >
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600"
                    >{s.fechaparto
                        ? new Date(s.fechaparto).toLocaleDateString()
                        : ""}</td
                >
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600">
                    {s.fechadesde
                        ? shorterWord(s.expand.madre.caravana)
                        : shorterWord(s.expand.animal.caravana)}
                </td>
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600">
                    {s.fechadesde ? getNombrePadres(s.padres) : s.pajuela}
                </td>
                <td class="text-base mx-1 px-1 border-b dark:border-gray-600">
                    {s.fechadesde ? "Natural" : "Artificial"}
                </td>
                <td class=" border-b dark:border-gray-600 gap-1">
                    <button
                        onclick={() => {
                            s.fechadesde
                                ? openViewModal(s.id)
                                : openViewModalIns(s.id);
                        }}
                    >
                        <Eye size="size-5" />
                    </button>
                    <button
                        onclick={() => {
                            s.fechadesde
                                ? openEditModal(s.id)
                                : openEditModalIns(s.id);
                        }}
                    >
                        <Pencil size="size-5" />
                    </button>
                    <button
                        onclick={() => {
                            s.fechadesde
                                ? openDelModal(s.id)
                                : openDelModalIns(s.id);
                        }}
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
    Total: <span class="font-medium">{serviciosrow.length}</span> {serviciosrow.length === 1 ? 'fila' : 'filas'}
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
