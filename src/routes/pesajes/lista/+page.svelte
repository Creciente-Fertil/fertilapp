<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import UltimosPesajes from "$lib/components/pesajes/UltimosPesajes.svelte";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import { slide } from "svelte/transition";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { isEmpty } from "$lib/stringutil/lib";
    import estilos from "$lib/stores/estilos";
    import { shorterWord } from "$lib/stringutil/lib";
    import * as XLSX from "xlsx";
    import Success from "$lib/components/botones/Success.svelte";
    //FILTROS
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import { goto } from "$app/navigation";
    import HistorialPesajes from "$lib/components/pesajes/HistorialPesajes.svelte";
    import { getAll } from "$lib/java/pesajes/pesajesback";
    import { editPeso,eliminarPeso } from "$lib/java/pesajes/pesajesback";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    let caber = createCaber();
    let cab = $state(caber.cab);
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let esdev = import.meta.env.VITE_DEV == "si";
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    async function toggleJava() {
        versionjava = !versionjava;
        await getPesajes();
        filterUpdate();
    }

    let isOpenFilter = $state(false);
    //Datos filtrar
    let cargados = $state(false);
    let buscarcaravana = $state("");
    let fechadesde = $state("");
    let fechahasta = $state("");
    let pesajes = $state([]);
    let pesajesrows = $state([]);
    let filas = $state([]);
    let columnas = $state([]);
    let tablapesaje = $state({});
    let pesajesprocesados = $state([]);
    let defaultfiltro = {
        buscarcaravana: "",
        fechadesde: "",
        fechahasta: "",
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listapesajes", defaultfiltro);
    //pesaje
    let idpesaje = $state("");
    let caravana = $state("");
    let fecha = $state("");
    let pesoanterior = $state("");
    let pesonuevo = $state("");
    let edit = $state(false);
    let ultimos = $state(5);
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    async function getPesajes() {
        if (versionjava) {
            cab = loadStorageEstablecimiento()
            let records = await getAll(cab.id);
            pesajes = records;
            cargados = true;
        } else {
            cab = caber.cab
            const records = await pb.collection("pesaje").getFullList({
                sort: "-fecha",
                expand: "animal,animal.cab",
                filter: `animal.cab = '${cab.id}'`,
            });
            pesajes = records;
            cargados = true;
        }
    }
    function setFilters() {
        buscarcaravana = proxyfiltros.buscarcaravana;
        fechadesde = proxyfiltros.fechadesde;
        fechahasta = proxyfiltros.fechahasta;
    }

    function setProxyFilter() {
        proxyfiltros.buscarcaravana = buscarcaravana;
        proxyfiltros.fechadesde = fechadesde;
        proxyfiltros.fechahasta = fechahasta;
    }

    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
        filas = [];
        columnas = [];
        tablapesaje = {};
        pesajesrows = pesajes;
        if (!isEmpty(buscarcaravana)) {
            pesajesrows = pesajesrows.filter((p) =>
                p.expand.animal.caravana
                    .toLocaleLowerCase()
                    .includes(buscarcaravana.toLocaleLowerCase()),
            );
        }
        if (!isEmpty(fechadesde)) {
            pesajesrows = pesajesrows.filter((p) => p.fecha >= fechadesde);
        }
        if (!isEmpty(fechahasta)) {
            pesajesrows = pesajesrows.filter((p) => p.fecha <= fechahasta);
        }
        //procesarPesajes()
        procesarUltimosPesajes();
    }
    function toggleEdit() {
        edit = !edit;
    }
    async function editarPesaje() {
        try {
            let data = {
                fecha:
                    new Date(fecha).toISOString().split("T")[0] + " 03:00:00",
                pesonuevo,
            };
            if (versionjava) {
                let p_idx = pesajes.findIndex((p) => p.id == idpesaje);
                if (p_idx != -1) {
                    let pes = pesajes[p_idx];
                    let data_java = {
                        animalId: pes.animal,
                        weightDate: fecha,
                        weight: pesonuevo,
                    };
                    await editPeso(idpesaje,data_java)
                }
            } else {
                await pb.collection("pesaje").update(idpesaje, data);
            }
            await getPesajes();
            filterUpdate();
            Swal.fire(
                "Éxito editar pesaje",
                "Se pudo editar el pesaje",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error editar pesaje",
                "No se pudo editar el pesaje",
                "error",
            );
        }
        detallePesaje.close();
    }
    async function eliminar() {
        try {
            if (versionjava) {
                await eliminarPeso(idpesaje);
            } else {
                await pb.collection("pesaje").delete(idpesaje);
            }
            await getPesajes();
            Swal.fire(
                "Éxito eliminar pesaje",
                "Se pudo eliminar el pesaje",
                "success",
            );
            filterUpdate();
            detallePesaje.close();
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error eliminar pesaje",
                "No se pudo eliminar el pesaje",
                "error",
            );
            detallePesaje.close();
        }
    }
    function openDetalle(id) {
        edit = false;
        idpesaje = id;
        let pesaje = pesajes.filter((p) => p.id == idpesaje)[0];
        caravana = pesaje.expand.animal.caravana;
        fecha = pesaje.fecha.split(" ")[0];
        pesoanterior = pesaje.pesoanterior;
        pesonuevo = pesaje.pesonuevo;

        detallePesaje.showModal();
    }
    function prepararData(item) {
        return {
            ANIMAL: item.expand.animal.caravana,
            FECHA: new Date(item.fecha).toISOString().split("T")[0],
            PESO_ANTERIO: item.pesoanterior,
            PESO_NUEVO: item.pesonuevo,
        };
    }
    function exportarPesaje() {
        let lista = pesajesrows;
        let csvdata = lista.map((f) => {
            let filaexcel = {
                ANIMAL: f.expand.animal.caravana,
                FECHA: new Date(f.fecha).toLocaleDateString(),
                PESO_ANTERIO: f.pesoanterior,
                PESO_NUEVO: f.pesonuevo,
            };

            return filaexcel;
        });
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([]);
        ws["A1"] = { t: "s", v: "Pesajes", s: {} };
        const range = XLSX.utils.decode_range("A1:K1");
        ws["!merges"] = [
            {
                s: { r: range.s.r, c: range.s.c },
                e: { r: range.e.r, c: range.e.c },
            },
        ];
        XLSX.utils.sheet_add_json(ws, csvdata, { origin: "A2" });
        XLSX.utils.book_append_sheet(wb, ws, "Pesajes");
        let confiltros = false;
        let filtros = [];
        if (confiltros) {
            const wsFilter = XLSX.utils.aoa_to_sheet(filtros);
            XLSX.utils.book_append_sheet(wb, wsFilter, "Filtros aplicados");
        }
        XLSX.writeFile(wb, `${"Pesajes".replace(/\//g, "-")}.xlsx`, {
            cellStyles: true,
        });
    }
    function procesarUltimosPesajes() {
        pesajesprocesados = [];
        //tabla[animal] = { animal,pesajes:[{fecha,peso}]}
        let tablapesajes = {};
        for (let i = 0; i < pesajesrows.length; i++) {
            let p = pesajesrows[i];
            let caravana = p.expand.animal.caravana;
            let fecha = p.fecha;
            let peso = p.pesonuevo;
            let id = p.id;
            if (tablapesajes[caravana]) {
                if (tablapesajes[caravana].pesajes.length < ultimos) {
                    tablapesajes[caravana].pesajes.push({ fecha, peso, id });
                }
            } else {
                tablapesajes[caravana] = {
                    animal: caravana,
                    pesajes: [{ fecha, peso, id }],
                };
            }
        }

        for (const [key, value] of Object.entries(tablapesajes)) {
            pesajesprocesados.push(value);
        }

        pesajesprocesados.sort((a, b) =>
            a.animal.toLocaleLowerCase() < b.animal.toLocaleLowerCase()
                ? -1
                : 1,
        );
    }
    function procesarPesajes() {
        let setanimales = new Set();
        let setfechas = new Set();
        tablapesaje = {};
        for (let i = 0; i < pesajesrows.length; i++) {
            let p = pesajesrows[i];
            let caravana = p.expand.animal.caravana;
            let fecha = p.fecha;
            if (tablapesaje[fecha]) {
                //Puede ocurrir que tenga 2 pesajes en el mismo dia?
                //En teoria si pero debe ser unerror, guardo el último
                if (tablapesaje[fecha][caravana]) {
                    tablapesaje[fecha][caravana] = {
                        pesonuevo: p.pesonuevo,
                        pesoanterior: p.pesoanterior,
                        id: p.id,
                    };
                } else {
                    tablapesaje[fecha][caravana] = {
                        pesonuevo: p.pesonuevo,
                        pesoanterior: p.pesoanterior,
                        id: p.id,
                    };
                }
            } else {
                tablapesaje[fecha] = {};
                tablapesaje[fecha][caravana] = {
                    pesonuevo: p.pesonuevo,
                    pesoanterior: p.pesoanterior,
                    id: p.id,
                };
            }
            //Así recorro los animales
            setanimales.add(caravana);
            //Así recorro las fecha
            setfechas.add(fecha);
        }
        filas = Array.from(setanimales);
        columnas = Array.from(setfechas);
        columnas.sort((a, b) => (new Date(a) < new Date(b) ? -1 : 1));
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        await getPesajes();
        filterUpdate();
    });
</script>

<Navbar2>
    <div
        class="
            container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4
            "
    >
        <a
            href={`${pre + "/pesajes/historial"}`}
            class="
                inline-flex items-center text-sm
                text-gray-700 hover:text-gray-900 dark:text-gray-400
                dark:hover:text-gray-200 mb-4"
        >
            <svg
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            Volver a pesajes
        </a>
    </div>
    <UltimosPesajes
        cabnombre={cab.nombre}
        pesajesrows={pesajesprocesados}
        bind:isOpenFilter
        bind:buscar={buscarcaravana}
        bind:fechadesde
        bind:fechahasta
        {limpiarFiltros}
        {prepararData}
        historial={() => goto(pre + "/pesajes/historial")}
        {filterUpdate}
        {clickFilter}
    />
    {#if esdev}
        <Success
            texto={versionjava ? "Cerrar java" : "Ver java"}
            onclick={toggleJava}
        />
    {/if}
    {#if cargados}
        <!--Tabla grande-->
        <div
            class={`
            hidden w-full xl:w-3/4 md:grid
                mx-auto py-1 px-4 max-w-7xl  
        `}
        >
            <div
                class={`
                    overflow-hidden rounded-xl
            border dark:border-gray-700
                `}
            >
                <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table
                        class="table table-lg w-full bg-white dark:bg-slate-900"
                    >
                        <thead
                            class={`${estilos.tableheader}  sticky top-0 z-5 shadow-sm`}
                        >
                            <tr>
                                <th class={`${estilos.tableth}`}> Animal</th>
                                <th class={`${estilos.tableth}`}> 5</th>
                                <th class={`${estilos.tableth}`}> 4</th>
                                <th class={`${estilos.tableth}`}> 3</th>
                                <th class={`${estilos.tableth}`}> 2</th>
                                <th class={`${estilos.tableth}`}> 1</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each pesajesprocesados as f}
                                <tr>
                                    <td
                                        class="text-base ml-3 pl-3 mr-1 pr-1 text-center"
                                    >
                                        {shorterWord(f.animal)}
                                    </td>
                                    {#each Array(5) as _, idx}
                                        {#if f.pesajes.length < ultimos - idx}
                                            <td
                                                class={`text-base ml-3 pl-3 mr-1 pr-1 `}
                                            >
                                                {"-"}
                                            </td>
                                        {:else}
                                            <td
                                                onclick={() =>
                                                    openDetalle(
                                                        f.pesajes[
                                                            ultimos - idx - 1
                                                        ].id,
                                                    )}
                                                class="cursor-pointer ml-3 pl-3 mr-1 pr-1 hover:bg-gray-200 dark:hover:bg-gray-900"
                                            >
                                                {new Date(
                                                    f.pesajes[
                                                        ultimos - idx - 1
                                                    ].fecha,
                                                ).toLocaleDateString()} , {f
                                                    .pesajes[ultimos - idx - 1]
                                                    .peso}
                                            </td>
                                        {/if}
                                    {/each}
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!--Tabla chica-->
        <div
            class={`
            w-full md:hidden
            mx-auto py-1 px-4 max-w-7xl  
        `}
        >
            <div
                class={`
                    overflow-hidden rounded-xl
                    border dark:border-gray-700
                `}
            >
                <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table
                        class="table table-lg w-full bg-white dark:bg-slate-900"
                    >
                        <thead
                            class={`${estilos.tableheader}  sticky top-0 z-5 shadow-sm`}
                        >
                            <tr>
                                <th class={`${estilos.tableth}`}> Animal</th>

                                <th class={`${estilos.tableth}`}>3</th>
                                <th class={`${estilos.tableth}`}>2</th>
                                <th class={`${estilos.tableth}`}>1</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each pesajesprocesados as f}
                                <tr>
                                    <td class="text-base mx-2 px-1 text-center">
                                        {shorterWord(f.animal)}
                                    </td>
                                    {#each Array(3) as _, idx}
                                        {#if f.pesajes.length < ultimos - (idx + 2)}
                                            <td>
                                                {"-"}
                                            </td>
                                        {:else}
                                            <td
                                                onclick={() =>
                                                    openDetalle(
                                                        f.pesajes[
                                                            ultimos -
                                                                (idx + 2) -
                                                                1
                                                        ].id,
                                                    )}
                                                class="cursor-pointer text-base mx-1 px-1 hover:bg-gray-200 dark:hover:bg-gray-900"
                                            >
                                                {new Date(
                                                    f.pesajes[
                                                        ultimos - (idx + 2) - 1
                                                    ].fecha,
                                                ).toLocaleDateString()} , {f
                                                    .pesajes[
                                                    ultimos - (idx + 2) - 1
                                                ].peso}
                                            </td>
                                        {/if}
                                    {/each}
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    {/if}
</Navbar2>
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
        <h3 class="text-lg font-bold">{edit ? "Editar " : "Ver "} pesaje</h3>
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
                    <label class="input-group">
                        <label class="input-group">
                            {#if edit}
                                <input
                                    id="fecha"
                                    type="date"
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
                                />
                            {:else}
                                <span
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                                    >{fecha.length > 0
                                        ? new Date(fecha).toLocaleDateString()
                                        : "Sin fecha"}</span
                                >
                            {/if}
                        </label>
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
                        {pesoanterior}
                    </label>
                </div>
                <div class="mb-1 lg:mb-0">
                    <label for="pesonuevo" class="label">
                        <span class="label-text text-base">Peso nuevo(KG)</span>
                    </label>
                    {#if edit}
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
                            oninput={() => (pesonuevo = Math.max(pesonuevo, 0))}
                        />
                    {:else}
                        <span
                            class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                            >{pesonuevo}</span
                        >
                    {/if}
                </div>
            </div>
        </div>
        <div class="modal-action justify-end">
            <div
                class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                <button
                    class="
                        hidden md:block
                        mt-2 px-10 py-2
                        dark:bg-transparent
                        bg-white
                        text-gray-800
                        dark:text-white
                        font-medium
                        rounded-full shadow-sm border
                        border-gray-300
                        hover:bg-gray-200
                        dark:hover:bg-gray-800
                        transition-colors
                        text-base"
                    onclick={() => detallePesaje.close()}
                >
                    Cerrar
                </button>
                {#if edit}
                    <!-- Botón Cancelar -->
                    <button
                        class="
                        hidden md:block
                        mt-2 px-10 py-2
                        dark:bg-transparent
                        bg-white
                        text-gray-800
                        dark:text-white
                        font-medium
                        rounded-full shadow-sm border
                        border-gray-300
                        hover:bg-gray-200
                        dark:hover:bg-gray-800
                        transition-colors
                        text-base"
                        onclick={toggleEdit}
                    >
                        Cancelar
                    </button>
                    <!-- Botón Editar -->
                    <button
                        class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                        onclick={editarPesaje}
                    >
                        Guardar
                    </button>
                {:else}
                    <button
                        class="mt-2 px-10 py-2 bg-[#A94442] text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-base"
                        onclick={eliminar}
                    >
                        Eliminar
                    </button>
                    <!-- Botón Editar -->
                    <button
                        class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                        onclick={toggleEdit}
                    >
                        Editar
                    </button>
                {/if}
            </div>
        </div>
    </div>
</dialog>
