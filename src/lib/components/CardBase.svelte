<script>
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import estilos from '$lib/stores/estilos';
    export let titulo = ""
    export let cardsize = "max-w-5xl"
</script>
<div 
    class="
        min-h-screen dark:bg-gradient-to-br 
        dark:from-gray-900 dark:to-gray-800 
        p-4
    "
>
    <div class="flex items-center justify-center">
        <div 
            class={`
                bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full
                ${cardsize}
            `}
            
        >
            {#if titulo.length>0}
                <h1 
                    class="
                        text-2xl font-bold mb-6 text-start
                        
                        text-[#115642] dark:text-[#24a579]
                    "
                >
                    {titulo}
                </h1>
            {/if}
            <slot/>
        </div>
    </div>
</div>