<script>
    import { onMount, onDestroy } from "svelte";
    let {
        total = 0,
        longdescripcion = "Total de animales seleccionados",
        shortdescripcion = "Animales seleccionados",
    } = $props();

    let isVisible = $state(false);
    let isFixed = $state(false);
    const handleScroll = () => {
        const scrollY = window.scrollY;
        const threshold = 200; // Altura a partir de la cual se muestra

        if (scrollY >= threshold) {
            isVisible = true;
            isFixed = true;
        } else {
            isVisible = false;
            isFixed = false;
        }
    };

    onMount(() => {
        window.addEventListener("scroll", handleScroll);
        // Ejecutar una vez al montar para verificar posición inicial
        handleScroll();
    });

    onDestroy(() => {
        window.removeEventListener("scroll", handleScroll);
    });
</script>

{#if isVisible}
    <div
        class={`
            ${
                isFixed ? 
                "fixed top-20 left-1/2 transform -translate-x-1/2 z-50" 
                : ""
            }
            container mx-auto py-1 px-4
            max-w-7xl w-full xl:w-1/2
    `}
    >
        <div
            class={`
            rounded-xl p-1 shadow-2xl mb-1
            dark:bg-slate-900 bg-white
            px-6
        `}
        >
            <div
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-transparent rounded-lg"
            >
                <!-- Izquierda: texto -->
                <div class="text-md text-gray-700 dark:text-white">
                    <span class="hidden xl:block"
                        >{longdescripcion}: {total}</span
                    >
                    <span class="xl:hidden">
                        {shortdescripcion}: {total}
                    </span>
                </div>
            </div>
        </div>
    </div>
{/if}
