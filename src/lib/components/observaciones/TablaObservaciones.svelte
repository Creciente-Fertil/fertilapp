<script>
    import estilos from "$lib/stores/estilos";
    import Paginacion from "../paginacion.svelte";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";

    import { shorterWord } from "$lib/stringutil/lib";
    let pre = import.meta.env.VITE_PRE;
    let {
        pageSize = $bindable(15),
        selecthash = {},
        observacionesrows = [],
        ordenarObservaciones = (campo, mantener) => {},
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
        observacionesrows.slice(
            paginaAnterior * pageSize,
            paginaActual * pageSize,
        ),
    );

    let count = $derived(observacionesrows.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
    let pyfila = "py-1";
</script>

<div class="max-h-[600px] overflow-y-auto custom-scrollbar">
    <table class="table table-lg w-full bg-white dark:bg-slate-900 rounded-none">
        <thead class={`${estilos.tableheader}  sticky top-0 z-5 shadow-sm`}>
            <tr>
                <th
                    class="text-base mx-2 px-2 w-16 flex items-center justify-center"
                >
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
                        aria-label={todos
                            ? "Deseleccionar todos"
                            : "Seleccionar todos"}
                    >
                        <!-- El icono de check (solo visible cuando todos es true) -->
                    </button>
                </th>
                <th
                    class={`
                        ${estilos.tableth}   
                    `}
                >
                    <div class="flex flex-row justify-between uppercase">
                        Fecha
                    </div>
                </th>
                <th
                    class={`
                        ${estilos.tableth}   
                    `}
                >
                    <div class="flex flex-row justify-between uppercase">
                        Animal
                    </div>
                </th>
                <th class="text-base mx-1 px-1 text-center uppercase">
                    Acciones
                </th>
            </tr>
        </thead>
        <tbody>
            {#each rows as o}
                <tr>
                    <td class={`text-base mx-2 px-2 w-16 ${pyfila}`}>
                        <label
                            class="flex items-center justify-center cursor-pointer"
                        >
                            <!-- Input real (oculto pero funcional) -->
                            <input
                                type="checkbox"
                                checked={selecthash[o.id] ? true : false}
                                onchange={() => clickFila(o.id)}
                                class="peer sr-only"
                            />

                            <!-- La caja circular personalizada -->
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
                                <!-- Icono de check (visible solo cuando está marcado) -->
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
                    </td>
                    <td class={`text-base ml-3 pl-3 mr-1 pr-1 ${pyfila}`}>
                        {`${new Date(o.fecha).toLocaleDateString()}`}
                    </td>
                    <td class={`text-base ml-3 pl-3 mr-1 pr-1 ${pyfila}`}>
                        {`${o.expand.animal.caravana}`}
                    </td>
                    <td
                        class={`flex items-center justify-center gap-2 px-1 ${pyfila}`}
                    >
                        <button onclick={() => openViewModal(o.id)}>
                            <Eye size="size-5" />
                        </button>
                        <button onclick={() => openEditModal(o.id)}>
                            <Pencil size="size-5" />
                        </button>
                        <button onclick={() => openDelModal(o.id)}>
                            <Trash size="size-5" />
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
<Paginacion
    rows={observacionesrows}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
/>
