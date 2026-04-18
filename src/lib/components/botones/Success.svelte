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
        mt = "mt-1",
        mb = "mb-1",
        w = "",
        items = "items-center",
        text = "text-start",
        btn = "",
        conhijo = false,
        children,
    } = $props();
    const base = $derived(
        `${btn} ${rounded} ${fuentepeso} ${px} ${py} ${fuentesize} flex ${items} gap-1 ${mt} ${mb}`,
    );
</script>

<button
    {onclick}
    {disabled}
    class={`
        ${base}
        ${w} ${text}
        bg-[#115642] text-white hover:bg-[#126a50]
        dark:bg-[#168561]  dark:hover:bg-[#115642]
        
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-[#126a50] disabled:dark:hover:bg-[#168561]
    `}
>
    {#if conhijo}
        {@render children()}
    {:else}
        {texto}
    {/if}
</button>
