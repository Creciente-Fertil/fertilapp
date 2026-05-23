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
    import { getAllAnimal } from "$lib/java/movimientos/movimientosback";
    import ListaMovimiento from "./ListaMovimiento.svelte";
    

    let {
        caravana = "",
        animal = {},
        cab = { id: "" },
        versionjava = false,
        lotes = [],
        rodeos = []
    } = $props();

    let ruta = import.meta.env.VITE_RUTA;
    const pb = new PocketBase(ruta);
    let id = $state("");
    let historial = $state([]);

    let filas = $state([]);
    let filasfiltradas = $state([]);
    let fechadesde = $state("");
    let fechahasta = $state("");
    let descendente = $state(true);
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
    function crearInfo(desde = "", hasta = "") {
        let html = `
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
            </span>`;
        return html;
    }
    function ordenarFecha() {
        filterUpdate();
        descendente = !descendente;

        filasfiltradas.sort((m1, m2) => {
            let f1 = new Date(m1.fecha);
            let f2 = new Date(m2.fecha);
            return descendente ? (f1 > f2 ? -1 : 1) : f1 > f2 ? 1 : -1;
        });
    }
    function getNombreRodeo(id){
        if(id){
            let idx = rodeos.findIndex(item=>item.id==id)

            if(idx != -1){

                return rodeos[idx].nombre
            }
            else{
                return "Sin rodeo"
            }
        }   
        else{
            return "Sin rodeo"
        }
    }
    function getNombreLote(id){
        
        if(id){
            let idx = lotes.findIndex(item=>item.id==id)


            if(idx != -1){

                return lotes[idx].nombre
            }
            else{
               return "Sin lote" 
            }
        }   
        else{
            return "Sin lote"
        }
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
                let desde = "";
                let hasta = "";
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
                info = crearInfo(desde, hasta);
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
                let desde = "";
                let hasta = "";
                if (h_o.lote.length > 0) {
                    desde = " " + h_o.expand.lote.nombre;
                } else {
                    desde = "Sin lote";
                }
                if (h_f.lote.length > 0) {
                    hasta += " &rarr; " + h_f.expand.lote.nombre;
                } else {
                    hasta += " ⇒ " + " Sin lote";
                }
                info = crearInfo(desde, hasta);
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
                let desde = "";
                let hasta = "";
                if (h_o.categoria.length > 0) {
                    desde = "" + capitalize(h_o.categoria);
                } else {
                    desde = "Sin categoria";
                }
                if (h_f.categoria.length > 0) {
                    hasta += " ⇒ " + capitalize(h_f.categoria);
                } else {
                    hasta += " ⇒ " + " Sin categoria";
                }
                info = crearInfo(desde, hasta);
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
    function processMove(fila) {

        if (fila.tipo == "LOT") {
            let id = fila.id;
            let fecha = fila.fecha;
            let info = "";
            let desde = "";
            let hasta = "";
            if (fila.fromLotId) {
                desde = " " + getNombreLote(fila.fromLotId);
            } else {
                desde = "Sin lote";
            }
            if (fila.toLotId) {
                hasta += " &rarr; " + getNombreLote(fila.toLotId);
            } else {
                hasta += " ⇒ " + " Sin lote";
            }
            info = crearInfo(desde, hasta);
            let move = {
                id: id + "lote" + fecha,
                fecha,
                caravana,
                nombre: "Lote",
                coleccion: "lote",
                info,
            };
            return move;
        } else if (fila.tipo == "HERD") {
            let id = fila.id;
            let fecha = fila.fecha;
            let info = "";
            let desde = "";
            let hasta = "";
            if (fila.fromHerdId) {
                desde = " " + getNombreRodeo(fila.fromHerdId);
            } else {
                desde = "Sin lote";
            }
            if (fila.toHerdId) {
                hasta += " &rarr; " + getNombreRodeo(fila.toHerdId);
            } else {
                hasta += " ⇒ " + " Sin lote";
            }
            info = crearInfo(desde, hasta);
            let move = {
                id: id + "rodeo" + fecha,
                fecha,
                caravana,
                nombre: "Rodeo",
                coleccion: "rodeo",
                info,
            };
            return move;
        }
    }
    function processMoves(data) {
        let data_moves = [];
        data.forEach((item) => {
            data_moves.push(processMove(item));
        });

        return data_moves;
    }
    async function getData() {
        if (versionjava) {
            filas = []
            let data = await getAllAnimal(id, cab.id);
            
            filas = processMoves(data);
            filasfiltradas = filas
            
        } else {
            await getHistorial();
            procesarHistorial();
        }
    }
    onMount(async () => {
        id = $page.params.slug;

        await getData();
        
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
    {#if filasfiltradas.length == 0}
        <p class="mt-5 text-lg">No hay movimientos</p>
    {:else}
        <div
            class={`
                overflow-hidden rounded-xl
                border dark:border-gray-700

            `}
        >
            <TablaMovimiento data={filasfiltradas} {ordenarFecha} />
        </div>
    {/if}
</div>
<div
    class="block w-full md:hidden justify-items-center"
>
    {#if filasfiltradas.length == 0}
        <p class="mt-5 text-lg">No hay movimientos</p>
    {:else}
        <ListaMovimiento data={filasfiltradas} {ordenarFecha}/>
    {/if}
</div>
