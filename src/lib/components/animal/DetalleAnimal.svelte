<script>
    import estilos from "$lib/stores/estilos";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Animal from "$lib/svgs/animal.svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);

    let { caravana, children,add=false } = $props();
    function volver() {
        goto(pre + "/animales");
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div class="container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4">
    <a
        href={`${pre + "/animales"}`}
        class="
        inline-flex items-center text-sm
        text-gray-700 hover:text-gray-900 dark:text-gray-400
        dark:hover:text-gray-200 mb-4"
    >
        <svg
            class="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
        </svg>
        Volver a animales
    </a>
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
                        
                        {add?"Nuevo animal":caravana}
                    </h1>
            </div>
            <div class="hidden md:block text-emerald-600 dark:text-emerald-500">
                <Animal size="size-16" />
            </div>
        </div>
        {@render children()}
    </div>
</div>
