<script>
    import estilos from "$lib/stores/estilos";

    import { slide } from "svelte/transition";

    let {
        opciones,
        etiqueta,
        valores = $bindable([]),
        agregarElemento = (id) => {},
        quitarElemento = (id) => {},
        filterUpdate = () => {},
        clickOption = (idopt) => {
            if (valores.includes(idopt)) {
                valores = valores.filter((v) => v != idopt);
                quitarElemento(idopt);
            } else {
                valores.push(idopt);
                agregarElemento(idopt);
            }
            filterUpdate();
        },
        margintop = "mt-2",
        labelmargin = "m-0",
        campo = "nombre",
        etiquetaDefault = true,
        edit = true,
        px = "px-2",
        py = "py-2",
        wlen = "w-full",
        children,
    } = $props();
    //Logica de las opciones
    let isOpen = $state(false);
    let buttonWidth = $state("0px");
    let buttonRef = $state(null);
    let buscador = $state(""); // Estado para el filtro

    function getNombre(idopt) {
        let op = opciones.filter((o) => o.id == idopt)[0];
        return op[campo];
    }
    // Opciones filtradas derivadas reactivamente
    let opcionesFiltradas = $derived(
        opciones.filter((op) =>
            op[campo].toLowerCase().includes(buscador.toLowerCase()),
        ),
    );
    // Función para actualizar el ancho
    function updateWidth() {
        if (buttonRef) {
            buttonWidth = `${buttonRef.offsetWidth}px`;
        }
    }

    // En Svelte 5, usamos $effect para reaccionar cuando se abre
    $effect(() => {
        if (isOpen) {
            // Pequeño timeout para asegurar que el DOM del botón está listo si acaba de renderizarse
            setTimeout(() => updateWidth(), 0);
        }
    });
</script>

{#if etiquetaDefault}
    <label for="" class="label my-0 py-0">
        <span class="label-text text-base">{etiqueta} </span>
    </label>
{:else}
    {@render children()}
{/if}
{#if edit}
    <div class={`${px} ${py}`}>
        <button
            bind:this={buttonRef}
            class={`
                ${margintop} h-auto w-full p-2 text-left 
                flex items-center justify-between 
                border
                ${estilos.bgdark2}
                rounded-md 
                shadow-sm 
                focus:outline-none focus:ring-2 
                focus:ring-green-500 focus:border-green-500
            `}
            onclick={() => {
                isOpen = !isOpen;
                if (!isOpen) updateWidth(); // Asegurar ancho al abrir
            }}
        >
            {#if valores.length == 0}
                <span class="block truncate"> Seleccciona una opción </span>
            {:else}
                {@const chunkedValores = (() => {
                    const chunks = [];
                    for (let i = 0; i < valores.length; i += 3) {
                        chunks.push(valores.slice(i, i + 3));
                    }
                    return chunks;
                })()}
                <div class="flex flex-col gap-1 overflow-x-hidden">
                    {#each chunkedValores as chunk}
                        <div class="flex flex-wrap gap-2">
                            {#each chunk as v}
                                <span
                                    class="
                                truncate
                                inline-flex items-center rounded-md
                                px-2 py-1 text-base font-medium ring-1 ring-inset
                                bg-transparent
                                text-gray-700 dark:text-gray-50
                                ring-gray-600/20 dark:ring-gray-50/20
                            "
                                >
                                    {getNombre(v)}
                                </span>
                            {/each}
                        </div>
                    {/each}
                </div>
                <div class="hidden flex content-normal gap-2 overflow-x-hidden">
                    {#each valores as v}
                        <span
                            class="
                        truncate
                        inline-flex items-center rounded-md
                        px-2 py-1 text-base font-medium ring-1 ring-inset
                        bg-green-50 dark:bg-green-700
                        text-green-700 dark:text-green-50
                        ring-green-600/20 dark:ring-green-50/20
                        "
                        >
                            {getNombre(v)}
                        </span>
                    {/each}
                </div>
            {/if}

            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class={`size-6 w-5 h-5 ml-2 -mr-1 text-gray-400 transition-all duration-150 ${isOpen ? "transform rotate-180" : ""}`}
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                />
            </svg>
        </button>
        {#if isOpen}
            <div
                style="width: {buttonWidth}"
                class={`
                absolute
                ${estilos.bgdark2}
                 z-10 mt-0 bg-white rounded-md shadow-lg   
                ${px} ${py}
                
            `}
            >
                <!-- Input de búsqueda -->
                <div class="p-1 border-b border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        class={`
                        w-full px-3 py-2 text-sm rounded-md border border-gray-300
                        dark:border-gray-600 focus:outline-none focus:ring-2
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2} dark:bg-gray-800 dark:text-white
                    `}
                        placeholder="Filtrar opciones..."
                        bind:value={buscador}
                        onclick={(e) => e.stopPropagation()}
                    />
                </div>
                <ul
                    class="
                    text-base max-h-40 focus:outline-none sm:text-sm overflow-y-auto
                    w-full
                "
                >
                    {#each opcionesFiltradas as v}
                        <li
                            class={`cursor-default hover:bg-green-100 hover:text-green-800 dark:hover:text-green-800  dark:text-white `}
                        >
                            <button
                                class={`text-start w-full relative py-2 pl-3 select-none pr-9 bg-transparent`}
                                onclick={() => clickOption(v.id)}
                            >
                                <span
                                    class={`
                                    
                                    truncate
                                    ${valores.some((item) => item == v.id) ? "font-semibold" : "font-normal"}
                                `}
                                >
                                    {v[campo]}
                                </span>
                                {#if valores.some((item) => item == v.id)}
                                    <span
                                        class="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600"
                                    >
                                        <svg
                                            class="w-5 h-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                {/if}
                            </button>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
{:else}
    <div class={`${px} ${py}`}>
        {#if valores.length == 0}
            <span class="block truncate"> Seleccciona una opción </span>
        {:else}
            {@const chunkedValores = (() => {
                const chunks = [];
                for (let i = 0; i < valores.length; i += 3) {
                    chunks.push(valores.slice(i, i + 3));
                }
                return chunks;
            })()}
            <div class="flex flex-col gap-1 overflow-x-hidden">
                {#each chunkedValores as chunk}
                    <div class="flex flex-wrap gap-2">
                        {#each chunk as v}
                            <span
                                class="
                                truncate
                                inline-flex items-center rounded-md
                                px-2 py-1 text-base font-medium ring-1 ring-inset
                                bg-transparent
                                text-gray-700 dark:text-gray-50
                                ring-gray-600/20 dark:ring-gray-50/20
                            "
                            >
                                {getNombre(v)}
                            </span>
                        {/each}
                    </div>
                {/each}
            </div>
            <div class="hidden flex content-normal gap-2 overflow-x-hidden">
                {#each valores as v}
                    <span
                        class="
                        truncate
                        inline-flex items-center rounded-md
                        px-2 py-1 text-base font-medium ring-1 ring-inset
                        bg-green-50 dark:bg-green-700
                        text-green-700 dark:text-green-50
                        ring-green-600/20 dark:ring-green-50/20
                        "
                    >
                        {getNombre(v)}
                    </span>
                {/each}
            </div>
        {/if}
    </div>
{/if}
