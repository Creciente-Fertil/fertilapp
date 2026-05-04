<script>
    import { onMount, onDestroy } from "svelte";
    let {
        total = 0,
        longdescripcion = "",
        shortdescripcion = "",
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
// Función para llevar al usuario al inicio de la página suavemente
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
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
            transition-all duration-300 ease-in-out
    `}
    >
        <div
            class={`
            rounded-xl p-1 mb-1
                
            px-6
        `}
        >
            <div
                class={`
                rounded-xl shadow-lg mb-1 border border-gray-100 dark:border-gray-800
                dark:bg-slate-900 bg-white
                flex items-center justify-between px-4 py-2 sm:px-6 sm:py-3
            `}
            >
                <!-- Izquierda: Texto -->
                <div
                    class="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-medium"
                >
                    <span class="hidden xl:block"
                        >{longdescripcion}: <strong>{total}</strong></span
                    >
                    <span class="xl:hidden"
                        >{shortdescripcion}: <strong>{total}</strong></span
                    >
                </div>

                <!-- Derecha: Botón Ir Arriba -->
                <button
                    onclick={scrollToTop}
                    class="
                    ml-4 p-2 rounded-full
                    bg-gray-100 hover:bg-[#115642] hover:text-white
                    dark:bg-gray-800 dark:hover:bg-[#115642] dark:hover:text-white
                    text-gray-500 dark:text-gray-400
                    transition-all duration-200
                    flex items-center justify-center
                    group
                "
                    aria-label="Ir al inicio"
                    title="Ir al inicio"
                >
                    <!-- SVG proporcionado, ajustado para quitar rotación inexistente y mejorar tamaño -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform duration-200"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>
{/if}
