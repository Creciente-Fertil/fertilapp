<script>
import { slide } from "svelte/transition";
    import estilos from "$lib/stores/estilos";
    //Seleecionar
    let selectcategoria = $state(true);
    let selectlote = $state(false);
    let selectrodeo = $state(false);
    let selecttratamiento = $state(false);
    let selectbaja = $state(false);
    let selecttransfer = $state(false);

    
    let {
        lotes = [],
        rodeos = [],
        categorias = [],
        motivos = [],
        categoria = $bindable(""),
        lote = $bindable(""),
        rodeo = $bindable(""),
        fecha = $bindable(""),
        motivo = $bindable(""),
        fechabaja = $bindable(""),
        codigo = $bindable(""),
        malcodigo=false,
        
        oninput = (campo) => {},
        onChangeCollapse = (seccion) => {},
    } = $props();
    let seccionAbierta = $state("CATEGORIA"); // o "CATEGORIA" si quieres que empiece abierta

    function toggleSeccion(seccion) {
        seccionAbierta = seccionAbierta === seccion ? null : seccion;
        onChangeCollapse?.(seccion); // opcional: si aún necesitas notificar al padre
    }
</script>

<div
    class={`
            rounded-xl p-1 shadow-2xl mb-1
            dark:bg-slate-900 bg-white
            px-6
        `}
>
    <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 mb-2 border-b dark:border-gray-800"
    >
        <div
            class={`
                    bg-transparent
                    py-2
                `}
        >
            <h1
                class={`
                    text-xl font-semibold 
                    dark:text-gray-300 text-gray-700
                `}
            >
                Detalles movimiento
            </h1>
        </div>
    </div>
    <div class="grid grid-cols-1">
        <!-- Cambiar categoría -->
        <div class="border-b border-base-200 py-2">
            <button
                class="w-full flex justify-between items-center text-xl font-medium"
                onclick={() => toggleSeccion("CATEGORIA")}
                aria-expanded={seccionAbierta === "CATEGORIA"}
            >
                <span>Cambiar categoria</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`h-5 w-5 transition-transform duration-300 ${seccionAbierta === "CATEGORIA" ? "rotate-180" : ""}`}
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
            </button>

            {#if seccionAbierta === "CATEGORIA"}
                <div transition:slide class="mt-2">
                    <label for="rodeos" class="label">
                        <span class="label-text text-base"
                            >Seleccione nueva categoria</span
                        >
                    </label>
                    <label class="input-group">
                        <select
                            class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                            bind:value={categoria}
                            onchange={() => {
                                oninput("CATEGORIA");
                            }}
                        >
                            {#each categorias as r}
                                <option value={r.id}>{r.nombre}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            {/if}
        </div>
        <!-- Cambiar LOTE -->
        <div class="border-b border-base-200 py-2">
            <button
                class="w-full flex justify-between items-center text-xl font-medium"
                onclick={() => toggleSeccion("LOTE")}
                aria-expanded={seccionAbierta === "LOTE"}
            >
                <span>Cambiar Lote</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`h-5 w-5 transition-transform duration-300 ${seccionAbierta === "LOTE" ? "rotate-180" : ""}`}
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
            </button>

            {#if seccionAbierta === "LOTE"}
                <div transition:slide class="mt-2">
                    <label for="rodeos" class="label">
                        <span class="label-text text-base"
                            >Seleccione nuevo lote</span
                        >
                    </label>
                    <label class="input-group">
                        <select
                            class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                            bind:value={lote}
                            onchange={() => oninput("LOTE")}
                        >
                            {#each lotes as r}
                                <option value={r.id}>{r.nombre}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            {/if}
        </div>
        <!-- Cambiar rodeo -->
        <div class="border-b border-base-200 py-2">
            <button
                class="w-full flex justify-between items-center text-xl font-medium"
                onclick={() => toggleSeccion("RODEO")}
                aria-expanded={seccionAbierta === "RODEO"}
            >
                <span>Cambiar rodeo</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`h-5 w-5 transition-transform duration-300 ${seccionAbierta === "CATEGORIA" ? "rotate-180" : ""}`}
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
            </button>

            {#if seccionAbierta === "RODEO"}
                <div transition:slide class="mt-2">
                    <label for="rodeos" class="label">
                        <span class="label-text text-base">Rodeos</span>
                    </label>
                    <label class="input-group">
                        <select
                            class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                            bind:value={rodeo}
                            onchange={() => oninput("RODEO")}
                        >
                            {#each rodeos as r}
                                <option value={r.id}>{r.nombre}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            {/if}
        </div>
        <!-- Dar de baja -->
        <div class="border-b border-base-200 py-2">
            <button
                class="w-full flex justify-between items-center text-xl font-medium"
                onclick={() => toggleSeccion("BAJA")}
                aria-expanded={seccionAbierta === "BAJA"}
            >
                <span>Dar de baja</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`h-5 w-5 transition-transform duration-300 ${seccionAbierta === "CATEGORIA" ? "rotate-180" : ""}`}
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
            </button>

            {#if seccionAbierta === "BAJA"}
                <div transition:slide class="mt-2">
                    <div class="grid grid-cols-1 gap-1">
                        <div>
                            <label for="fecha" class="label">
                                <span class="label-text text-base">Motivo</span>
                            </label>
                            <label class="input-group">
                                <select
                                    class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                                    bind:value={motivo}
                                    onchange={() => oninput("MOTIVO")}
                                >
                                    {#each motivos as r}
                                        <option value={r.id}>{r.nombre}</option>
                                    {/each}
                                </select>
                            </label>
                        </div>
                        <div>
                            <label for="fecha" class="label">
                                <span class="label-text text-base">Fecha</span>
                            </label>
                            <label class="input-group">
                                <input
                                    id="fecha"
                                    type="date"
                                    max={HOY}
                                    class={`
                                        input input-bordered w-full
                                        border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        ${estilos.bgdark2} 
                                    `}
                                    bind:value={fechabaja}
                                    onchange={() => oninput("FECHABAJA")}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
        <!-- Transferir -->
        <div class="border-b border-base-200 py-2">
            <button
                class="w-full flex justify-between items-center text-xl font-medium"
                onclick={() => toggleSeccion("TRANSFERIR")}
                aria-expanded={seccionAbierta === "TRANSFERIR"}
            >
                <span>Transferir</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`h-5 w-5 transition-transform duration-300 ${seccionAbierta === "CATEGORIA" ? "rotate-180" : ""}`}
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
            </button>

            {#if seccionAbierta === "TRANSFERIR"}
                <div transition:slide class="mt-2">
                    <div class="grid grid-cols-1 gap-1">
                        <div>
                            <label for="codigo" class="label">
                                <span class="label-text text-base">RENSPA</span>
                            </label>
                            <input
                                id="codigo"
                                type="text"
                                class={`input input-bordered w-full ${estilos.bgdark2}`}
                                bind:value={codigo}
                                oninput={() => oninput("CODIGO")}
                            />
                            {#if malcodigo}
                                <div class="label">
                                    <span class="label-text-alt text-red-500"
                                        >No existe un establecimiento con ese
                                        RENSPA</span
                                    >
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
