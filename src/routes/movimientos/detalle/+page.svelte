<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import DetalleMovimiento from "$lib/components/movimientos/DetalleMovimiento.svelte";
    import CustomModalMove from "$lib/components/movimientos/CustomModalMove.svelte";
    import Animalesmodal from "$lib/components/movimientos/Animalesmodal.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import { onMount } from "svelte";
    import categorias from "$lib/stores/categorias";
    import tiponoti from "$lib/stores/tiponoti";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import { guardarHistorial } from "$lib/historial/lib";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { getPermisosCabUser } from "$lib/permisosutil/lib";
    import { createUserer } from "$lib/stores/user.svelte";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import InfoAnimal from "$lib/components/InfoAnimal.svelte";
    import DetalleMovimientoHeader from "$lib/components/movimientos/DetalleMovimientoHeader.svelte";
    import DetallesAnimalesMovimiento from "$lib/components/movimientos/DetallesAnimalesMovimiento.svelte";
    import motivos from "$lib/stores/motivos";
    import * as RodeoService from "$lib/java/rodeos/rodeosback";
    import * as LoteService from "$lib/java/lotes/lotesback";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let caber = createCaber();
    let userer = createUserer();
    let per = createPer();
    let cab = caber.cab;
    let userpermisos = $state([]);

    let lotes = $state([]);
    let rodeos = $state([]);

    let usuarioid = $state("");
    let defaultmovimiento = {
        categoria: "",
        lote: "",
        rodeo: "",
        fecha: "",
        motivo: "",
        fechabaja: "",
        codigo: "",
        listaanimales: [],
        selecthashmap: {},
        lotes: [],
        rodeos: [],
        categorias: [],
        seccionAbierta: "",
        versionjava: false,
    };
    let proxymovimiento = $state({
        ...defaultmovimiento,
    });
    let proxy = createStorageProxy("detallemovimiento", defaultmovimiento);
    //boton
    let seccionAbierta = $state("CATEGORIA");
    let textoboton = $state("Mover categoria");
    let categoria = $state("");
    let lote = $state("");
    let rodeo = $state("");
    let fecha = $state("");
    let motivo = $state("");
    let fechabaja = $state("");
    let codigo = $state("");
    let listaanimales = $state([]);
    let selecthashmap = $state({});

    //validar
    let malcategoria = $state("");
    let mallote = $state("");
    let malrodeo = $state("");
    let maltipo = $state("");
    let malfecha = $state("");
    let malfechabaja = $state("");
    let malmotivo = $state("");
    let malcodigo = $state("");
    let habilitarboton = $state(false);
    //Seleecionar
    let animal = $state({});
    let selectcategoria = $state(true);
    let selectlote = $state(false);
    let selectrodeo = $state(false);
    let selecttratamiento = $state(false);
    let selectbaja = $state(false);
    let selecttransfer = $state(false);
    function setMovimiento() {
        categoria = proxymovimiento.categoria;
        lote = proxymovimiento.lote;
        rodeo = proxymovimiento.rodeo;
        fecha = proxymovimiento.fecha;
        motivo = proxymovimiento.motivo;
        fechabaja = proxymovimiento.fechabaja;
        codigo = proxymovimiento.codigo;
        seccionAbierta = proxymovimiento.seccion;
        versionjava = proxymovimiento.versionjava;
        listaanimales = [];
        selecthashmap = proxymovimiento.selecthashmap;

        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                listaanimales.push(value);
            }
        }
    }
    function ordenarNombre(lista) {
        if (lista.length == 0) {
            return [];
        }
        lista.sort((r1, r2) =>
            r1.nombre.toLocaleLowerCase() > r2.nombre.toLocaleLowerCase()
                ? 1
                : -1,
        );
    }
    async function getRodeos() {
        const records = await pb.collection("rodeos").getFullList({
            filter: `active = true && cab = '${cab.id}'`,
            sort: "nombre",
        });
        rodeos = records;
        ordenarNombre(rodeos);
    }
    async function getLotes() {
        const records = await pb.collection("lotes").getFullList({
            filter: `active = true && cab = '${cab.id}'`,
            sort: "nombre",
        });
        lotes = records;
        ordenarNombre(lotes);
    }
    function volver() {
        goto(pre + "/movimientos");
    }
    function saveDefault() {
        proxy.save(defaultmovimiento);
    }
    async function moverDetallePocketbase(lista) {
        //Camino feliz
        let data = {};
        let nombrelote = "";
        let nombrerodeo = "";
        if (selectcategoria) {
            data.categoria = categoria;
        }
        if (selectlote) {
            data.lote = lote;
            nombrelote = lotes.filter((l) => l.id == lote)[0];
        }
        if (selectrodeo) {
            data.rodeo = rodeo;
            nombrerodeo = rodeos.filter((r) => r.id == rodeo)[0];
        }

        if (selectbaja) {
            data.active = false;
            data.motivobaja = motivo;
            data.fechafallecimiento = fechabaja + " 03:00:00";
        }
        if (selecttransfer && !versionjava) {
            const resultList = await pb.collection("cabs").getList(1, 1, {
                filter: `active = true && renspa = '${codigo}'`,
            });
            if (resultList.items.length == 0) {
                malcodigo = true;
                Swal.fire(
                    "Error transferencia",
                    "No hay ningún establecimiento con ese RENSPA",
                    "error",
                );
                return;
            }
            if (resultList.totalItems > 1) {
                Swal.fire(
                    "Error transferencia",
                    "Hay varios establecimientos con ese RENSPA",
                    "error",
                );
                return;
            }
            data.cab = resultList.items[0].id;
            data.lote = "";
            data.rodeo = "";
            try {
                let pb_json = JSON.parse(
                    localStorage.getItem("pocketbase_auth"),
                );

                let origenusuarioid = pb_json.record.id;
                let datanoti = {
                    texto: `Se transfirieron ${lista.length} animales`,
                    titulo: `Transferencia de ${lista.length} animales`,
                    tipo: tiponoti[1].id,
                    origen: origenusuarioid,
                    destino: resultList.items[0].user,
                    leido: false,
                };
                const record = await pb
                    .collection("notificaciones")
                    .create(datanoti);
            } catch (err) {
                console.error(err);
            }
        }

        let bulkcambios = [];
        let bulkhistoriales = [];
        //Crear los bulk insert
        for (let i = 0; i < lista.length; i++) {
            let a = lista[i];
            let datacambio = {
                ...data,
            };
            bulkcambios.push(datacambio);
            let datahistorial = {
                animal: a.id,
                caravana: a.caravana,
                user: a.expand.cab.user,
                active: true,
                delete: false,
                fechanacimiento: a.fechanacimiento,
                sexo: a.sexo,
                peso: a.peso,
                lote: a.lote,
                rodeo: a.rodeo,
                categoria: a.categoria,
                prenada: a.prenada,
                cab: cab.id,
            };
            bulkhistoriales.push(datahistorial);
        }
        try {
            const batch = pb.createBatch();
            for (let i = 0; i < lista.length; i++) {
                batch
                    .collection("animales")
                    .update(lista[i].id, bulkcambios[i]);
                batch
                    .collection("historialanimales")
                    .create(bulkhistoriales[i]);
            }
            const result = await batch.send();
            Swal.fire("Éxito movimiento", "Movimiento exitoso", "success");
        } catch (err) {
            Swal.fire(
                "Error movimiento",
                "No se logró hacer el movimiento",
                "error",
            );
        }
    }
    async function moverDetalleJava(lista) {
        let data_general = {

        }
    }
    async function moverDetalle() {
        if (selectcategoria) {
            if (categoria == "") {
                Swal.fire(
                    "Error movimiento",
                    "Debe seleccionar una categoria",
                    "error",
                );
                return;
            }
        }
        if (selectlote) {
            if (lote == "") {
                Swal.fire(
                    "Error movimiento",
                    "Debe seleccionar un lote",
                    "error",
                );
                return;
            }
        }
        if (selectrodeo) {
            if (rodeo == "") {
                Swal.fire(
                    "Error movimiento",
                    "Debe seleccionar un rodeo",
                    "error",
                );
                return;
            }
        }

        if (selectbaja) {
            if (fechabaja == "" || motivo == "") {
                Swal.fire(
                    "Error movimiento",
                    "Debe seleccionar una fecha y un motivo",
                    "error",
                );
                return;
            }
        }
        if (selecttransfer) {
            if (codigo == "") {
                Swal.fire(
                    "Error movimiento",
                    "Debe escribir algun código",
                    "error",
                );
                return;
            }
        }

        let lista = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                lista.push(value);
            }
        }
        if (lista.length == 0) {
            Swal.fire(
                "Error movimiento",
                "No hay animales seleccionados",
                "error",
            );
            rodeo = "";
            lote = "";
            categoria = "";
            return;
        }
        if(versionjava){
            await moverDetalleJava()
        }else{
            await moverDetallePocketbase()
        }
        
        //Limpiar variables

        proxy.save(defaultmovimiento);
        volver();
    }

    function validarBoton() {
        habilitarboton = true;
        if (selectcategoria) {
            if (categoria == "") {
                habilitarboton = false;
            }
        }
        if (selectlote) {
            if (lote == "") {
                habilitarboton = false;
            }
        }
        if (selectrodeo) {
            if (rodeo == "") {
                habilitarboton = false;
            }
        }

        if (selectbaja) {
            if (fechabaja == "" || motivo == "") {
                habilitarboton = false;
            }
        }
        if (selecttransfer) {
            if (codigo == "") {
                habilitarboton = false;
            }
        }
    }
    function oninput(campo) {
        validarBoton();

        if (selectcategoria && campo == "CATEGORIA") {
            if (categoria == "") {
                malcategoria = true;
            } else {
                malcategoria = false;
            }
        }
        if (selectlote && campo == "LOTE") {
            if (lote == "") {
                mallote = true;
            } else {
                mallote = false;
            }
        }
        if (selectrodeo && campo == "RODEO") {
            if (rodeo == "") {
                malrodeo = true;
            } else {
                malrodeo = false;
            }
        }
        if (selecttratamiento) {
            if (campo == "FECHA") {
                if (fecha == "") {
                    malfecha = true;
                } else {
                    malfecha = false;
                }
            }
        }
        if (selectbaja) {
            if (campo == "FECHABAJA") {
                if (fechabaja == "") {
                    malfechabaja = true;
                } else {
                    malfechabaja = false;
                }
            }
            if (campo == "MOTIVO") {
                if (motivo == "") {
                    malmotivo = true;
                } else {
                    malmotivo = false;
                }
            }
        }
    }
    function onChangeCollapse(seccion) {
        categoria = "";
        lote = "";
        rodeo = "";
        fecha = "";

        fechabaja = "";
        motivo = "";
        codigo = "";
        habilitarboton = false;
        seccionAbierta = seccion;
        if (seccion == "CATEGORIA") {
            selectcategoria = true;
            selectlote = false;
            selectrodeo = false;
            selecttratamiento = false;
            selectbaja = false;
            selecttransfer = false;
            textoboton = "Mover de categoria";
        }
        if (seccion == "RODEO") {
            selectcategoria = false;
            selectlote = false;
            selectrodeo = true;
            selecttratamiento = false;
            selectbaja = false;
            selecttransfer = false;
            textoboton = "Mover de rodeo";
        }
        if (seccion == "LOTE") {
            selectcategoria = false;
            selectlote = true;
            selectrodeo = false;
            selecttratamiento = false;
            selectbaja = false;
            selecttransfer = false;
            textoboton = "Mover de lote";
        }
        if (seccion == "TRATAMIENTO") {
            selectcategoria = false;
            selectlote = false;
            selectrodeo = false;
            selecttratamiento = true;
            selectbaja = false;
            selecttransfer = false;
            textoboton = "Crear tratamientos";
        }
        if (seccion == "BAJA") {
            selectcategoria = false;
            selectlote = false;
            selectrodeo = false;
            selecttratamiento = false;
            selectbaja = true;
            selecttransfer = false;
            textoboton = "Dar baja";
        }
        if (seccion == "TRANSFERIR") {
            selectcategoria = false;
            selectlote = false;
            selectrodeo = false;
            selecttratamiento = false;
            selectbaja = false;
            selecttransfer = true;
            textoboton = "Transferir";
        }
        guardarLista();
    }
    function quitarAnimal(id) {
        if (selecthashmap[id]) {
            delete selecthashmap[id];
            guardarLista();
            listaanimales = [];
            for (const [key, value] of Object.entries(selecthashmap)) {
                if (value != null) {
                    listaanimales.push(value);
                }
            }
        }
    }
    function guardarLista() {
        let movimiento = {
            ...defaultmovimiento,
            categoria,
            lote,
            rodeo,
            fecha,
            motivo,
            fechabaja,
            codigo,
            listaanimales: [],
            selecthashmap,
            lotes,
            categorias,
            rodeos,
            seccionAbierta,
        };
        proxy.save(movimiento);
    }
    async function getData() {
        if (versionjava) {
        } else {
            let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
            usuarioid = pb_json.record.id;
            let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

            per.setPer(respermisos.permisos, usuarioid);
            userpermisos = getPermisosList(per.per.permisos);
            await getRodeos();
            await getLotes();
        }
    }
    onMount(async () => {
        proxymovimiento = proxy.load();
        setMovimiento();
        await getData();
    });
    function verAnimal(id) {
        let a_idx = listaanimales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = listaanimales[a_idx];
            veranimal.showModal();
        }
    }
    let classbuscador = "container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4";
    let classmove = "container mx-auto py-3 px-4 max-w-6xl w-full";
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <div class={classmove}>
        {#if esdev}
            <span>Version java: {versionjava ? "Si" : "No"}</span>
        {/if}
        <DetalleMovimientoHeader
            {lotes}
            {rodeos}
            {categorias}
            {motivos}
            {seccionAbierta}
            nuevacategoria={categoria}
            nuevolote={lote}
            nuevorodeo={rodeo}
            {fecha}
            {fechabaja}
            {motivo}
            {codigo}
        />
        <DetallesAnimalesMovimiento
            bind:selectanimales={listaanimales}
            {quitarAnimal}
            {verAnimal}
            abierta={false}
        />
        <div
            class="mt-6 flex space-x-3 justify-start md:justify-end border-t dark:border-gray-800"
        >
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
                onclick={volver}
            >
                Volver
            </button>
            <!-- Botón Guardar -->
            <button
                class="
                    mt-2 px-10 py-2 bg-[#115642] text-white
                    font-medium rounded-full
                    shadow-sm hover:bg-green-700
                    transition-colors text-base
                    "
                onclick={moverDetalle}
            >
                Crear {listaanimales.length > 1 ? "movimientos" : "movimiento"}
            </button>
        </div>
    </div>
    <div class="hidden container mx-auto py-6 px-4 max-w-7xl">
        <!--Header-->
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            >
                <div
                    class={`
                        bg-transparent        
                        px-4 py-4 
                    `}
                >
                    <button onclick={volver}>
                        <h1
                            class={`
                                flex text-left
                                text-2xl font-bold 
                                dark:text-white text-gray-900
                            `}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-5 mt-1"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>
                            Movimientos
                        </h1>
                    </button>
                </div>
                <button
                    class={`btn btn-primary rounded-lg ${estilos.btntext2}`}
                    data-theme="forest"
                    disabled={!habilitarboton}
                    onclick={moverDetalle}
                >
                    {#if esCelu}
                        <span class="text-lg">Movimientos</span>
                    {:else}
                        <span class="text-lg">+ Crear movimientos</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
    <div class="hidden container mx-auto py-6 px-4 max-w-7xl">
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <CustomModalMove
                bind:nuevacategoria={categoria}
                bind:nuevolote={lote}
                bind:nuevorodeo={rodeo}
                bind:fecha
                bind:fechabaja
                bind:codigo
                bind:malcodigo
                bind:motivo
                {categorias}
                {listaanimales}
                {lotes}
                {rodeos}
                {HOY}
                {oninput}
                {onChangeCollapse}
            />
        </div>
    </div>
    <div class="hidden container mx-auto py-6 px-4 max-w-7xl">
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <details class="collapse collapse-arrow">
                <summary class="collapse-title font-semibold text-xl"
                    >Ver animales</summary
                >
                <div class="collapse-content">
                    <Animalesmodal {listaanimales} {quitarAnimal} />
                </div>
            </details>
        </div>
    </div>
</Navbar2>

<dialog id="veranimal" class="modal modal-middle rounded-xl">
    <div
        class="
            modal-box w-11/12 max-w-6xl
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
        <h3 class="text-xl font-bold">Ver animal</h3>
        <InfoAnimal {animal} forcedOpen={true} />
    </div>
</dialog>
