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
    let pyfila = "py-2";
</script>

<div class="max-h-[600px] overflow-y-auto custom-scrollbar">
    <table class="table table-lg w-full bg-white dark:bg-slate-900">
        <thead class={`${estilos.tableheader}  sticky top-0 z-5 shadow-sm`}>
            <tr>
                <th class="text-base mx-2 px-2 w-16 flex items-center justify-center">
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

                <th class="text-base mx-1 px-1"> Acciones </th>
            </tr>
        </thead>
        <tbody>
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
                    <td
                        class={`text-base mx-1 px-1 border-b dark:border-gray-600 ${pyfila}`}
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
                    <td
                        class={`text-base mx-1 px-1 border-b dark:border-gray-600 ${pyfila}`}
                    >
                        {a.sexo}</td
                    >
                    <td
                        class={`text-base mx-1 px-1 border-b dark:border-gray-600 ${pyfila}`}
                    >
                        {capitalize(a.categoria)}</td
                    >
                    <td
                        class={`text-base mx-1 px-1 border-b dark:border-gray-600 ${pyfila}`}
                    >
                        {#if a.sexo == "H"}
                            {getEstadoNombre(a.prenada)}
                        {:else}
                            -
                        {/if}
                    </td>
                    <td
                        class={`text-base mx-1 px-1 border-b dark:border-gray-600 ${pyfila}`}
                    >
                        {a.expand
                            ? a.expand.lote
                                ? a.expand.lote.nombre
                                : ""
                            : ""}
                    </td>
                    <td
                        class={`text-base mx-1 px-1 border-b dark:border-gray-600 ${pyfila}`}
                    >
                        {a.expand
                            ? a.expand.rodeo
                                ? a.expand.rodeo.nombre
                                : ""
                            : ""}
                    </td>
                    <td
                        class={`text-base mx-1 px-1 border-b dark:border-gray-600 ${pyfila}`}
                    >
                        {a.fechanacimiento != ""
                            ? calcularEdad(a.fechanacimiento)
                            : "-"}
                    </td>

                    <td class={`border-b dark:border-gray-600 gap-1 ${pyfila}`}>
                        <button onclick={() => goto(`${pre}/animales/${a.id}`)}>
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
</div>
<Paginacion
    rows={animalesrows}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
/>

