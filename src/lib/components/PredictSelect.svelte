<script>
    import estilos from "$lib/stores/estilos";

    import { onDestroy, onMount } from "svelte";

    let {
        edit = true,
        lista = $bindable([]),
        etiqueta,
        valor = $bindable(""),
        cadena = $bindable(""),
        cambiar = () => {},
        onelegir = (valor) => {},
        onwrite = () => {},
        validarAnimal = () => {},
        px = "px-2",
        py = "py-2",
        size = "w-4/5",
        campo = "nombre",
        etiquetaDefault = true,
        flotante = true,
        margintop="mt-1",
        children,
    } = $props();

    let containerPredict = $state(null);

    let listarow = $derived(
        lista.filter((e) =>
            e[campo].toLowerCase().includes(cadena.toLowerCase()),
        ),
    );
    let isOpen = $state(false);
    let inputWidth = $state("0px");
    let inputRef = $state(null);
    let nombre = $state("");

    function clickOption(id) {
        valor = id;
        if (onelegir) {
            onelegir(valor);
        }

        isOpen = !isOpen;
        cadena = listarow.filter((l) => l.id == id)[0][campo];
        nombre = cadena;
        if (validarAnimal) {
            validarAnimal();
        }
        cambiar();
    }
    //si me arrepiento
    //$effect(()=>{
    //    if(valor.length !=0){
    //        cadena = listarow.filter(l=>l.id==valor)[0].nombre
    //        nombre = cadena
    //    }
    //})
    function handleClickOutside(e) {
        if (containerPredict && !containerPredict.contains(e.target)) {
            isOpen = false;
        }
    }
    function onChangeCadena() {
        if (!isOpen) {
            isOpen = true;
        }
        cambiar();
    }
    onDestroy(() => {
        document.removeEventListener("click", handleClickOutside);
    });
    onMount(() => {
        document.addEventListener("click", handleClickOutside);

        if (valor.length != 0) {
            let idx_valor = listarow.findIndex((v) => v.id == valor);
            if (idx_valor != -1) {
                let fila = listarow[idx_valor];
                cadena = fila[campo];

                nombre = cadena;
            }
        }
    });
    // Función para actualizar el ancho
    function updateWidth() {
        if (inputRef) {
            inputWidth = `${inputRef.offsetWidth}px`;
        }
    }

    // En Svelte 5, usamos $effect para reaccionar cuando se abre
    $effect(() => {
        if (isOpen) {
            // Pequeño timeout para asegurar que el DOM del botón está listo si acaba de renderizarse
            setTimeout(() => updateWidth(), 0);
        }
    });
</script>

{#if etiquetaDefault}
    <label for="" class="label my-0 py-0">
        <span class="label-text text-base">{etiqueta} </span>
    </label>
{:else}
    {@render children()}
{/if}
<div class={`w-full ${px} ${py}`} bind:this={containerPredict}>
    {#if edit}
        <div
            class={`
                relative
                ${margintop}
            `}
        >
            <input
                bind:this={inputRef}
                type="text"
                class={`
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 
                    focus:ring-green-500 focus:border-green-500
                    w-full
                    pr-10
                    mb-0
                    ${estilos.bgdark2} 
                `}
                oninput={onChangeCadena}
                onclick={() => {
                    isOpen = !isOpen;
                    if (!isOpen) updateWidth();
                }}
                bind:value={cadena}
            />

            <!-- Flechita a la derecha -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class={`
                    absolute right-3 top-1/2 -translate-y-1/2
                    w-5 h-5 text-gray-400 
                    transition-transform duration-150 
                    ${isOpen ? "rotate-180" : ""}
                `}
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                />
            </svg>
        </div>
        {#if isOpen}
            <div
                style="width: {inputWidth}"
                class={`
                    ${flotante ? "absolute" : "relative"}
                    mt-0  z-10 max-h-40 overflow-auto w-full`}
            >
                {#if listarow.length == 0}
                    <div
                        class={`
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            w-full
                            mb-0
                            bg-white
                            ${estilos.bgdark2} 
                        `}
                    >
                        <button
                            class={`
                                text-start w-full 
                                relative py-2 pl-3 
                                select-none pr-9 
                                hover:bg-green-100 hover:text-green-800 dark:hover:text-green-800 dark:text-white
                            `}
                        >
                            <span
                                class={`
                                    block
                                    truncate
                                    font-normal
                                `}
                            >
                                No hay coincidencias
                            </span>
                        </button>
                    </div>
                {:else}
                    <div
                        class={`
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            w-full
                            mb-0
                            bg-white
                            ${estilos.bgdark2} 
                        `}
                    >
                        {#each listarow as v}
                            <button
                                class={`
                                    text-start w-full 
                                    relative py-2 pl-3 
                                    select-none pr-9 bg-transparent
                                    hover:bg-green-100 hover:text-green-800 dark:hover:text-green-800 dark:text-white
                                `}
                                onclick={() => clickOption(v.id)}
                            >
                                <span
                                    class={`
                                        block
                                        truncate
                                        font-normal
                                    `}
                                >
                                    {v[campo]}
                                </span>
                                {#if v.id == valor}
                                    <span
                                        class="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600"
                                    >
                                        <svg
                                            class="w-5 h-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
        {#if valor.length != 0 && nombre.length > 0}
            <span class="text-sm mt-1">Elegiste a {nombre}</span>
        {/if}
    {:else}
        <span class="text-sm mt-1 mx-1 font-normal">{cadena}</span>
    {/if}
</div>
