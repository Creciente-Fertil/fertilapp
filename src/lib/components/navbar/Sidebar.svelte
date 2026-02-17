<script>
    import estilos from "$lib/stores/estilos";
    import { slide } from "svelte/transition";
    import Animal from "$lib/svgs/animal.svelte";
    import Reportes from "$lib/svgs/reportes.svelte";
    import Estable from "$lib/svgs/estable.svelte";
    import Lote from "$lib/svgs/lote.svelte";
    import Rodeo from "$lib/svgs/rodeo.svelte";
    import Nacimiento from "$lib/svgs/nacimiento.svelte";
    import Servicio from "$lib/svgs/servicio.svelte";
    import Tacto from "$lib/svgs/tacto.svelte";
    import Tratamiento from "$lib/svgs/tratamiento.svelte";
    import Movimiento from "$lib/svgs/movimiento.svelte";
    import Pesaje from "$lib/svgs/pesaje.svelte";
    import Observacion from "$lib/svgs/observacion.svelte";
    import Importar from "$lib/svgs/importar.svelte";
    let pre = import.meta.env.VITE_PRE;
    let {
        nombreestablecimiento,
        esCelu,
        classtext,
        toggleEstablecimiento,
        establecimientoOpen,
        cab,
        toggleAnimales,
        animalesOpen,
        toggleDatos,
        datosOpen

    }=$props()
</script>

<ul
    class={`
            overflow-y-auto
            menu 
            text-base-content min-h-screen
            w-2/3
            md:w-1/3  
            2xl:w-full p-4
            ${estilos.sidebarbg}
            ${estilos.sidebartextocolor}
    `}
>
    <div
        class="border-b border-gray-700 dark:text-white flex justify-center items-center"
    >
        <h1 class={`text-lg italic  `}>
            {` ${nombreestablecimiento}`}
        </h1>
    </div>
    <!--Inicio-->
    <li
        class={`
                    border-b border-gray-700 
                    
                    ${esCelu ? "hidden" : ""} 
                    
                    
                `}
    >
        <a class={`pb-0 ${classtext}`} href={pre + "/inicio"}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="pl-3 size-8"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
            </svg>
            <span class="px-3 flex items-start"> Inicio </span>
        </a>
    </li>
    <!--Establecimento-->
    <li
        class={`
                    mt-0                     
                `}
    >
        <button onclick={toggleEstablecimiento}>
            <span
                class="flex items-start text-lg font-bold text-[#115642] dark:text-green-500"
            >
                Establecimiento
            </span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class={`h-5 w-5 transition-transform duration-300 ${establecimientoOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button>
    </li>
    <!--Detalle-->
    {#if establecimientoOpen}
        <li
            transition:slide
            class={`
                        ${esCelu ? "hidden" : ""} 
                    `}
        >
            <a class={`py-0 ${classtext}`} href={pre + "/establecimiento"}>
                <Estable size="size-8" margenes=""></Estable>

                <span class="px-2 flex items-center">
                    <div>Establecimiento</div>
                </span>
            </a>
        </li>
        <!--Lotes-->
        <li
            transition:slide
            class={` 
                    ${cab.exist ? "" : "disabled"} 
                    
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/lotes"}>
                    <Lote size="size-8" margenes=""></Lote>
                    <span class="px-3"> Lotes </span>
                </a>
            {:else}
                <div class={classtext}>
                    <Lote size="size-8" margenes=""></Lote>
                    <span class="px-3"> Lotes </span>
                </div>
            {/if}
        </li>
        <!--Rodeos-->
        <li
            transition:slide
            class={`
                    border-b border-gray-700  items-start
                    ${cab.exist ? "" : "disabled"}
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/rodeos"}>
                    <Rodeo size={"size-8"} margenes=""></Rodeo>

                    <span class="px-3"> Rodeos </span>
                </a>
            {:else}
                <div class={classtext}>
                    <Rodeo size={"size-8"} margenes=""></Rodeo>

                    <span class="px-3"> Rodeos </span>
                </div>
            {/if}
        </li>
    {/if}
    <!--Animales-->
    <li
        class={`
                    mt-0                     
                `}
    >
        <button onclick={toggleAnimales}>
            <span
                class="flex items-start text-lg font-bold text-[#115642] dark:text-green-500"
            >
                Animales
            </span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class={`h-5 w-5 transition-transform duration-300 ${animalesOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button>
    </li>
    {#if animalesOpen}
        <!--Animales-->
        <li
            transition:slide
            class={`
                    ${esCelu ? "hidden" : ""}
                     
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/animales"}>
                    <Animal size="size-8" margenes=""></Animal>

                    <span class="px-3"> Animales </span>
                </a>
            {:else}
                <div class={`${classtext} py-0`}>
                    <Animal size="size-8" margenes=""></Animal>
                    <span class="px-3"> Animales </span>
                </div>
            {/if}
        </li>
        <!--Nacimientos-->
        <li
            transition:slide
            class={`
                    ${cab.exist ? "" : "disabled"}
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/nacimientos"}>
                    <Nacimiento size="size-8" margenes=""></Nacimiento>
                    <span class="px-3"> Nacimientos </span>
                </a>
            {:else}
                <div class={classtext}>
                    <Nacimiento size="size-8"></Nacimiento>
                    <span class="px-3"> Nacimientos </span>
                </div>
            {/if}
        </li>
        <!--Servicios-->
        <li
            transition:slide
            class={`
                    ${cab.exist ? "" : "disabled"}
                    
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/servicios"}>
                    <Servicio size="size-8" margenes=""></Servicio>
                    <span class="px-3">Servicios</span>
                </a>
            {:else}
                <div class={classtext}>
                    <Servicio size="size-8" margenes=""></Servicio>
                    <span class="px-3">Servicios</span>
                </div>
            {/if}
        </li>
        <!--Tactos-->
        <li
            transition:slide
            class={` 
                    ${cab.exist ? "" : "disabled"}
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/tactos/cab"}>
                    <Tacto size="size-8" margenes=""></Tacto>
                    <span class="px-3"> Tactos </span>
                </a>
            {:else}
                <div class={classtext}>
                    <Tacto size="size-8" margenes=""></Tacto>
                    <span class="px-3"> Tactos </span>
                </div>
            {/if}
        </li>
        <!--Tratamientos-->
        <li
            transition:slide
            class={`
                    ${cab.exist ? "" : "disabled"}
                    
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/tratamientos"}>
                    <Tratamiento size="size-8" margenes=""></Tratamiento>

                    <span class="px-3">Tratamientos</span>
                </a>
            {:else}
                <div class={classtext}>
                    <Tratamiento size="size-8" margenes=""></Tratamiento>
                    <span class="px-3">Tratamientos</span>
                </div>
            {/if}
        </li>
        <!--Movimientos-->
        <li
            transition:slide
            class={` 
                    ${cab.exist ? "" : "disabled"}
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/movimientos"}>
                    <Movimiento size={"size-8"} margenes=""></Movimiento>
                    <span class="px-3">Movimientos</span>
                </a>
            {:else}
                <div class={classtext}>
                    <Movimiento size={"size-8"} margenes=""></Movimiento>
                    <span class="px-3">Movimientos</span>
                </div>
            {/if}
        </li>
        <!--Pesajes-->
        <li
            transition:slide
            class={` 
                    ${cab.exist ? "" : "disabled"}
                `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/pesajes"}>
                    <Pesaje size={"size-8"} margenes=""></Pesaje>

                    <span class="px-3">Pesajes</span>
                </a>
            {:else}
                <div class={classtext}>
                    <Pesaje size={"size-8"} margenes=""></Pesaje>
                    <span class="px-3">Pesajes</span>
                </div>
            {/if}
        </li>
        <!--Observaciones-->
        <li
            transition:slide
            class={`
                        border-b border-gray-700 
                        ${cab.exist ? "" : "disabled"}
                    `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/observaciones"}>
                    <Observacion size="size-8" margenes=""></Observacion>

                    <span class="px-3">Observaciones</span>
                </a>
            {:else}
                <div class={classtext}>
                    <Observacion size="size-8" margenes=""></Observacion>

                    <span class="px-3">Observaciones</span>
                </div>
            {/if}
        </li>
    {/if}
    <!--Datos-->
    <li
        class={`
                    mt-0                     
                `}
    >
        <button onclick={toggleDatos}>
            <span
                class="flex items-start text-lg font-bold text-[#115642] dark:text-green-500"
            >
                Datos y estadísticas
            </span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class={`h-5 w-5 transition-transform duration-300 ${datosOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button>
    </li>
    <!--Reportes-->
    {#if datosOpen}
        <li
            transition:slide
            class={` 
                        ${cab.exist ? "" : "disabled"}
                    `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/reportes"}>
                    <Reportes size="size-8" margenes=""></Reportes>
                    <span class="px-3">Reportes</span>
                </a>
            {:else}
                <div class={classtext}>
                    <Reportes size="size-8" margenes=""></Reportes>
                    <span class="px-3">Reportes</span>
                </div>
            {/if}
        </li>
        <!--Importar-->
        <li
            transition:slide
            class={`
                        ${cab.exist ? "" : "disabled"}
                    `}
        >
            {#if cab.exist}
                <a class={`py-0 ${classtext}`} href={pre + "/importar"}>
                    <Importar size="size-8" margenes="" />
                    <span class="px-3">Importar</span>
                </a>
            {:else}
                <div class={classtext}>
                    <Importar size="size-8" margenes="" />
                    <span class="px-3">Importar</span>
                </div>
            {/if}
        </li>
    {/if}
    <!--Falta el historial de animales-->
</ul>
