<script>
    import estilos from "$lib/stores/estilos";
    import Paginacion from "../paginacion.svelte";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";
    import { getEstadoNombre } from "../estadosutils/lib";
    import { shorterWord } from "$lib/stringutil/lib";
    let pre = import.meta.env.VITE_PRE;
    let {
        pageSize = $bindable(15),
        selecthash,
        tactosrow,
        ordenarTactos = (campo, mantener) => {},
        openViewModal = (_p) => {},
        openEditModal = (_p) => {},
        openDelModal = (_p) => {},
        clickTodos = () => {},
        clickFila = (id) => {},
        todos = $bindable(false),
        ascendente = false,

        forma = "",
    } = $props();
    let firstRun = true;
    function onChangePageSize() {
        paginaActual = 1;
    }

    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        tactosrow.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(tactosrow.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
    let pyfila = "py-1";
</script>

<div class="max-h-[600px] overflow-y-auto custom-scrollbar">
    <!-- Select all -->
    <div class="flex items-center gap-3 px-1 mb-2">
        <button
            type="button"
            onclick={clickTodos}
            class={`
                                w-5 h-5
                                flex items-center justify-center
                                rounded-full
                                border-2
                                transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                                ${
                                    todos
                                        ? "bg-emerald-700 border-emerald-700"
                                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 hover:border-emerald-500 dark:hover:border-emerald-400"
                                }
                            `}
            aria-label={todos ? "Deseleccionar todos" : "Seleccionar todos"}
        >
            <!-- El icono de check (solo visible cuando todos es true) -->
        </button>
        <span class="text-sm text-gray-500 cursor-pointer"
            >Seleccionar todos</span
        >
        {#if Object.keys(selecthash).length > 0}
            <span
                class={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                bg-gray-100 text-gray-800
                dark:bg-gray-700 dark:text-gray-200
            `}
            >
                {Object.keys(selecthash).length} seleccionados
            </span>
        {/if}
    </div>
    <!-- Cards -->
    <div class="flex flex-col gap-3">
        {#each rows as t}
            <div
                class={`
                rounded-xl border p-4 transition-all
                ${
                    selecthash[t.id]
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
                }
            `}
            >
                <!-- Cabecera con checkbox y animal -->
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <label
                            class="flex items-center justify-center cursor-pointer shrink-0"
                        >
                            <input
                                type="checkbox"
                                checked={selecthash[t.id] ? true : false}
                                onchange={() => clickFila(t.id)}
                                class="peer sr-only"
                            />
                            <span
                                class="
                                w-5 h-5
                                flex items-center justify-center
                                rounded-full
                                border-2 border-gray-300 dark:border-gray-500
                                bg-white dark:bg-gray-800
                                transition-all duration-200 ease-in-out
                                peer-checked:bg-emerald-700
                                peer-checked:border-emerald-700
                                hover:border-emerald-500 dark:hover:border-emerald-400
                            "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="3"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </span>
                        </label>

                        <div class="flex-1 min-w-0">
                            <p
                                class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
                            >
                                {shorterWord(t.expand.animal.caravana)}
                            </p>
                        </div>
                    </div>

                    <!-- Acciones -->
                    <div class="flex items-center gap-2 shrink-0">
                        <button
                            onclick={() => openViewModal(t.id)}
                            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Eye size="size-5" />
                        </button>
                        <button
                            onclick={() => openEditModal(t.id)}
                            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Pencil size="size-5" />
                        </button>
                        <button
                            onclick={() => openDelModal(t.id)}
                            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Trash size="size-5" />
                        </button>
                    </div>
                </div>

                <!-- Grid de datos (2 columnas) -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Fecha</span
                        >
                        <p class="text-gray-900 dark:text-gray-100 font-medium">
                            {new Date(t.fecha).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Estado</span
                        >
                        <p class="text-gray-900 dark:text-gray-100 font-medium">
                            {getEstadoNombre(t.prenada)}
                        </p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
<Paginacion
    rows={tactosrow}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
    esCelu={true}
/>
