<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import estilos from "$lib/stores/estilos";
    import PocketBase from "pocketbase";
    import tiposanimal from "$lib/stores/tiposanimal";
    import categorias from "$lib/stores/categorias";
    import estados from "$lib/stores/estados";
    import { capitalize } from "$lib/stringutil/lib";
    import { getEstadoNombre } from "../estadosutils/lib";
    import TablaMovs from "./TablaMovs.svelte";
    import BuscadorMovimiento from "./BuscadorMovimiento.svelte";
    import TablaMovimiento from "./TablaMovimiento.svelte";

    let { caravana = "", animal = {} } = $props();

    let ruta = import.meta.env.VITE_RUTA;
    const pb = new PocketBase(ruta);
    let id = $state("");
    let historial = $state([]);
    let filas = $state([]);
    let fechadesde = $state("");
    let fechahasta = $state("");
    let contodos = $state(true);
    let concate = $state(false);
    let conlote = $state(false);
    let conrodeo = $state(false);
    function filterUpdate() {}
    function changeCampo() {}
    function procesarHistorial() {
        filas = [];
        let fecha_inicio = animal.created;
        let fecha_fin = "";
        let fecha = "";
        for (let j = 1; j < historial.length; j++) {
            let h_o = historial[j - 1];
            let h_f = historial[j];
            fecha = h_f.created;
            let id = h_f.id;
            if (h_o.rodeo != h_f.rodeo) {
                let info = "";
                if (h_o.rodeo.length > 0) {
                    info = "" + h_o.expand.rodeo.nombre;
                } else {
                    info = "Sin rodeo";
                }
                if (h_f.rodeo.length > 0) {
                    info += " -> " + h_f.expand.rodeo.nombre;
                } else {
                    info += " Sin rodeo";
                }
                let estado = {
                    id,
                    fecha,
                    caravana,
                    nombre: "Rodeo",
                    info,
                };
                filas.push(estado);
            }
            if (h_o.lote != h_f.lote) {
                let info = "";
                if (h_o.lote.length > 0) {
                    info = " " + h_o.expand.lote.nombre;
                } else {
                    info = "Sin lote";
                }
                if (h_f.lote.length > 0) {
                    info += " -> " + h_f.expand.lote.nombre;
                } else {
                    info += " Sin lote";
                }
                let estado = {
                    id,
                    fecha,
                    caravana,
                    nombre: "Lote",
                    info,
                };
                filas.push(estado);
            }
            if (h_o.categoria != h_f.categoria) {
                let info = "";
                if (h_o.categoria.length > 0) {
                    info = "" + h_o.categoria;
                } else {
                    info = "Sin rodeo";
                }
                if (h_f.categoria.length > 0) {
                    info += " -> " + h_f.categoria;
                } else {
                    info += " Sin categoria";
                }
                let estado = {
                    id,
                    fecha,
                    caravana,
                    nombre: "Categoria",
                    info,
                };
                filas.push(estado);
            }
        }
        
    }
    async function getHistorial() {
        historial = await pb.collection("historialanimales").getFullList({
            filter: `animal='${id}'`,
            sort: "-created",
            expand: "lote,rodeo",
        });
    }

    onMount(async () => {
        id = $page.params.slug;
        await getHistorial();
        procesarHistorial();
    });
</script>

<BuscadorMovimiento
    data={filas}
    {caravana}
    bind:fechadesde
    bind:fechahasta
    bind:contodos
    bind:concate
    bind:conlote
    bind:conrodeo
    {filterUpdate}
    {changeCampo}
/>
<div
    class={`
        hidden w-full md:grid
        mx-auto py-1 px-4 max-w-7xl
        
    `}
>
    <div
        class={`
                overflow-hidden rounded-xl
                border dark:border-gray-700

            `}
    >
        {#if historial.length == 0}
            <p class="mt-5 text-lg">No recibio modificaciones</p>
        {:else}
            <TablaMovimiento data={filas} />
        {/if}
    </div>
</div>
<div
    class="block w-full md:hidden justify-items-center mx-1 lg:w-3/4 overflow-x-auto"
>
    {#if historial.length == 0}
        <p class="mt-5 text-lg">No recibio modificaciones</p>
    {:else}
        {#each historial as h}
            <div
                class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
            >
                <div class="block p-4">
                    <div class="grid grid-cols-2 gap-y-2">
                        <div class="flex items-start">
                            <span>Fecha:</span>
                            <span class="font-semibold">
                                {`${new Date(h.created).toLocaleDateString()}`}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Lote:</span>
                            <span class="font-semibold">
                                {h.expand
                                    ? h.expand.lote
                                        ? h.expand.lote.nombre
                                        : ""
                                    : ""}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Rodeo:</span>
                            <span class="font-semibold">
                                {h.expand
                                    ? h.expand.rodeo
                                        ? h.expand.rodeo.nombre
                                        : ""
                                    : ""}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Categoria:</span>
                            <span class="font-semibold">
                                {capitalize(h.categoria)}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Estado:</span>
                            <span class="font-semibold">
                                {getEstadoNombre(h.prenada)}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Peso:</span>
                            <span class="font-semibold">
                                {h.peso}
                            </span>
                        </div>
                        <div class="flex items-start col-span-2">
                            <span>Nacimiento:</span>
                            <span class="font-semibold">
                                {`${h.fechanacimiento ? new Date(h.fechanacimiento).toLocaleDateString() : ""}`}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Sexo:</span>
                            <span class="font-semibold">
                                {h.sexo}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Caravana:</span>
                            <span class="font-semibold">
                                {h.caravana}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    {/if}
</div>
