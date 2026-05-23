<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import estilos from "$lib/stores/estilos";
    import PocketBase from "pocketbase";
    import { isEmpty } from "$lib/stringutil/lib";
    import Chart from "chart.js/auto";
    import { guardarHistorial } from "$lib/historial/lib";
    import Swal from "sweetalert2";
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import BuscadorPesajes from "./BuscadorPesajes.svelte";
    import TablaPesajes from "./TablaPesajes.svelte";
    import { getAll, getAllAnimal } from "$lib/java/pesajes/pesajesback";
    import ListaPesajes from "./ListaPesajes.svelte";

    let ruta = import.meta.env.VITE_RUTA;
    const HOY = new Date().toISOString().split("T")[0];
    const pb = new PocketBase(ruta);
    let {
        pesoanterior,
        caravana,
        peso = $bindable(""),
        userpermisos = $bindable([]),
        cab = { id: "" },
        versionjava = false,
        //nuevo peso
        openNewModal=()=>{},
        //Detalle
        pesajes = $bindable([]),
        openDetalle=(id)=>{},
        //chart
        createChart =()=>{},
        xs=$bindable([]),
        ys=$bindable([]),
        evolucion=()=>{}
    } = $props();

    let id = $state("");
    //Pesajes
    //let pesajes = $state([]);
    let fecha = $state("");
    let pesonuevo = $state("");
    let fechadesde = $state("");
    let fechahasta = $state("");

    //detalle
    let fechaedit = $state("");
    let pesonuevoedit = $state("");
    let pesoanterioredit = $state("");
    let idpesaje = $state("");
    //Validaciones
    let malfecha = $state(false);
    let malpeso = $state(false);
    let botonhabilitado = $state(false);

    //chart js
    let ctx;
    let canvas;
    let chart;
    async function guardarPesaje() {
        //ife (!userpermisos[4]) {
        //    nuevoPesaje.close();
        //    Swal.fire("Error permisos", getPermisosMessage(4), "error");
        //    return;
        //}
        let data = {
            fecha: fecha + " 03:00:00",
            animal: id,
            pesoanterior,
            pesonuevo,
        };
        let dataupdate = {
            peso: pesonuevo,
        };
        try {
            await guardarHistorial(pb, id);
            await pb.collection("pesaje").create(data);
            await pb.collection("animales").update(id, dataupdate);

            await getPesajes();

            peso = pesonuevo;
            Swal.fire("Éxito guardar", "Se logró guardar el pesaje", "success");
            nuevoPesaje.close();
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error guardar",
                "No se logró guardar el pesaje",
                "error",
            );
            nuevoPesaje.close();
        }
    }
    async function getPesajes() {
        if (versionjava) {
            
            pesajes = await getAllAnimal(id, cab.id);
            
            
        } else {
            pesajes = await pb.collection("pesaje").getFullList({
                filter: `animal='${id}'`,
                sort: "-fecha",
                expand: "animal",
            });
        }

        if (pesajes.length != 0) {
            xs = [];
            ys = [];
            if (!versionjava) {
                xs.push(pesajes[0].expand.animal.created);
                ys.push(pesajes[0].pesoanterior);
            }

            for (let i = 0; i < pesajes.length; i++) {
                xs.push(pesajes[i].fecha);
                ys.push(pesajes[i].pesonuevo);
            }
            let list = [];
            for (let j = 0; j < xs.length; j++)
                list.push({ x: xs[j], y: ys[j] });

            //2) sort:
            list.sort(function (a, b) {
                return new Date(a.x) < new Date(b.x) ? -1 : 1;
                //Sort could be modified to, for example, sort on the age
                // if the name is the same. See Bonus section below
            });

            //3) separate them back out:
            for (var k = 0; k < list.length; k++) {
                xs[k] = list[k].x;
                ys[k] = list[k].y;
            }

            createChart();
        }
    }

    //function openNewModal() {
    //    malfecha = false;
    //    malpeso = false;
    //    botonhabilitado = false;
    //    pesonuevo = "";
    //    fecha = "";
    //    nuevoPesaje2.showModal();
    //}
    //function openDetalle(id) {
    //    idpesaje = id;
    //    let pesaje = pesajes.filter((p) => p.id == idpesaje)[0];
    //    fechaedit = pesaje.fecha.split(" ")[0];
    //    pesoanterioredit = pesaje.pesoanterior;
    //    pesonuevoedit = pesaje.pesonuevo;
    //    detallePesaje.showModal();
    //}
    async function eliminar() {
        try {
            await pb.collection("pesaje").delete(idpesaje);
            await getPesajes();
            filterUpdate();
            detallePesaje.close();
            Swal.fire(
                "Éxito eliminar",
                "Se pudo eliminar el pesaje",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error eliminar",
                "No se pudo eliminar el pesaje",
                "error",
            );
            detallePesaje.close();
        }
    }
    onMount(async () => {
        id = $page.params.slug;
        await getPesajes();
    });
    function validarBoton() {
        botonhabilitado = true;
        if (isEmpty(pesonuevo)) {
            botonhabilitado = false;
        }
        if (isEmpty(fecha)) {
            botonhabilitado = false;
        }
    }
    function onchange(campo) {
        validarBoton();
        if (campo == "FECHA") {
            if (isEmpty(fecha)) {
                malfecha = true;
            } else {
                malfecha = false;
            }
        }
        if (campo == "PESO") {
            if (isEmpty(pesonuevo)) {
                malpeso = true;
            } else {
                pesonuevo = Math.max(0, pesonuevo);
                malpeso = false;
            }
        }
    }
    function filterUpdate() {}
</script>

<div class="w-full flex justify-items-start gap-2">
    <BuscadorPesajes
        data={pesajes}
        {caravana}
        bind:fechadesde
        bind:fechahasta
        {filterUpdate}
        nuevo={openNewModal}
        {evolucion}
    />
</div>
<div
    class={`
                w-full 
                mx-auto py-1 px-4 
            `}
>
    {#if pesajes.length == 0}
        <p class="mt-5 text-lg flex text-center">No hay pesajes</p>
    {:else}
        <div
            class={`
                overflow-hidden rounded-xl
                md:border md:dark:border-gray-700

            `}
        >
            <div class="hidden md:block">
                <TablaPesajes pesajesrows={pesajes} {openDetalle} />
            </div>
            <div class="md:hidden">
                <ListaPesajes pesajesrows={pesajes} {openDetalle} />
            </div>
        </div>
    {/if}
</div>

<dialog
    id="nuevoPesaje2"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box w-11/12 max-w-10xl
            bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-lg font-bold">Nuevo pesaje - {caravana}</h3>
        <div class="form-control">
            <label for="fecha" class="label">
                <span class="label-text text-base">Fecha </span>
            </label>
            <label class="input-group">
                <input
                    id="fecha"
                    type="date"
                    max={HOY}
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={fecha}
                    onchange={() => onchange("FECHA")}
                />
                {#if malfecha}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar la fecha del pesaje</span
                        >
                    </div>
                {/if}
            </label>
            <div class="label">
                <span class="label-text">Peso anterior</span>
            </div>
            <input
                id="pesoanterior"
                type="number"
                disabled
                class={`
                    disabled
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    w-full
                    ${estilos.bgdark2}
                `}
                bind:value={pesoanterior}
            />
            <div class="label">
                <span class="label-text">Peso nuevo</span>
            </div>
            <input
                id="pesonuevo"
                type="number"
                class={`
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    w-full
                    ${estilos.bgdark2}
                `}
                bind:value={pesonuevo}
                oninput={() => onchange("PESO")}
            />
            {#if malpeso}
                <div class="label">
                    <span class="label-text-alt text-red-500"
                        >Debe escribir el peso</span
                    >
                </div>
            {/if}
        </div>
        <div class="modal-action justify-start">
            <button
                class="btn btn-success text-white"
                disabled={!botonhabilitado}
                onclick={guardarPesaje}>Guardar</button
            >
            <button
                class="btn btn-error text-white"
                onclick={() => nuevoPesaje.close()}>Cancelar</button
            >
        </div>
    </div>
</dialog>
<dialog
    id="chartpesaje"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl"
>
    <div
        class="
            modal-box max-w-5xl
            bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-lg font-bold">Evolucion pesaje</h3>
        <div class="chart-container justify-items-center">
            <canvas class="" bind:this={canvas}> </canvas>
        </div>

        <div class="modal-action justify-start">
            <button
                class="btn btn-error text-white"
                onclick={() => chartpesaje.close()}>Cerrar</button
            >
        </div>
    </div>
</dialog>
<dialog
    id="detallePesaje"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
        modal-box w-11/12 max-w-xl
        bg-gradient-to-br from-white to-gray-100
        dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-lg font-bold">Ver pesaje</h3>
        <div class="form-control">
            <div class="grid grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
                <div class="mb-1 lg:mb-0">
                    <label for="caravana" class="label">
                        <span class="label-text text-base">Caravana</span>
                    </label>
                    <label
                        for="caravana"
                        class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                    >
                        {caravana}
                    </label>
                </div>
                <div class="mb-1 lg:mb-0">
                    <label for="caravana" class="label">
                        <span class="label-text text-base">Fecha</span>
                    </label>
                    <label
                        for="caravana"
                        class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                    >
                        {fechaedit}
                    </label>
                </div>
                <div class="mb-1 lg:mb-0">
                    <label for="pesoanterior" class="label">
                        <span class="label-text text-base"
                            >Peso anterior(KG)</span
                        >
                    </label>
                    <label
                        for="pesoanterior"
                        class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                    >
                        {pesoanterioredit}
                    </label>
                </div>
                <div class="mb-1 lg:mb-0">
                    <label for="pesonuevo" class="label">
                        <span class="label-text text-base">Peso nuevo(KG)</span>
                    </label>
                    <label
                        for="pesonuevo"
                        class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                    >
                        {pesonuevoedit}
                    </label>
                </div>
            </div>
        </div>
        <div class="modal-action justify-start">
            <button class="btn btn-error text-white" onclick={eliminar}
                >Eliminar</button
            >
            <button
                class={`
                    btn 
                    bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                    ${estilos.btnsecondary}`}
                onclick={() => detallePesaje.close()}>Cerrar</button
            >
        </div>
    </div>
</dialog>

<style>
    .chart-container {
        width: 800px;
        height: 400px;
    }
</style>
