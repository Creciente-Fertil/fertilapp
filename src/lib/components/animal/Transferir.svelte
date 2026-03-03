<script>
    import { page } from "$app/stores";
    import estilos from "$lib/stores/estilos";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import motivos from "$lib/stores/motivos";
    import { onMount } from "svelte";
    import tiponoti from "$lib/stores/tiponoti";

    let {
        caravana,

        transferir,
        codigo = $bindable(""),
        malcodigo,
        muchosrenspa,

        openModal = () => {},
        transfer = () => {},
    } = $props();
    
    
</script>

<div class="p-2">
    <div class="w-full overflow-hidden">
        <div class="p-3 space-y-6">
            <div class="">
                <h3 class="text-xl mx-1 font-bold mb-2 text-left mt-2">
                    Transferir
                </h3>
            </div>
            <div class="flex flex-col space-y-4 mx-2">
                <div>
                    <label
                        class="block tracking-wide text-md font-bold mb-2"
                        for="renspa"
                    >
                        Renspa
                    </label>
                    <input
                        id="renspa"
                        class={`
                                input input-bordered
                                w-full
                                ${estilos.bgdark2}
                            `}
                        bind:value={codigo}
                    />
                    {#if malcodigo}
                        <div class="label">
                            <span class="label-text-alt text-red-500"
                                >No existe un establecimiento con ese renspa</span
                            >
                        </div>
                    {/if}
                    {#if muchosrenspa}
                        <div class="label">
                            <span class="label-text-alt text-red-500"
                                >Hay varios establecimientos con ese renspa</span
                            >
                        </div>
                    {/if}
                </div>
                <div class="flex justify-end">
                    <button
                        aria-label="iniciar"
                        onclick={transfer}
                        class="mt-2 px-5 py-1 md:py-2 md:px-10 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
