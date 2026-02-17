<script>
    import estilos from "$lib/stores/estilos";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Animal from "$lib/svgs/animal.svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);

    let { caravana,children } = $props();
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
                <button onclick={volver}>
                    <h1
                        class={`
                                
                                flex text-left
                                text-2xl font-bold 
                                dark:text-white text-gray-900
                            `}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="md:hidden size-5 mt-1"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15.75 19.5 8.25 12l7.5-7.5"
                            />
                        </svg>
                        {caravana}
                    </h1>
                </button>
            </div>
            <div class="hidden md:block text-emerald-600 dark:text-emerald-500">
                <Animal size="size-16" />
            </div>
        </div>
        {@render children()}
    </div>
</div>
