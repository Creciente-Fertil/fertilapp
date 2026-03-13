<script>
    let {
        texto = "",
        onclick=()=>{},
        disabled = false,
        rounded="rounded-full",
        fuentepeso="font-normal",
        fuentesize="text-base",
        py="py-1",
        px="px-3",
        btn="",
        mt="mt-1",
        mb="mb-1"


    } = $props()
    const base = $derived(`${btn} ${rounded} ${fuentepeso} ${px} ${py} ${fuentesize} flex items-center gap-1 ${mt} ${mb}`);

</script>
<button
    {onclick}
    {disabled}
    class={`
        ${base}
        bg-[#A94442]  text-white hover:bg-[#813034]
        dark:bg-[#813034] dark:hover:bg-[#6f2c31]
        
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-[#993738]
    `}
>
    {texto}
</button>