<script>
    import estilos from "$lib/stores/estilos";
    import Paginacion from "../paginacion.svelte";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";
    import Badge from "../Badge.svelte";
    let {
        pageSize = $bindable(10),
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
    function onChangePageSize() {
        paginaActual = 1;
    }
    //$effect(() => {
    //    if (firstRun) {
    //        firstRun = false;
    //        return;
    //    }
    //    paginaActual = 1;
    //
    //});

    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        serviciosrow.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(serviciosrow.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
</script>

<table class="table table-lg w-full bg-white dark:bg-slate-900">
    <thead class={`${estilos.tableheader}`}>
        <tr>
            <th class="hidden text-base mx-2 px-2 border-b border-emerald-700">
                <input type="checkbox" checked={todos} onchange={clickTodos} />
            </th>
            <th class="text-base mx-2 px-2  w-16">
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
                onclick={() => ordenarServicios("fecha", false)}
                class={`
                    ${estilos.tableth}   

                `}
            >
                <div class="flex flex-row justify-between uppercase">
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
            <th
                class="text-base mx-1 px-1 uppercase"
            >
                Fecha Hasta
            </th>
            <th
                onclick={() => ordenarServicios("fechaparto", false)}
                class={`
                                ${estilos.tableth}   
                            `}
            >
                <div class="flex flex-row justify-between uppercase">
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
                <div class="flex flex-row justify-between uppercase">
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
            <th
                class="text-base mx-1 px-1 uppercase"
            >
                Padres
            </th>
            <th
                onclick={() => ordenarServicios("tipo", false)}
                class={`
                                ${estilos.tableth}   
                            `}
            >
                <div class="flex flex-row justify-between uppercase">
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
            <th
                class="text-base mx-1 px-1 text-center uppercase"
            >
                Acciones
            </th>
        </tr>
    </thead>
    <tbody>
        {#each rows as s}
            
            <tr>
                <td
                    class="hidden text-base mx-2 px-2 border-b dark:border-gray-600"
                >
                    <input
                        type="checkbox"
                        checked={selecthash[s.id] ? true : false}
                        onchange={() => clickFila(s.id)}
                    />
                </td>
                <td
                    class="text-base mx-2 px-2 w-16"
                >
                    <label
                        class="flex items-center justify-center cursor-pointer"
                    >
                        <!-- Input real (oculto pero funcional) -->
                        <input
                            type="checkbox"
                            checked={selecthash[s.id] ? true : false}
                            onchange={() => clickFila(s.id)}
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
                    class="text-base ml-3 pl-3 mr-1 pr-1"
                >
                    {s.fechadesde
                        ? new Date(s.fechadesde).toLocaleDateString()
                        : s.fechainseminacion
                          ? new Date(s.fechainseminacion).toLocaleDateString()
                          : ""}
                    
                </td>
                <td class="text-base mx-1 px-1 "
                    >{s.fechahasta
                        ? new Date(s.fechahasta).toLocaleDateString()
                        : "-"}</td
                >
                <td class="text-base mx-1 px-1 "
                    >{s.fechaparto
                        ? new Date(s.fechaparto).toLocaleDateString()
                        : ""}</td
                >
                <td class="text-base mx-1 px-1 ">
                    {"caravana"}
                </td>
                <td class="text-base mx-1 px-1 ">
                    {s.fechadesde ? getNombrePadres(s.padres) : s.pajuela}
                </td>
                <td class="text-base mx-1 px-1 ">
                    {#if s.fechadesde}
                        <Badge
                            color="blue"
                            text = "Natural"
                        />
                    {:else}
                        <Badge
                            color="purple"
                            text = "Artifical"
                        />
                    {/if}
                    
                </td>
                <td
                    class=" flex items-center justify-center gap-2 px-1 "
                >
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
<Paginacion
    rows={serviciosrow}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
/>
