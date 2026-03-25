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
    let filasfiltradas = $state([]);
    let fechadesde = $state("");
    let fechahasta = $state("");
    let descendente = $state(true)
    let contodos = $state(true);
    let concate = $state(true);
    let conlote = $state(true);
    let conrodeo = $state(true);
    function filterUpdate() {
        changeCampo();
        if (fechadesde != "") {
            filasfiltradas = filasfiltradas.filter(
                (e) => new Date(e.fecha) > new Date(fechadesde),
            );
        }
        if (fechahasta != "") {
            filasfiltradas = filasfiltradas.filter(
                (e) => new Date(e.fecha) < new Date(fechahasta),
            );
        }
    }
    function onClickCustom(coleccion = "") {
        if (coleccion == "todos") {
            if (!contodos) {
                conlote = true;
                conrodeo = true;
                concate = true;
            }
        }

        if (contodos && concate) {
            contodos = false;
        }
        if (contodos && conlote) {
            contodos = false;
        }
        if (contodos && conrodeo) {
            contodos = false;
        }
    }
    function filterMovimiento(fila) {
        if (!contodos && !concate && fila.coleccion == "categoria") {
            return false;
        }
        if (!contodos && !conlote && fila.coleccion == "lote") {
            return false;
        }
        if (!contodos && !conrodeo && fila.coleccion == "rodeo") {
            return false;
        }
        return true;
    }
    function changeCampo() {
        
        filasfiltradas = filas.filter(filterMovimiento);
    }
    function crearInfo(desde="",hasta=""){
        let html =`
            <span>
                <span 
                    class="font-semibold text-gray-600 dark:text-gray-400"
                >
                    ${desde}
                </span>
                <span class="font-semibold text-[#115642] dark:text-[#24a579]" 
                >
                    ${hasta}
                </span>
            </span>`
        return html
    }
    function ordenarFecha(){
        filterUpdate()
        descendente = !descendente
     
        filasfiltradas.sort((m1,m2)=>   {
            let f1 = new Date(m1.fecha)
            let f2 = new Date(m2.fecha)
            return  descendente? f1>f2? -1:1 : f1>f2? 1:-1;
        })
        
        
    }
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
                let desde = ""
                let hasta = ""
                if (h_o.rodeo.length > 0) {
                    desde = "" + h_o.expand.rodeo.nombre;
                } else {
                    desde = "Sin rodeo";
                }
                if (h_f.rodeo.length > 0) {
                    hasta += " ⇒ " + h_f.expand.rodeo.nombre;
                } else {
                    hasta += " ⇒ " + " Sin rodeo";
                }
                info = crearInfo(desde,hasta)
                let estado = {
                    id: id + "rodeo" + fecha,
                    fecha,
                    caravana,
                    nombre: "Rodeo",
                    coleccion: "rodeo",
                    info,
                };
                filas.push(estado);
            }
            if (h_o.lote != h_f.lote) {
                let info = "";
                let desde = ""
                let hasta = ""
                if (h_o.lote.length > 0) {
                    desde = " " + h_o.expand.lote.nombre;
                } else {
                    desde = "Sin lote";
                }
                if (h_f.lote.length > 0) {
                    hasta += " &rarr; " + h_f.expand.lote.nombre;
                } else {
                    hasta += " ⇒ " +" Sin lote";
                }
                info = crearInfo(desde,hasta)
                let estado = {
                    id: id + "lote" + fecha,
                    fecha,
                    caravana,
                    nombre: "Lote",
                    coleccion: "lote",
                    info,
                };
                filas.push(estado);
            }
            if (h_o.categoria != h_f.categoria) {
                let info = "";
                let desde = ""
                let hasta = ""
                if (h_o.categoria.length > 0) {
                    desde = "" + capitalize(h_o.categoria);
                } else {
                    desde = "Sin categoria";
                }
                if (h_f.categoria.length > 0) {
                    hasta += " ⇒ " + capitalize(h_f.categoria);
                } else {
                    hasta += " ⇒ " +" Sin categoria";
                }
                info = crearInfo(desde,hasta)
                let estado = {
                    id: id + "categoria" + fecha,
                    fecha,
                    caravana,
                    nombre: "Categoria",
                    coleccion: "categoria",
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
        filterUpdate();
    });
</script>

<BuscadorMovimiento
    data={filasfiltradas}
    {caravana}
    bind:fechadesde
    bind:fechahasta
    bind:contodos
    bind:concate
    bind:conlote
    bind:conrodeo
    {filterUpdate}
    {changeCampo}
    onclick={onClickCustom}
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
            <TablaMovimiento data={filasfiltradas} {ordenarFecha}/>
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
