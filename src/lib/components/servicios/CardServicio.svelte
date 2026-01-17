<script>
    import { fade, fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import Servicio from "$lib/svgs/servicio.svelte";
    import { goto } from "$app/navigation";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let { titulo = "", cardsize = "", children } = $props();
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div class="container mx-auto py-6 px-4 max-w-7xl">
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
                <button onclick={() => goto(pre + "/servicios")}>
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
                            class="size-5 mt-1"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15.75 19.5 8.25 12l7.5-7.5"
                            />
                        </svg>
                        Ver {titulo}
                    </h1>
                </button>
            </div>

            <div class="hidden md:block text-emerald-600 dark:text-emerald-500">
                <Servicio size="size-12" />
            </div>
        </div>
        {@render children()}
    </div>
</div>
<div class="hidden bg-transparent p-2">
    <div class="flex items-center justify-center">
        <div
            class={`
                bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2 w-full 
                ${cardsize}
            `}
        >
            <h1
                class="text-2xl font-bold text-green-700 dark:text-green-400 mb-3 text-start"
            >
                Ver servicio
            </h1>
            {@render children()}
        </div>
    </div>
</div>
