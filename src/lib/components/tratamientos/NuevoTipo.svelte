<script>
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import Filter from "$lib/svgs/filter.svelte";
    import Plus from "$lib/svgs/plus.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";

    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        idtipo = "",
        nombretipo = $bindable(),

        nuevo = () => {},
        editar = (id) => {},

        validarBotonTipo = () => {},
        edit = false
    } = $props();
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div class="container mx-auto py-0 my-0 px-4 max-w-7xl w-full xl:w-3/4">
    <!--Header-->
    <div
        class={`
            rounded-t-xl py-0 shadow-2xl mb-0
            dark:bg-slate-900 bg-white
            px-6
            
        `}
    >
        <div class="flex flex-row py-2 w-full">
            <div class="flex items-center justify-center"> 
                {#if idtipo == ""}
                    <button
                        onclick={nuevo}
                    >
                        <Plus size="size-5" />
                    </button>
                {:else}
                    <button
                        onclick={editar}
                    >
                        <Pencil size="size-5" />
                    </button>
                {/if}
            </div>
            <div class="w-full">
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
                        placeholder={idtipo == "" ? "Agregar nuevo tipo" : ""}
                        bind:value={nombretipo}
                        oninput={validarBotonTipo}
                    />
                </label>
            </div>
        </div>
    </div>
</div>
