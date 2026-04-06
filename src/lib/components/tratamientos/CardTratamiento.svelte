<script>
    import { fade, fly } from "svelte/transition";
    
    import Tratamiento from "$lib/svgs/tratamiento.svelte";
    import estilos from "$lib/stores/estilos";
    import { goto } from "$app/navigation";
    import Tactos from "../animal/Tactos.svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let { cardsize = "", children,edit=false } = $props();
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
    class="
        container mx-auto py-6 px-4 max-w-7xl
        w-full xl:w-3/4
        pb-16
        "
>
<a
        href={`${pre + "/tratamientos"}`}
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
        Volver a tratamientos
    </a>
    <!--Header-->
    <div
        class={`
            rounded-2xl p-2  mb-2
            dark:bg-slate-900 bg-white
            shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
            dark:shadow-none
        `}
    >
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b dark:border-gray-800"
        >
            <div
                class={`
                    bg-transparent
                    px-3 py-4 
                `}
            >
                <button onclick={() => goto(pre + "/tratamientos")}>
                    <h1
                        class={`
                            flex text-left
                            text-3xl font-medium 
                            ${estilos.subtitle}
                        `}
                    >
                        {edit ? "Editar" : "Ver"}
                        Tratamiento
                    </h1>
                </button>
            </div>

            <div class="hidden md:block text-[#115642]">
                <Tratamiento size="size-12" />
            </div>
        </div>
        {@render children()}
    </div>
</div>
