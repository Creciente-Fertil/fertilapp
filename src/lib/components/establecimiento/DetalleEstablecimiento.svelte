<script>
    import estilos from "$lib/stores/estilos";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Estable from "$lib/svgs/estable.svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);

    let { textodetalle="", children } = $props();
    function volver() {
        goto(pre + "/animales");
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div class="container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4">
    
    <!--Header-->
    <div
        class={`
        rounded-md p-4 shadow-xl mb-4
        dark:bg-slate-900 bg-white
    `}
    >
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
            <div
                class={`
                        bg-transparent        
                        px-4 py-4 
                    `}
            >
                <h1
                        class={`
                                
                                flex text-left
                                text-2xl font-bold 
                                dark:text-white text-gray-900
                            `}
                    >
                        
                        {textodetalle}
                    </h1>
            </div>
            <div class="hidden md:block text-emerald-600 dark:text-emerald-500">
                <Estable size="size-16" />
            </div>
        </div>
        {@render children()}
    </div>
</div>
