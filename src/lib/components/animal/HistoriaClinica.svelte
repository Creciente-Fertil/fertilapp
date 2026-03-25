<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import estilos from "$lib/stores/estilos";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import tiposanimal from "$lib/stores/tiposanimal";
    import categorias from "$lib/stores/categorias";
    import estados from "$lib/stores/estados";
    import { capitalize } from "$lib/stringutil/lib";
    import { getEstadoNombre } from "../estadosutils/lib";
    import Secciones from "./Secciones.svelte";
    import MultiSelect from "../MultiSelect.svelte";
    import CustomCheck from "../CustomCheck.svelte";
    import BuscadorHistorial from "./BuscadorHistorial.svelte";
    import TablaEventos from "./TablaEventos.svelte";
    let ruta = import.meta.env.VITE_RUTA;
    const pb = new PocketBase(ruta);
    let { caravana = "" } = $props();

    let id = $state("");
    let todos = $state([]);
    let historial = $state([]);
    let inseminaciones = $state([]);
    let tactos = $state([]);
    let tratamientos = $state([]);
    let observaciones = $state([]);
    let pariciones = $state([]);
    let pesajes = $state([]);
    let servicios = $state([]);
    let historialeventos = $state([]);

    let fechadesde = $state("");
    let fechahasta = $state("");

    let contodos = $state(true);
    let contactos = $state(true);
    let coninse = $state(true);
    let conser = $state(true);
    let conobser = $state(true);
    let contrata = $state(true);
    let conpari = $state(true);

    async function getHistorial() {
        historial = await pb.collection("historialanimales").getFullList({
            filter: `animal='${id}'`,
            sort: "-created",
        });
    }
    async function getServicios() {
        inseminaciones = await pb.collection("servicios").getFullList({
            filter: `madre='${id}'`,
            sort: "-fechadesde",
        });
    }
    async function getInseminaciones() {
        inseminaciones = await pb.collection("inseminacion").getFullList({
            filter: `animal='${id}'`,
            sort: "-fechainseminacion",
        });
    }
    async function getObservaciones() {
        observaciones = await pb.collection("observaciones").getFullList({
            filter: `animal='${id}'`,
            sort: "-created",
        });
    }
    async function getPesajes() {
        pesajes = await pb.collection("pesaje").getFullList({
            filter: `animal='${id}'`,
            sort: "-fecha",
        });
    }
    async function getTratamientos() {
        tratamientos = await pb.collection("tratamientos").getFullList({
            filter: `animal='${id}'`,
            sort: "-fecha",
            expand: "tipo",
        });
    }
    async function getTactos() {
        tactos = await pb.collection("tactos").getFullList({
            filter: `animal='${id}'`,
            sort: "-fecha",
        });
    }
    async function getPariciones() {
        pariciones = await pb.collection("nacimientos").getFullList({
            filter: `madre='${id}'`,
            sort: "-fecha",
        });
    }
    function filterHistorial(fila) {
        if (!contodos && !coninse && fila.coleccion == "inse") {
            return false;
        }
        if (!contodos && !conser && fila.coleccion == "ser") {
            return false;
        }
        if (!contodos && !conpari && fila.coleccion == "pari") {
            return false;
        }
        if (!contodos && !conobser && fila.coleccion == "obser") {
            return false;
        }
        if (!contodos && !contactos && fila.coleccion == "tacto") {
            return false;
        }
        if (!contodos && !contrata && fila.coleccion == "trata") {
            return false;
        }

        return true;
    }
    function getHistorialEventos(
        inseminaciones,
        pariciones,
        tactos,
        tratamientos,
        observaciones,
        pesajes,
    ) {
        todos = [];
        if (inseminaciones.length != 0) {
            todos = todos.concat(
                inseminaciones.map((i) => {
                    return {
                        id: i.id,
                        fecha: i.fechainseminacion,
                        nombre: "Inseminación",
                        info:
                            i.observacion.length > 0
                                ? i.observacion
                                : "Sin observación",
                        //caravana: historial[0].caravana,
                        coleccion: "inse",
                    };
                }),
            );
            //historialeventos.push(inseminaciones)
        }
        if (servicios.length != 0) {
            todos = todos.concat(
                servicios.map((i) => {
                    return {
                        id: i.id,
                        fecha: i.fecha,
                        nombre: "Servicio",
                        info:
                            i.observacion.length > 0
                                ? i.observacion
                                : "Sin observación",
                        //caravana: historial[0].caravana,
                        coleccion: "ser",
                    };
                }),
            );
            //historialeventos.push(inseminaciones)
        }
        if (pariciones.length != 0) {
            todos = todos.concat(
                pariciones.map((i) => {
                    return {
                        id: i.id,
                        fecha: i.fecha,
                        nombre: "Parición",
                        info:
                            i.observacion.length > 0
                                ? i.observacion
                                : "Sin observación",
                        //caravana: historial[0].caravana,
                        coleccion: "pari",
                    };
                }),
            );
            //historialeventos.push(pariciones)
        }
        if (tactos.length != 0) {
            todos = todos.concat(
                tactos.map((i) => {
                    return {
                        id: i.id,
                        fecha: i.fecha,
                        nombre: "Tacto",
                        info: `Estado <b>${getEstadoNombre(i.prenada)}</b> ${i.observacion.length > 0 ? " : " + i.observacion : ""}`,
                        //caravana: historial[0].caravana,
                        coleccion: "tacto",
                    };
                }),
            );
        }
        if (tratamientos.length != 0) {
            todos = todos.concat(
                tratamientos.map((i) => {
                    return {
                        id: i.id,
                        fecha: i.fecha,
                        nombre: "Tratamiento",
                        info: `Tratamiento <b>${i.expand.tipo.nombre}</b> ${i.observacion.length > 0 ? " : " + i.observacion : ""} `,
                        //caravana: historial[0].caravana,
                        coleccion: "trata",
                    };
                }),
            );
        }
        if (observaciones.length != 0) {
            todos = todos.concat(
                observaciones.map((i) => {
                    return {
                        id: i.id,
                        fecha: i.fecha,
                        nombre: "Observación",
                        info: i.observacion,
                        //caravana: historial[0].caravana,
                        coleccion: "obser",
                    };
                }),
            );
        }
        //if (pesajes.length != 0) {
        //    historialeventos = historialeventos.concat(pesajes.map(i=>{
        //        return{
        //            fecha:i.fecha,
        //            nombre:"Pesaje",
        //            info: i.pesonuevo,
        //            caravana: historial[0].caravana
        //        }
        //    }))
        //}
        todos.sort((h1, h2) =>
            new Date(h1.fecha) < new Date(h2.fecha) ? 1 : -1,
        );
        historialeventos = todos.filter(filterHistorial);
    }
    function onClickBuscador(customcheck = "") {
        if (customcheck == "todos") {
            if (!contodos) {
                coninse = true;
                conser = true;
                conpari = true;
                conobser = true;
                contrata = true;
                contactos = true;
            }
        }

        if (contodos && coninse) {
            contodos = false;
        }
        if (contodos && conser) {
            contodos = false;
        }
        if (contodos && conpari) {
            contodos = false;
        }
        if (contodos && conobser) {
            contodos = false;
        }
        if (contodos && contactos) {
            contodos = false;
        }
        if (contodos && contrata) {
            contodos = false;
        }
    }
    function changeCampo() {
        
        historialeventos = todos.filter(filterHistorial);
    }
    function filterUpdate() {
        changeCampo();
        if (fechadesde != "") {
            historialeventos = historialeventos.filter(
                (e) => new Date(e.fecha) > new Date(fechadesde),
            );
        }
        if (fechahasta != "") {
            historialeventos = historialeventos.filter(
                (e) => new Date(e.fecha) < new Date(fechahasta),
            );
        }
    }
    function clickOpcion(p_var) {
        if (p_var == "inse") {
            coninse = !coninse;
            if (!coninse) {
                valores = valores.filter((v) => v != p_var);
            } else {
                valores.push(p_var);
            }
        }
        if (p_var == "ser") {
            conser = !conser;
            if (!conser) {
                valores = valores.filter((v) => v != p_var);
            } else {
                valores.push(p_var);
            }
        }
        if (p_var == "pari") {
            conpari = !conpari;
            if (!conpari) {
                valores = valores.filter((v) => v != p_var);
            } else {
                valores.push(p_var);
            }
        }
        if (p_var == "obser") {
            conobser = !conobser;
            if (!conobser) {
                valores = valores.filter((v) => v != p_var);
            } else {
                valores.push(p_var);
            }
        }
        if (p_var == "tacto") {
            contactos = !contactos;
            if (!contactos) {
                valores = valores.filter((v) => v != p_var);
            } else {
                valores.push(p_var);
            }
        }
        if (p_var == "trata") {
            contrata = !contrata;
            if (!contrata) {
                valores = valores.filter((v) => v != p_var);
            } else {
                valores.push(p_var);
            }
        }
        changeCampo();
    }
    function getNombre(p_var) {
        if (p_var == "inse") {
            return "Inseminación";
        }
        if (p_var == "ser") {
            return "Servicio";
        }
        if (p_var == "pari") {
            return "Parición";
        }
        if (p_var == "obser") {
            return "Observación";
        }
        if (p_var == "tacto") {
            return "Tacto";
        }
        if (p_var == "trata") {
            return "Tratmiento";
        }
    }
    let isOpen = $state(false);
    let valores = $state(["inse", "ser", "pari", "obser", "tacto", "trata"]);
    let opciones = [
        { id: "inse", nombre: "Inseminación" },
        { id: "ser", nombre: "Servicio" },
        { id: "pari", nombre: "Parición" },
        { id: "obser", nombre: "Observación" },
        { id: "tacto", nombre: "Tacto" },
        { id: "trata", nombre: "Tratamiento" },
    ];

    function prepararData(item) {
        return {
            FECHA: item.fecha ? new Date(item.fecha).toLocaleDateString() : "",
            CARAVANA: item.caravana,
            EVENTO: item.nombre,
            INFO: item.info,
        };
    }

    onMount(async () => {
        id = $page.params.slug;
        //await getHistorial()
        await getInseminaciones();
        await getTactos();
        await getTratamientos();
        await getObservaciones();
        //await getPesajes()
        await getPariciones();
        await getServicios();
        getHistorialEventos(
            inseminaciones,
            pariciones,
            tactos,
            tratamientos,
            observaciones,
            pesajes,
        );
    });
</script>

<div class="hidden">
    <MultiSelect
        {opciones}
        etiqueta={"Tipos"}
        bind:valores
        clickOption={clickOpcion}
    />
    <Secciones
        bind:contactos
        bind:coninse
        bind:conser
        bind:conobser
        bind:contrata
        bind:conpari
        {changeCampo}
    />
</div>
<BuscadorHistorial
    bind:fechadesde
    bind:fechahasta
    bind:contodos
    bind:contactos
    bind:coninse
    bind:conser
    bind:conobser
    bind:contrata
    bind:conpari
    {changeCampo}
    {filterUpdate}
    onclick={onClickBuscador}
    data={historialeventos}
    {caravana}
/>
<!--Tabla-->
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
        <TablaEventos data={historialeventos} />
    </div>
</div>
<div class="hidden w-full justify-items-center mx-1 lg:w-3/4 overflow-x-auto">
    {#if historialeventos.length == 0}
        <p class="mt-5 text-lg">No se encontraron eventos asociados</p>
    {:else}
        <table class="table table-lg">
            <thead>
                <tr>
                    <th class="text-base mx-1 px-1">Fecha</th>
                    <th class="text-base mx-1 px-1">Evento</th>
                    <th class="text-base mx-1 px-1">Informacion</th>
                </tr>
            </thead>
            <tbody>
                {#each historialeventos as h}
                    <tr>
                        <td class="text-base">
                            {new Date(h.fecha).toLocaleDateString()}
                        </td>
                        <td class="text-base">
                            {h.nombre}
                        </td>
                        <td class="text-base">
                            {h.info}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
    <div class="hidden">
        <Exportar
            titulo={"Historia clinica"}
            filtros={[]}
            confiltros={false}
            data={historialeventos}
            {prepararData}
        />
    </div>
</div>

<div class="block md:hidden justify-items-center mx-1">
    {#if historialeventos.length == 0}
        <p class="mt-5 text-lg">No se encontraron eventos asociados</p>
    {:else}
        {#each historialeventos as h}
            <div
                class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
            >
                <div class="block p-4">
                    <div class="grid grid-cols-1 gap-y-2">
                        <div class="flex items-start">
                            <span>Fecha:</span>
                            <span class="font-semibold">
                                {new Date(h.fecha).toLocaleDateString()}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Evento:</span>
                            <span class="font-semibold">
                                {h.nombre}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Información:</span>
                            <span class="font-semibold">
                                {h.info}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    {/if}
</div>
