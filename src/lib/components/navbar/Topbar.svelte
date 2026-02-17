<script>
    import estilos from "$lib/stores/estilos";
    import Creciente from "$lib/svgs/creciente.svelte";
    import Oscuro from "../Oscuro.svelte";
    let pre = import.meta.env.VITE_PRE;
    let {
        escritorio=true,
        bgnav,
        classnavbarr,
        classtextnavbar,
        handleClick=()=>{},
        leerNotis=()=>{},
        leido,
        primeraletra,
        nombreusuario,
        notificaciones,
        editarUser,
        cambiarEstablecimiento,
        verManual,
        salir,
        esCelu
    } = $props()
</script>

<div class={classnavbarr}>
    <div class={`flex-none ${escritorio?"hidden":""}`}>
        <button
            aria-label="menu"
            class={`mx-1 px-0 btn btn-ghost ${classtextnavbar}`}
            onclick={handleClick}
        >
            <div class="flex items-center gap-2 px-3">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class=" size-6"
                >
                    <path
                        fill-rule="evenodd"
                        d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                        clip-rule="evenodd"
                    />
                </svg>
                <span class="hidden md:block text-lg font-bold">Menu</span>
            </div>
        </button>
    </div>
    <div class="flex-1">
        <a
            aria-label="Establecientos"
            href={pre + "/establecimientos"}
            class={`p-0 bg-transparent item-starts`}
        >
            {#if esCelu}
                <Creciente margenes="m-0" alto="h-8" largo="w-24" />
            {:else}
                <Creciente margenes="m-0" alto="h-12" largo="w-40" />
            {/if}
        </a>
    </div>
    <div class="flex mr-1 pr-1 lg:mr-5 lg:pr-5">
        <div class="mx-2">
            <Oscuro></Oscuro>
        </div>

        <details class="dropdown dropdown-end">
            <summary
                class={`btn m-0 p-0 bg-transparent hover:bg-transparent ${classtextnavbar} border-none`}
                onclick={leerNotis}
            >
                <div class="indicator">
                    {#if !leido}
                        <span
                            class="indicator-item badge dark:badge-error badge-error badge-xs"
                        ></span>
                    {/if}
                    <div
                        class={`
                                    ${primeraletra.length > 0 ? "" : "hidden"}
                                    h-8 w-8 bg-[#115642] rounded-full 
                                    flex  items-center justify-center 
                                    shadow-md
                                `}
                    >
                        <span class="text-white font-medium text-xl"
                            >{primeraletra}</span
                        >
                    </div>
                    <span class={`hidden px-2`}>{nombreusuario} </span>
                </div>
            </summary>

            <ul
                class={`menu dropdown-content w-52 rounded-box z-[1] shadow ${classtextnavbar} ${bgnav}`}
            >
                {#if notificaciones.length == 0}
                    <li><span>Sin notificaciones</span></li>
                {:else}
                    {#each notificaciones as n}
                        <li><span>{n.titulo}</span></li>
                    {/each}
                {/if}
            </ul>
        </details>

        <details class="dropdown dropdown-end">
            <summary class={`btn btn-square btn-ghost ${classtextnavbar}`}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block h-5 w-5 stroke-current"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    ></path>
                </svg>
            </summary>
            <div class="pr-3 mr-3">
                <ul
                    class={`menu dropdown-content rounded-box z-[1] shadow ${classtextnavbar} ${bgnav}`}
                >
                    <li>
                        <button onclick={editarUser}>Configuración</button>
                    </li>
                    <li>
                        <button onclick={cambiarEstablecimiento}
                            >Establecimientos</button
                        >
                    </li>
                    <li><button onclick={verManual}>Manual</button></li>
                    <li><button onclick={salir}>Salir</button></li>
                </ul>
            </div>
        </details>
    </div>
</div>
