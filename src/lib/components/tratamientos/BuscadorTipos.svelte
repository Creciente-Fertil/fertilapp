<script>
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import Filter from "$lib/svgs/filter.svelte";
    import Plus from "$lib/svgs/plus.svelte";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        buscador = $bindable(""),
        idtipo = "",
        nombretipo = $bindable(),
        isOpenForm = false,
        nuevo = () => {},
        editar = (id) => {},
        filterUpdate = () => {},
        validarBotonTipo = () => {},
    } = $props();
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div class="container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4">
    <!--Header-->
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
                        text-3xl font-semibold 
                        dark:text-white text-gray-900
                    `}
                >
                    Tipos Tratamientos
                </h1>
            </div>
        </div>
        <!--Botones-->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-1 md:p-2 bg-transparent rounded-lg"
        >
            <!-- Input de búsqueda -->
            <div
                class={`
                  flex items-center flex-1
                  shadow-2xl
                  rounded-full p-3
                
                  bg-white dark:bg-gray-900
                  shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
                  dark:shadow-[0_4px_8px_-2px_rgba(255,255,255,0.1)]
                `}
            >
                <input
                    type="text"
                    placeholder="Buscar por nombre ..."
                    class={`
                    shadow-2xl
                    dark:placeholder-gray-500 
                    dark:text-gray-100
                    placeholder-gray-600 text-gray-800
                    
                    w-full bg-transparent focus:outline-none
                    border border-transparent
                    
                `}
                    bind:value={buscador}
                    oninput={filterUpdate}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103 10.5a7.5 7.5 0 0013.15 6.15z"
                    />
                </svg>
            </div>
            <div class="flex flex-wrap gap-2 items-bottom">
                <button
                    onclick={nuevo}
                    class={`
                        border rounded-full px-3 py-1 text-md flex 
                        items-center gap-1
                        
                        ${
                            isOpenForm
                                ? "bg-[#115642]  hover:bg-[#0f4537] border-[#115642] text-white"
                                : "bg-white  border-gray-300  hover:bg-gray-300 dark:bg-transparent dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white"
                        }
                    `}
                >
                    <Plus size="size-4" />
                    Nuevo tipo
                </button>
            </div>
        </div>
        {#if isOpenForm}
            <div transition:slide>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-1">
                    <div class="col-span-1 md:col-span-2">
                        <label for="nombre" class="label">
                            <span class="label-text text-base">Nombre</span>
                        </label>
                        <label class="input-group">
                            <input
                                id="nombre"
                                type="text"
                                class={`
                                    input input-bordered 
                                    w-full
                                    border border-gray-300 rounded-md
                                    focus:outline-none focus:ring-2 
                                    focus:ring-green-500 
                                    focus:border-green-500
                                    ${estilos.bgdark2} 
                                    
                                `}
                                bind:value={nombretipo}
                                oninput={validarBotonTipo}
                            />
                        </label>
                    </div>
                    {#if idtipo == ""}
                        <div class="flex items-center justify-end">
                            <button
                                onclick={nuevo}
                                class={`
                                border rounded-full px-3 py-1 text-md flex 
                                items-center gap-1
                                bg-[#115642]  hover:bg-[#0f4537] border-[#115642] text-white
                            `}
                            >
                                Guardar
                            </button>
                        </div>
                    {:else}
                        <div class="flex items-end ">
                            <button
                                onclick={() => editar(idtipo)}
                                class={`
                                border rounded-full px-3 py-1 text-md flex 
                                items-center gap-1
                                bg-[#115642]  hover:bg-[#0f4537] border-[#115642] text-white
                            `}
                            >
                                Editar
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>
