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

    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
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
    };
    let proxymovimiento = $state({
        ...defaultmovimiento,
    });
    let proxy = createStorageProxy("detallemovimiento", defaultmovimiento);
    //boton
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
                return
            }

        }
        if (selecttransfer) {
            if (codigo == "") {
                Swal.fire(
                    "Error movimiento",
                    "Debe escribir algun código",
                    "error",
                );
                return
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
        if (selecttransfer) {
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
        //Limpiar variables

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
        };

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
        };
        proxy.save(movimiento);
    }
    onMount(async () => {
        proxymovimiento = proxy.load();
        setMovimiento();
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        await getRodeos();
        await getLotes();
    });
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <div class="container mx-auto py-6 px-4 max-w-7xl">
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
    <div class="container mx-auto py-6 px-4 max-w-7xl">
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
    <div class="container mx-auto py-6 px-4 max-w-7xl">
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
