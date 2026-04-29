<script>
    import estilos from "$lib/stores/estilos";
    import Eye from "$lib/svgs/eye.svelte";
    import Paginacion from "./paginacion.svelte";
    import estados from "$lib/stores/estados";
    import Badge from "./Badge.svelte";
    import {
        getEstadoNombre,
        getEstadoColor,
        getEstadoBadgeColor,
    } from "./estadosutils/lib";
    import AccionesMovimiento from "./AccionesMovimiento.svelte";
    let {
        pageSize = $bindable(5),
        paginaActual = $bindable(1),
        conEstado = false,
        selecthash,
        animalesrows = [],
        clickTodos = () => {},
        seleccionarTodos=()=>{},
        clickFila = (id) => {},
        verFila = (id) => {},
        todos = false,
        algunos = false,
        ninguno = true,
        cancelar = () => {},
        siguiente = () => {},
        esCelu = false,
    } = $props();

    function onChangePageSize() {
        paginaActual = 1;
    }

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        animalesrows.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(animalesrows.length);
    let totalAnimales = $derived(Object.keys(selecthash).length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
    let pyfila = "py-2";
</script>

<div
    class="relative w-full overflow-hidden rounded-b-xl border border-slate-200 dark:border-slate-700"
>
    <div class="max-h-[500px] overflow-y-auto custom-scrollbar">
        <table class="table table-lg w-full bg-white dark:bg-slate-900">
            <thead class={`${estilos.tableheader} sticky top-0 z-5 shadow-sm`}>
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
                            uppercase
                        `}
                    >
                        RP
                    </th>
                    <th
                        class={`
                            ${estilos.tableth}   
                            uppercase
                        `}
                    >
                        Caravana
                    </th>
                    {#if conEstado}
                        <th
                            class={`
                            ${estilos.tableth}   
                            uppercase
                        `}
                        >
                            Estado
                        </th>
                    {/if}
                    <th
                        class={`
                            ${estilos.tableth} 
                        `}
                    >
                        Acción
                    </th>
                </tr>
            </thead>
            <tbody>
                {#if totalAnimales > 0}
                    <tr class="bg-slate-100 dark:bg-slate-800">
                        <td colspan="5">
                            <!-- Barra de selección -->
                            <div
                                class=" flex flex-row items-center justify-center gap-3 text-sm"
                            >
                                <span
                                    class="text-slate-700 dark:text-slate-200"
                                >
                                    Se han seleccionado <strong
                                        >{Object.keys(selecthash)
                                            .length}</strong
                                    > animales de la lista.
                                </span>
                                <button
                                    onclick={seleccionarTodos}
                                    class="text-emerald-700 dark:text-emerald-400 font-medium hover:underline focus:outline-none"
                                >
                                    Seleccionar los {count} animales de la lista
                                </button>
                            </div>
                        </td>
                    </tr>
                {/if}
                {#each rows as a}
                    <tr>
                        <td class={`text-base mx-2 px-2 w-16 ${pyfila}`}>
                            <label
                                class="flex items-center justify-center cursor-pointer"
                            >
                                <!-- Input real (oculto pero funcional) -->
                                <input
                                    type="checkbox"
                                    checked={selecthash[a.id] ? true : false}
                                    onchange={() => clickFila(a.id)}
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
                        <td class={`text-base mx-1 px-1 text-center ${pyfila}`}>
                            {a.rp}
                        </td>
                        <td class={`text-base mx-1 px-1 text-center ${pyfila}`}>
                            {a.caravana}
                        </td>
                        {#if conEstado}
                            <td
                                class={`text-base mx-1 px-1 text-center ${pyfila}`}
                            >
                                <div
                                    class={`badge badge-outline badge-${getEstadoColor(a.prenada)}`}
                                >
                                    {getEstadoNombre(a.prenada)}
                                </div>
                            </td>
                        {/if}
                        <td
                            class={`flex items-center justify-center gap-2 px-1 ${pyfila}`}
                        >
                            <button onclick={() => verFila(a.id)}>
                                <Eye size="size-5" />
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<Paginacion
    rows={animalesrows}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
    rounded={""}
/>
<AccionesMovimiento {cancelar} {siguiente} />

<style>
    /* Estilos personalizados para el scrollbar (opcional pero recomendado) */
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 4px;
        border: 2px solid transparent; /* Para dar espacio alrededor */
        background-clip: content-box;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #475569;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #94a3b8;
    }
</style>
