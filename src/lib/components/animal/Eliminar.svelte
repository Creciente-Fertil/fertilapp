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
        bajar,
        eliminar,

        fechafallecimiento = $bindable(""),
        motivo = $bindable("fallecimiento"),
    } = $props();
    let ruta = import.meta.env.VITE_RUTA;
    const pb = new PocketBase(ruta);
    let nombredel = $state("");
    let nombretrans = $state("");
    let buscar = $state("");

    let id = $state("");

    function darBaja() {
        if (fechafallecimiento != "") {
            Swal.fire({
                title: "Dar de baja",
                text: "¿Seguro que deseas dar de baja al animal?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: "No",
            }).then((result) => {
                if (result.value) {
                    bajar(fechafallecimiento, motivo);
                }
            });
        }
    }
    function del() {
        Swal.fire({
            title: "Eliminar animal",
            text: "¿Seguro que deseas eliminar al animal, los datos relacionados se podrían perder?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then((result) => {
            if (result.value) {
                eliminar();
            }
        });
    }

    onMount(async () => {
        id = $page.params.slug;
    });
    function incluyeMotivo(p_motivo){
        let idx_motivo = motivos.findIndex(m =>m.id == p_motivo)
        return idx_motivo != -1
    }
</script>

<div class="p-2">
    <div class="w-full overflow-hidden">
        
        <div class="p-3 space-y-6">
            <div class="grid grid-cols-1">
                <div>
                    <h3 class="text-xl mx-1 font-bold mb-2 text-left mt-2">
                        Dar de baja
                    </h3>
                </div>
                <div class="flex flex-col space-y-4 mx-1">
                    <!-- Fecha arriba -->
                    <div>
                        <label
                            class="block uppercase tracking-wide text-xs font-bold mb-2"
                            for="fechadesde"
                        >
                            Fecha
                        </label>
                        <input
                            id="fechadesde"
                            type="date"
                            class={`
                                input input-bordered
                                w-full
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechafallecimiento}
                        />
                    </div>

                    <!-- Motivo en el medio -->
                    <div>
                        <label for="motivo" class="label">
                            <span class="label-text text-base font-bold"
                                >Motivo</span
                            >
                        </label>
                        <select
                            id="motivo"
                            class={`
                                select select-bordered w-full
                                border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 
                                focus:ring-green-500 
                                focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                            bind:value={motivo}
                        >
                            {#each motivos as m}
                                <option value={m.id}>{m.nombre}</option>
                            {/each}
                            {#if !incluyeMotivo(motivo)}
                                <option value={motivo}>{motivo}</option>
                            {/if}
                        </select>
                    </div>

                    <!-- Botón confirmar abajo -->
                    <div class="flex justify-end">
                        <button
                            aria-label="confirmar baja"
                            onclick={darBaja}
                            disabled={fechafallecimiento == ""}
                            class="mt-2 px-10 py-2 bg-[#A94442] text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-base" 
                        >
                            <span>Confirmar</span>
                            
                        </button>
                    </div>
                </div>
            </div>
            
            <hr class="border-green-400 dark:border-green-300" />
            <div class="">
                <h3 class="text-xl mx-1 font-bold mb-2 text-left mt-2">
                    Eliminar
                </h3>
            </div>
            <div class="">
                <div class="flex justify-end">
                    <button
                        aria-label="Eliminar"
                        onclick={del}
                        class="mt-2 px-10 py-2 bg-[#A94442] text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-base" 
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
