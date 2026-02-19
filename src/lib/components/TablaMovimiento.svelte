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
        pageSize = $bindable(10),
        paginaActual = $bindable(1),
        conEstado = false,
        selecthash,
        animalesrows = [],
        clickTodos = () => {},
        clickFila = (id) => {},
        verFila = (id) => {},
        todos = $bindable(false),
        cancelar = () => {},
        siguiente = () => {},
    } = $props();

    function onChangePageSize() {
        paginaActual = 1;
    }

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        animalesrows.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(animalesrows.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
</script>

<table class="table table-lg w-full bg-white dark:bg-slate-900">
    <thead class={`${estilos.tableheader}`}>
        <tr>
            <th class="hidden text-base mx-2 px-2 border-b border-emerald-700">
                <input type="checkbox" checked={todos} onchange={clickTodos} />
            </th>
            <th class="text-base mx-2 px-2 w-16">
                <label class="flex items-center justify-center cursor-pointer">
                    <!-- El input real (oculto pero funcional) -->
                    <input
                        type="checkbox"
                        checked={todos}
                        onchange={clickTodos}
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
                        <!-- El icono de check (solo visible cuando está marcado) -->
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
        {#each rows as a}
            <tr>
                <td class="hidden text-base mx-2 px-2">
                    <input
                        type="checkbox"
                        checked={selecthash[a.id] ? true : false}
                        onchange={() => clickFila(a.id)}
                    />
                </td>
                <td class="text-base mx-2 px-2 w-16">
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
                <td class="text-base mx-1 px-1 text-center">
                    {a.rp}
                </td>
                <td class="text-base mx-1 px-1 text-center">
                    {a.caravana}
                </td>
                {#if conEstado}
                    <td class="text-base mx-1 px-1 text-center">
                        <div
                            class={`badge badge-outline badge-${getEstadoColor(a.prenada)}`}
                        >
                            {getEstadoNombre(a.prenada)}
                        </div>
                    </td>
                {/if}
                <td class=" flex items-center justify-center gap-2 px-1">
                    <button onclick={() => verFila(a.id)}>
                        <Eye size="size-5" />
                    </button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<Paginacion
    rows={animalesrows}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
    rounded={""}
/>
<AccionesMovimiento
    {cancelar}
    {siguiente}
/>
