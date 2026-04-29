<script>
    import { fade, fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import Servicio from "$lib/svgs/servicio.svelte";
    import { goto } from "$app/navigation";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let { edit, titulo = "", cardsize = "", children } = $props();
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
    class="
        container mx-auto py-6 px-4 max-w-7xl
        w-full xl:w-3/4
        min-h-screen
        "
>
    <!--Header-->
    <div
        class={`
            rounded-2xl p-1 mb-1
            dark:bg-slate-900 bg-white
            shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
            dark:shadow-none
            
        `}
    >
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1"
        >
            <div
                class={`
                bg-transparent
                
                px-4 py-1 
            `}
            >
                <button onclick={() => goto(pre + "/servicios")}>
                    <h1
                        class={`
                            flex text-left
                            text-4xl font-medium 
                            dark:text-white text-gray-900
                        `}
                    >
                        <div class="md:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-8 mt-1"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>
                        </div>

                        Movimiento
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
