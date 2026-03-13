<script>
    let {
        texto = "",
        onclick = () => {},
        disabled = false,
        rounded = "rounded-full",
        fuentepeso = "font-normal",
        fuentesize = "text-base",
        py = "py-1",
        px = "px-3",
        btn = "",
        mt = "mt-1",
        mb = "mb-1",
        conhijo = false,
        children,
    } = $props();
    const base = $derived(
        `border ${btn} ${rounded} ${fuentepeso} ${px} ${py} ${fuentesize} flex items-center gap-1 ${mt} ${mb}`
    );
</script>

<button
    {onclick}
    {disabled}
    class={`
        ${base}
        bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800
        border-[#115642] text-black dark:text-white hover:border-[#126a50]
        
        
        
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:border-[#126a50] disabled:dark:hover:border-[#168561]
    `}
>
    {#if conhijo}
        {@render children()}
    {:else}
        {texto}
    {/if}
</button>
