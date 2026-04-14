<script>
    import estilos from "$lib/stores/estilos";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";
    import { goto } from "$app/navigation";

    import Paginacion from "../paginacion.svelte";
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
    function onChangePageSize() {
        paginaActual = 1;
    }
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
        {#each rows as a}
            <div
                class={`
                rounded-xl border p-4 transition-all
                ${
                    selecthash[a.id]
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
                }
            `}
            >
                <!-- Cabecera con checkbox y caravana -->
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
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

                        <div class="flex-1 min-w-0">
                            <p
                                class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
                            >
                                <span class="font-normal">Caravana:</span>
                                {shorterWord(a.caravana)}
                                {#if !a.active}
                                    <span
                                        class="inline-block ml-1 text-red-500"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke-width="1.5"
                                            stroke="currentColor"
                                            class="size-4 inline"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                                            />
                                        </svg>
                                    </span>
                                {/if}
                            </p>
                        </div>
                    </div>

                    <!-- Acciones -->
                    <div class="flex items-center gap-2 shrink-0">
                        <button
                            onclick={() => goto(`${pre}/animales/${a.id}`)}
                            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Eye size="size-5" />
                        </button>
                    </div>
                </div>

                <!-- Grid de datos (2 columnas) -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Sexo</span
                        >
                        <p class="text-gray-900 dark:text-gray-100 font-medium">
                            {a.sexo}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Categoría</span
                        >
                        <p class="text-gray-900 dark:text-gray-100 font-medium">
                            {capitalize(a.categoria)}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Estado</span
                        >
                        <p class="text-gray-900 dark:text-gray-100 font-medium">
                            {#if a.sexo == "H"}
                                {getEstadoNombre(a.prenada)}
                            {:else}
                                -
                            {/if}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Edad</span
                        >
                        <p class="text-gray-900 dark:text-gray-100 font-medium">
                            {a.fechanacimiento != ""
                                ? calcularEdad(a.fechanacimiento)
                                : "-"}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Lote</span
                        >
                        <p
                            class="text-gray-900 dark:text-gray-100 font-medium truncate"
                        >
                            {a.expand?.lote?.nombre || "-"}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Rodeo</span
                        >
                        <p
                            class="text-gray-900 dark:text-gray-100 font-medium truncate"
                        >
                            {a.expand?.rodeo?.nombre || "-"}
                        </p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
<Paginacion
    rows={animalesrows}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
    esCelu={true}
/>
