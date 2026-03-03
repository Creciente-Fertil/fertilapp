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
        onelegir = () => {},
        onwrite = () => {},
        validarAnimal = () => {},
        px = "px-2",
        py = "py-2",
        size = "w-4/5",
        campo = "nombre",
        etiquetaDefault = true,
        
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
            cadena = listarow.filter((l) => l.id == valor)[0][campo];
            nombre = cadena;
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
        <input
            bind:this={inputRef}
            type="text"
            class={`
            input 
            input-bordered 
            border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
            w-full
            mb-0
            
            ${estilos.bgdark2} 
        `}
            oninput={onChangeCadena}
            onclick={() => {
                isOpen = !isOpen;
                if (!isOpen) updateWidth(); // Asegurar ancho al abrir
            }}
            bind:value={cadena}
        />
        {#if isOpen}
            <div
                style="width: {inputWidth}"
                class={`
                mt-0 absolute z-10 max-h-40 overflow-auto w-full`}
            >
                {#if listarow.length == 0}
                    <div
                        class={`
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        mb-0
                        ${estilos.bgdark2} 
                    `}
                    >
                        <button
                            class={`
                                text-start w-full 
                                relative py-2 pl-3 
                                select-none pr-9 bg-transparent
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
        {#if valor.length != 0}
            <span class="text-sm mt-1">Elegiste a {nombre}</span>
        {/if}
    {:else}
        <span class="text-sm mt-1 mx-1 font-normal">{nombre}</span>
    {/if}
</div>
