<script>
    import { goto } from "$app/navigation";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import BuscadorMovimientos from "$lib/components/servicios/BuscadorMovimientos.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import estilos from "$lib/stores/estilos";

    import { createCaber } from "$lib/stores/cab.svelte";
    import categorias from "$lib/stores/categorias";
    import sexos from "$lib/stores/sexos";
    import { capitalize } from "$lib/stringutil/lib";
    import { guardarHistorial } from "$lib/historial/lib";
    import { isEmpty, addDays } from "$lib/stringutil/lib";
    import {
        getEstadoNombre,
        getEstadoColor,
    } from "$lib/components/estadosutils/lib";
    import { getSexoNombre } from "$lib/stringutil/lib";
    import MultipleToros from "$lib/components/MultipleToros.svelte";
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    import MultiSelect from "$lib/components/MultiSelect.svelte";
    import { shorterWord } from "$lib/stringutil/lib";
    //tabla animales
    import TablaMovimiento from "$lib/components/TablaMovimiento.svelte";
    //FILTROS
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import InfoAnimal from "$lib/components/InfoAnimal.svelte";
    import NuevoServicio from "$lib/components/servicios/NuevoServicio.svelte";
    import AnimalesSeleccionados from "$lib/components/servicios/AnimalesSeleccionados.svelte";
    import SelectToros from "$lib/components/SelectToros.svelte";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    //paginacon
    let pageSize = $state(15);
    let paginaActual = $state(1);
    //Datos animales
    let animales = $state([]);
    let animalesrows = $state([]);
    let madres = $state([]);
    let padres = $state([]);
    let listapadres = $state([]);
    let cargadoanimales = $state(false);
    //Datos movimiento
    let animal = $state({});
    let esNatural = $state(true);
    let esservicio = $derived(esNatural);
    let esinseminacion = $derived(!esNatural);
    let observacion = $state("");
    let observaciongeneral = $state("");
    let fechaparto = $state("");
    //servicio
    let fechadesdeserv = $state("");
    let fechahastaserv = $state("");
    let madre = $state("");
    let padreslist = $state([]);
    let padresserv = $state("");
    let pajuelasserv = $state("");
    //inseminacion
    let fechainseminacion = $state("");
    let pajuela = $state("");
    let padre = $state("");
    let cadenapadre = $state("");
    //Filtros
    let buscar = $state("");
    let lote = $state("");
    let rodeo = $state("");
    let categoria = $state("");
    let sexo = $state("H");
    let estado = $state("");
    let raza = $state("");
    let color = $state("");
    let rodeoseleccion = $state([]);
    let loteseleccion = $state([]);
    let categoriaseleccion = $state([]);

    let defaultfiltro = {
        buscar: "",
        lote: "",
        rodeo: "",
        categoria: "",
        sexo: "",
        estado: -1,
        raza: "",
        color: "",
        rodeoseleccion: [],
        loteseleccion: [],
        categoriaseleccion: [],
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("serviciosanimales", defaultfiltro);

    //movimiento
    let defaultmovimiento = {
        //general
        esNatural: true,
        observacion: "",
        fechaparto: "",
        //servicio
        fechadesdeserv: "",
        fechahastaserv: "",
        madre: "",
        padreslist: [],
        padresserv: "",

        //inseminacion
        fechainseminacion: "",
        pajuela: "",
        padre: "",
        cadenapadre: "",
        //animales
        selecthashmap: {},
        listapadres: [],
        padres: [],
    };
    let detallemovimiento = $state({ ...defaultmovimiento });
    let proxyDetalleMovimiento = createStorageProxy(
        "detallemovimientoservicio",
        defaultmovimiento,
    );

    let lotes = $state([]);
    let rodeos = $state([]);
    let isOpenFilter = $state(false);

    //Seleccionados
    let selectanimales = $state([]);
    let selecthashmap = $state({});
    let todos = $state(false);
    let algunos = $state(false);
    let ninguno = $state(true);

    //validacion
    let malfechadese = $state(false);
    let malpadre = $state(false);
    let botonhabilitado = $state(false);

    //validacion
    let malfecha = $state(false);
    $effect(() => {
        if (padre == "") {
            for (let i = 0; i < selectanimales.length; i++) {
                selectanimales[i].padre = "";
            }
        }
    });
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    function limpiar() {
        //Cuando filtro debo reiniciar la seleccion?
        selectanimales = [];
        let lista = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            lista.push(key);
        }
        for (let i = 0; i < lista.length; i++) {
            selecthashmap[lista[i]] = null;
        }
        algunos = false;
        todos = false;
        ninguno = true;
    }
    function setFilters() {
        buscar = proxyfiltros.buscar;
        lote = proxyfiltros.lote;
        rodeo = proxyfiltros.rodeo;
        categoria = proxyfiltros.categoria;
        sexo = proxyfiltros.sexo;
        raza = proxyfiltros.raza;
        color = proxyfiltros.color;
        estado = proxyfiltros.estado;
        rodeoseleccion = proxyfiltros.rodeoseleccion;
        loteseleccion = proxyfiltros.loteseleccion;
        categoriaseleccion = proxyfiltros.categoriaseleccion;
    }

    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.lote = lote;
        proxyfiltros.rodeo = rodeo;
        proxyfiltros.categoria = categoria;
        proxyfiltros.sexo = sexo;
        proxyfiltros.raza = raza;
        proxyfiltros.color = color;
        proxyfiltros.estado = estado;
        proxyfiltros.rodeoseleccion = rodeoseleccion;
        proxyfiltros.loteseleccion = loteseleccion;
        proxyfiltros.categoriaseleccion = categoriaseleccion;
    }
    function setDetalle() {
        detallemovimiento.selecthashmap = selecthashmap;
        /*
         //general
        esNatural: true,
        observacion: "",
        fechaparto: "",
        //servicio
        fechadesdeserv: "",
        fechahastaserv: "",
        madre: "",
        padreslist: [],
        padresserv: "",

        //inseminacion
        fechainseminacion: "",
        pajuela: "",
        padre: "",
        cadenapadre: "",
        //animales
        selecthashmap: {},
        listapadres: [],
        padres: [],
        */
        detallemovimiento.esNatural = esNatural;
        detallemovimiento.observacion = observaciongeneral;
        detallemovimiento.fechaparto = fechaparto;
        detallemovimiento.fechadesdeserv = fechadesdeserv;
        detallemovimiento.fechahastaserv = fechahastaserv;
        detallemovimiento.padreslist = padreslist;
        detallemovimiento.padresserv = padresserv;

        detallemovimiento.fechainseminacion = fechainseminacion;
        detallemovimiento.padre = padre;

        detallemovimiento.pajuela = pajuela;
        detallemovimiento.selecthashmap = selecthashmap;
        proxyDetalleMovimiento.save(detallemovimiento);
    }
    function setDetalleDefault() {
        proxyDetalleMovimiento.save(defaultmovimiento);
        loadDetalle();
    }
    function setLista() {
        selectanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                selectanimales.push(value);
            }
        }
        if (selectanimales.length == animales.length) {
            todos = true;
            algunos = false;
            ninguno = false;
        } else if (selectanimales.length > 0) {
            todos = false;
            algunos = true;
            ninguno = false;
        } else {
            todos = false;
            algunos = false;
            ninguno = true;
        }
    }
    function loadDetalle() {
        detallemovimiento = proxyDetalleMovimiento.load();
        /*
         //general
        esNatural: true,
        observacion: "",
        fechaparto: "",
        //servicio
        fechadesdeserv: "",
        fechahastaserv: "",
        madre: "",
        padreslist: [],
        padresserv: "",

        //inseminacion
        fechainseminacion: "",
        pajuela: "",
        padre: "",
        cadenapadre: "",
        //animales
        selecthashmap: {},
        listapadres: [],
        padres: [],
        */
        esNatural = detallemovimiento.esNatural;
        observaciongeneral = detallemovimiento.observacion;
        fechaparto = detallemovimiento.fechaparto;
        fechadesdeserv = detallemovimiento.fechadesdeserv;
        fechahastaserv = detallemovimiento.fechahastaserv;
        padreslist = detallemovimiento.padreslist;
        padresserv = detallemovimiento.padresserv;

        fechainseminacion = detallemovimiento.fechainseminacion;
        padre = detallemovimiento.padre;
        pajuela = detallemovimiento.pajuela;
        selecthashmap = detallemovimiento.selecthashmap;

        setLista();
    }
    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    function filterUpdate() {
        setProxyFilter();

        proxy.save(proxyfiltros);
        animalesrows = madres;
        if (buscar != "") {
            animalesrows = animalesrows.filter((a) =>
                a.caravana
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
        }
        if (raza != "") {
            animalesrows = animalesrows.filter((a) =>
                a.raza.toLocaleLowerCase().includes(raza.toLocaleLowerCase()),
            );
        }
        if (color != "") {
            animalesrows = animalesrows.filter((a) =>
                a.color.toLocaleLowerCase().includes(color.toLocaleLowerCase()),
            );
        }
        if (sexo != "") {
            animalesrows = animalesrows.filter((a) => a.sexo == sexo);
        }
        if (rodeo != "") {
            animalesrows = animalesrows.filter((a) => a.rodeo == rodeo);
        }
        if (lote != "") {
            animalesrows = animalesrows.filter((a) => a.lote == lote);
        }
        if (categoria != "") {
            animalesrows = animalesrows.filter((a) => a.categoria == categoria);
        }
        if (estado == 0 || estado == 2 || estado == 3) {
            animalesrows = animalesrows.filter((a) => a.prenada == estado);
        }
        if (rodeoseleccion.length != 0) {
            if (rodeoseleccion.length == 1 && rodeoseleccion[0] == "-1") {
                animalesrows = animalesrows.filter((a) => !a.rodeo);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    rodeoseleccion.includes(a.rodeo),
                );
            }
        }
        if (loteseleccion.length != 0) {
            if (loteseleccion.length == 1 && loteseleccion[0] == "-1") {
                animalesrows = animalesrows.filter((a) => !a.lote);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    loteseleccion.includes(a.lote),
                );
            }
        }
        if (categoriaseleccion.length != 0) {
            if (
                categoriaseleccion.length == 1 &&
                categoriaseleccion[0] == "-1"
            ) {
                animalesrows = animalesrows.filter((a) => !a.categoria);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    categoriaseleccion.includes(a.categoria),
                );
            }
        }
        paginaActual = 1;
        pageSize = 15;
    }
    function ordenarNombre(lista) {
        lista.sort((r1, r2) =>
            r1.nombre.toLocaleLowerCase() > r2.nombre.toLocaleLowerCase()
                ? 1
                : -1,
        );
    }
    function inputObsGeneral() {
        for (let i = 0; i < selectanimales.length; i++) {
            selectanimales[i].observacion = observaciongeneral;
        }
        setDetalle();
    }

    function clickAnimal(id) {
        if (selecthashmap[id]) {
            if (todos) {
                todos = false;
                algunos = true;
            }
            delete selecthashmap[id];
            if (Object.keys(selecthashmap).length == 0) {
                todos = false;
                algunos = false;
                ninguno = true;
            }
        } else {
            if (ninguno) {
                algunos = true;
                ninguno = false;
            }
            let a = animalesrows.filter((an) => an.id == id)[0];

            selecthashmap[id] = {
                ...a,
                padres: [],
                padresserv: "",
                padre: "",
                pajuela: pajuela,
                observacion: "",
                abierto: false,
            };
        }
        setDetalle();
    }
    function clickTodos() {
        if (todos) {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthashmap = {};
        } else if (ninguno) {
            ninguno = false;
            todos = true;
            for (let i = 0; i < animalesrows.length; i++) {
                let a = animalesrows[i];
                selecthashmap[animalesrows[i].id] = {
                    ...a,
                    padresserv: "",
                    padres: [],
                    padre: "",
                    pajuela: pajuela,
                    observacion: "",
                    abierto: false,
                };
            }
        } else if (algunos) {
            selecthashmap = {};
            algunos = false;
            todos = false;
            ninguno = true;
        }

        setDetalle();
    }
    async function getLotes() {
        const records = await pb.collection("lotes").getFullList({
            filter: `active = true && cab ~ '${cab.id}'`,
            sort: "nombre",
        });
        lotes = records;
        ordenarNombre(lotes);
    }
    async function getRodeos() {
        const records = await pb.collection("rodeos").getFullList({
            filter: `active = true && cab ~ '${cab.id}'`,
            sort: "nombre",
        });
        rodeos = records;
        //ordenarNombre(rodeos)
    }
    async function getAnimales() {
        const recordsa = await pb.collection("Animalestacto").getFullList({
            filter: `active=true && cab='${cab.id}'`,
            expand: "rodeo,lote,cab",
        });

        animales = recordsa;
        animales.sort((a1, a2) =>
            a1.caravana.toLocaleLowerCase() > a2.caravana.toLocaleLowerCase()
                ? 1
                : -1,
        );
        madres = animales.filter((a) => a.sexo == "H");
        padres = animales.filter((a) => a.sexo == "M");
        cargadoanimales = true;
        listapadres = padres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
        animalesrows = madres;
    }
    function irServicio(esServicio) {
        if (ninguno) {
            Swal.fire(
                "Error servicio",
                "No hay animales seleccionados",
                "error",
            );

            return;
        }
        setDetalle(esServicio);
        goto(pre + "/servicios/movimiento/detallemovimento");
    }
    function verAnimal(id) {
        let a_idx = animales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = animales[a_idx];
            veranimal.showModal();
        }
    }
    function openNewModal() {
        if (ninguno) {
            Swal.fire(
                "Error servicio",
                "No hay animales seleccionados",
                "error",
            );

            return;
        }
        selectanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            selectanimales.push({
                ...value,
            });
        }
        servicioMasivo.showModal();
    }
    function openNewModalInseminacion() {
        if (ninguno) {
            Swal.fire(
                "Error inseminación",
                "No hay animales seleccionados",
                "error",
            );

            return;
        }
        selectanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                selectanimales.push({
                    ...value,
                    padre: "",
                    pajuela: "",
                    observacion: "",
                    abierto: false,
                });
            }
        }
        pajuela = "";
        fechainseminacion = "";
        inseminacionMasiva.showModal();
    }

    function seleccionarPadre() {
        validarBoton();
        if (padreslist.length == 0) {
            malpadre = true;
        } else {
            malpadre = false;
        }
    }
    function input(campo) {
        validarBoton();
        if (esservicio) {
            if (campo == "DESDE") {
                if (fechadesdeserv == "") {
                    malfechadese = true;
                } else {
                    malfechadese = false;
                    fechaparto = addDays(fechadesdeserv, 280)
                        .toISOString()
                        .split("T")[0];
                }
            }
        }
        if (esinseminacion) {
            if (campo == "FECHA") {
                if (isEmpty(fechainseminacion)) {
                    malfecha = true;
                } else {
                    malfecha = false;
                    fechaparto = addDays(fechainseminacion, 280)
                        .toISOString()
                        .split("T")[0];
                }
            }
            if (campo == "PAJUELA") {
                if (isEmpty(pajuela)) {
                    malpadre = true;
                } else {
                    malfecha = false;
                    for (let i = 0; i < selectanimales.length; i++) {
                        selectanimales[i].pajuela = pajuela;
                    }
                }
            }
        }
        setDetalle();
    }
    function onInput(campo) {
        input(campo);
    }
    function cambiar() {
        for (let i = 0; i < selectanimales.length; i++) {
            let servicio = selectanimales[i];

            for (let j = 0; j < padreslist.length; j++) {
                let id = padreslist[j];
                if (!servicio.padres.includes(id)) {
                    selectanimales[i].padres.push(id);
                }
            }
        }
        setDetalle();
    }
    function agregarPadre(id) {
        for (let i = 0; i < selectanimales.length; i++) {
            let servicio = selectanimales[i];

            if (!servicio.padres.includes(id)) {
                selectanimales[i].padres.push(id);
            }
        }
        setDetalle();
    }
    function quitarPadre(id) {
        for (let i = 0; i < selectanimales.length; i++) {
            let servicio = selectanimales[i];
            let idx = servicio.padres.findIndex((p) => p == id);
            if (idx != -1) {
                selectanimales[i].padres.splice(idx, 1);
            }
        }
        setDetalle();
    }
    async function guardarBulk() {
        if (esservicio) {
            if (listapadres.length == 0) {
                Swal.fire("Sin padres", "No hay padres seleccionados", "error");
            }
            let bulksers = [];
            let bulkcambios = [];
            for (let i = 0; i < selectanimales.length; i++) {
                let servicio = selectanimales[i];
                let dataser = {
                    fechadesde: fechadesdeserv + " 03:00:00",
                    fechaparto: fechaparto + " 03:00:00",
                    observacion: servicio.observacion,
                    madre: servicio.id,
                    padres: padreslist.join(),
                    active: true,
                    cab: cab.id,
                };
                if (fechahastaserv != "") {
                    dataser.fechahasta = fechahastaserv + " 03:00:00";
                }
                bulksers.push(dataser);
                let ft = servicio.fechatacto;
                let fi = servicio.fechains;
                let fs = servicio.fechaser;
                let maximafecha = null;
                const valor1 = ft || "";
                const valor2 = fi || "";
                const valor3 = fs || "";
                if (valor1 >= valor2 && valor1 >= valor3) {
                    maximafecha = ft;
                } else if (valor2 >= valor1 && valor2 >= valor3) {
                    maximafecha = fi;
                } else {
                    maximafecha = fs;
                }
                if (maximafecha == null || fechadesdeserv > maximafecha) {
                    let dataupdate = {
                        prenada: 3,
                        id: servicio.id,
                    };
                    bulkcambios.push(dataupdate);
                    let datahistorial = {
                        animal: servicio.id,
                        caravana: servicio.caravana,
                        user: servicio.user,
                        active: true,
                        delete: false,
                        fechanacimiento: servicio.fechanacimiento,
                        sexo: servicio.sexo,
                        peso: servicio.peso,
                        lote: servicio.lote,
                        rodeo: servicio.rodeo,
                        categoria: servicio.categoria,
                        prenada: servicio.prenada,
                    };
                    bulkhistoriales.push(datahistorial);
                }
            }
            try {
                const batch = pb.createBatch();
                for (let i = 0; i < bulksers.length; i++) {
                    let bs = bulksers[i];
                    batch.collection("servicios").create(bs);
                }
                for (let i = 0; i < bulkcambios.length; i++) {
                    let bc = bulkcambios[i];
                    batch
                        .collection("animales")
                        .update(bc.id, { prenada: bc.prenada });
                }
                for (let i = 0; i < bulkhistoriales.length; i++) {
                    let bh = bulkhistoriales[i];
                    batch.collection("historialanimales").create(bh);
                }
                const result = await batch.send();
            } catch (err) {
                console.error(err);
            }
            await getAnimales();
            selectanimales = [];
            selecthashmap = {};
            fechadesdeserv = "";
            fechahastaserv = "";
            padreslist = [];
            padresserv = "";

            servicioMasivo.close();
        }
        if (esinseminacion) {
            if (fechainseminacion == "") {
                Swal.fire(
                    "Error inseminaciones",
                    "Debe seleccionar una fecha",
                    "error",
                );

                return;
            }
            let bulkins = [];
            let bulkcambios = [];
            let bulkhistoriales = [];
            for (let i = 0; i < selectanimales.length; i++) {
                let inseminacion = selectanimales[i];
                let data = {
                    cab: cab.id,
                    animal: inseminacion.id,
                    fechaparto: fechaparto + " 03:00:00",
                    fechainseminacion: fechainseminacion + " 03:00:00",
                    active: true,
                    padre: inseminacion.padre,
                    pajuela: inseminacion.pajuela,
                    categoria: inseminacion.categoria,
                    observacion: inseminacion.observacion,
                };
                bulkins.push(data);
                let ft = servicio.fechatacto;
                let fi = servicio.fechains;
                let fs = servicio.fechaser;
                let maximafecha = null;
                const valor1 = ft || "";
                const valor2 = fi || "";
                const valor3 = fs || "";
                if (valor1 >= valor2 && valor1 >= valor3) {
                    maximafecha = ft;
                } else if (valor2 >= valor1 && valor2 >= valor3) {
                    maximafecha = fi;
                } else {
                    maximafecha = fs;
                }
                if (maximafecha == null || fechainseminacion > maximafecha) {
                    let dataupdate = {
                        prenada: 3,
                        id: tactoanimal.id,
                    };
                    bulkcambios.push(dataupdate);
                    let datahistorial = {
                        animal: inseminacion.id,
                        caravana: inseminacion.caravana,
                        user: inseminacion.user,
                        active: true,
                        delete: false,
                        fechanacimiento: inseminacion.fechanacimiento,
                        sexo: inseminacion.sexo,
                        peso: inseminacion.peso,
                        lote: inseminacion.lote,
                        rodeo: inseminacion.rodeo,
                        categoria: inseminacion.categoria,
                        prenada: inseminacion.prenada,
                    };
                    bulkhistoriales.push(datahistorial);
                }
            }
            try {
                const batch = pb.createBatch();
                for (let i = 0; i < bulkins.length; i++) {
                    let bi = bulkins[i];
                    batch.collection("inseminaciones").create(bi);
                }
                for (let i = 0; i < bulkhistoriales.length; i++) {
                    let bh = bulkhistoriales[i];
                    batch.collection("historialanimales").create(bh);
                }
                for (let i = 0; i < bulkcambios.length; i++) {
                    let bc = bulkcambios[i];
                    batch
                        .collection("animales")
                        .update(bc.id, { prenada: bc.prenada });
                }

                const result = await batch.send();
            } catch (err) {
                console.error(err);
            }
            await getAnimales();
            fechainseminacion = "";
            fechaparto = "";
            pajuela = "";
            padre = "";
            botonhabilitado = false;
            malfecha = false;
            malpadre = false;
            selecthashmap = {};
            selectanimales = [];
        }
    }
    async function guardar() {
        if (esservicio) {
            if (listapadres.length == 0) {
                Swal.fire("Sin padres", "No hay padres seleccionados", "error");
            }
            let errores = false;
            let serverrores = [];
            for (let i = 0; i < selectanimales.length; i++) {
                let servicio = selectanimales[i];
                try {
                    let s_padres = servicio.padres.join();
                    if (s_padres.length == 0) {
                        throw 101;
                    }
                    let dataser = {
                        fechadesde: fechadesdeserv + " 03:00:00",
                        fechaparto: fechaparto + " 03:00:00",
                        observacion: servicio.observacion,
                        madre: servicio.id,
                        padres: s_padres,
                        active: true,
                        cab: cab.id,
                    };

                    if (fechahastaserv != "") {
                        dataser.fechahasta = fechahastaserv + " 03:00:00";
                    }
                    await pb.collection("servicios").create(dataser);
                    //Revisar las fechas
                    await guardarHistorial(pb, servicio.id);
                    await pb
                        .collection("animales")
                        .update(servicio.id, { prenada: 3 });
                    await getAnimales();
                } catch (err) {
                    serverrores.push(servicio.id);
                    console.error(err);
                    errores = true;
                }
            }
            if (errores) {
                Swal.fire(
                    "Error servicios",
                    "Hubo algun error en algun servico",
                    "error",
                );
            } else {
                Swal.fire(
                    "Éxito servicios",
                    "Se lograron registrar todos los servicios",
                    "success",
                );
            }
            for (let i = 0; i < selectanimales.length; i++) {
                let servicio = selectanimales[i];
                let i_error = serverrores.findIndex(
                    (pid) => pid == servicio.id,
                );
                if (i_error == -1) {
                    delete selecthashmap[servicio.id];
                }
            }
            selectanimales = [];
            fechadesdeserv = "";
            fechahastaserv = "";
            padreslist = [];
            padresserv = "";

            servicioMasivo.close();
        }
        if (esinseminacion) {
            if (fechainseminacion == "") {
                Swal.fire(
                    "Error inseminaciones",
                    "Debe seleccionar una fecha",
                    "error",
                );

                return;
            }
            let errores = false;
            let erroresins = [];
            for (let i = 0; i < selectanimales.length; i++) {
                let inseminacion = selectanimales[i];

                let data = {
                    cab: cab.id,
                    animal: inseminacion.id,
                    fechaparto: fechaparto + " 03:00:00",
                    fechainseminacion: fechainseminacion + " 03:00:00",
                    active: true,
                    padre: inseminacion.padre,
                    pajuela: inseminacion.pajuela,
                    categoria: inseminacion.categoria,
                    observacion: inseminacion.observacion,
                };
                try {
                    const record = await pb
                        .collection("inseminacion")
                        .create(data);
                    await guardarHistorial(pb, inseminacion.id);
                    await pb
                        .collection("animales")
                        .update(inseminacion.id, { prenada: 3 });
                    await getAnimales();
                } catch (err) {
                    erroresins.push(inseminacion.id);
                    console.error(err);
                }
            }
            if (errores) {
                Swal.fire(
                    "Error inseminaciones",
                    "Hubo algun error en alguna inseminación",
                    "error",
                );
            } else {
                Swal.fire(
                    "Éxito inseminaciones",
                    "Se lograron registrar todas las inseminaciones",
                    "success",
                );
            }
            fechainseminacion = "";
            fechaparto = "";
            pajuela = "";
            padre = "";
            botonhabilitado = false;
            malfecha = false;
            malpadre = false;
            for (let i = 0; i < selectanimales.length; i++) {
                let inseminacion = selectanimales[i];
                let i_error = erroresins.findIndex(
                    (pid) => pid == inseminacion.id,
                );
                if (i_error == -1) {
                    delete selecthashmap[inseminacion.id];
                }
            }
            selectanimales = [];
        }
    }
    function validarBoton() {
        botonhabilitado = true;
        if (esservicio) {
            if (fechadesdeserv == "") {
                botonhabilitado = false;
            }
        }
        if (esinseminacion) {
        }
    }
    function onelegir(id) {
        let p = padres.filter((pa) => pa.id == id)[0];
        for (let i = 0; i < selectanimales.length; i++) {
            selectanimales[i].pajuela = p.caravana;
            selectanimales[i].padre = id;
        }
        pajuela = p.caravana;

        onInput("PAJUELA");
    }
    function onwrite() {
        for (let i = 0; i < selectanimales.length; i++) {
            selectanimales[i].pajuela = pajuela;
        }
        onInput("PAJUELA");
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();

        await getAnimales();
        await getRodeos();
        await getLotes();

        cargado = true;
        loadDetalle();
        filterUpdate();
        if (Object.entries(selecthashmap).length == animalesrows.length) {
            todos = true;
            ninguno = false;
            algunos = false;
        }
    });
    function cancelar() {
        goto(pre + "/servicios");
    }
    function siguiente() {
        goto(pre + "/servicios/movimiento/detallemovimento");
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <div
        class="
            container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4
            "
    >
        <a
            href={`${pre + "/servicios"}`}
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
            Volver a servicios
        </a>
        <div
            class="hidden md:block flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3"
        >
            <div
                class={`
                            bg-transparent
                            px-2 py-1
                        `}
            >
                <h1
                    class={`
                            text-4xl font-semibold 
                            dark:text-[#24a579] text-[#115642]
                            
                        `}
                >
                    Nuevo servicios
                </h1>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 max-h-screen">
            <!--Lado izquierd-->
            <div>
                <div
                    class="md:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3"
                >
                    <div
                        class={`
                            bg-transparent
                            px-2 py-1
                        `}
                    >
                        <h1
                            class={`
                            text-4xl font-semibold 
                            dark:text-[#24a579] text-[#115642]
                            
                        `}
                        >
                            Crear nuevo servicio
                        </h1>
                    </div>
                </div>
                <NuevoServicio
                    bind:esNatural
                    bind:fechadesdeserv
                    bind:fechahastaserv
                    bind:padresserv
                    bind:padreslist
                    bind:fechaparto
                    bind:observaciongeneral
                    bind:fechainseminacion
                    bind:padre
                    bind:pajuela
                    {listapadres}
                    agregarPadre={cambiar}
                    quitarPadre={cambiar}
                    {cargadoanimales}
                    {padres}
                    {malfechadese}
                    {malpadre}
                    {malfecha}
                    {input}
                    {onInput}
                    {inputObsGeneral}
                    {onwrite}
                    {onelegir}
                />
                <AnimalesSeleccionados
                    {selecthashmap}
                    quitarAnimal={clickAnimal}
                />
            </div>
            <!--Lado derecho-->
            <div class="md:col-span-2">
                <BuscadorMovimientos
                    {esNatural}
                    {animalesrows}
                    {selecthashmap}
                    bind:buscar
                    {rodeos}
                    bind:rodeoseleccion
                    {lotes}
                    bind:loteseleccion
                    {categorias}
                    bind:estado
                    bind:categoriaseleccion
                    bind:raza
                    bind:color
                    bind:isOpenFilter
                    {clickFilter}
                    {filterUpdate}
                    nuevoServicio={() => irServicio(true)}
                    nuevoInseminacion={() => irServicio(false)}
                    {limpiarFiltros}
                />

                <div
                    class={`
                        hidden w-full md:grid
                        mx-auto  px-2 md:px-1 max-w-7xl
                    `}
                >
                    <div
                        class={`
                            overflow-hidden rounded-t-xl
                        `}
                    >
                        <TablaMovimiento
                            bind:paginaActual
                            bind:pageSize
                            selecthash={selecthashmap}
                            {animalesrows}
                            clickFila={clickAnimal}
                            {clickTodos}
                            {todos}
                            {ninguno}
                            {algunos}
                            verFila={verAnimal}
                            conEstado={true}
                            {cancelar}
                            {siguiente}
                        />
                    </div>
                </div>

                <div class="block md:hidden justify-items-center mx-1">
                    <div class="w-full flex justify-start">
                        <button
                            aria-label="Todos"
                            onclick={clickTodos}
                            class={`
                                text-base bg-transparent rounded-lg
                                p-1 text-base flex flex-row
                                ${estilos.secundario}
                            `}
                        >
                            {#if todos}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="size-6"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                            {/if}
                            {#if ninguno}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="size-6"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                            {/if}
                            {#if algunos}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="size-6"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                            {/if}

                            <span class="mt-1"> Seleccionar todos </span>
                        </button>
                    </div>

                    {#each animalesrows as a}
                        <div
                            class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
                        >
                            <div class="block p-4">
                                <div
                                    class="flex justify-between items-start mb-2"
                                >
                                    <h3 class="font-medium">
                                        <button
                                            aria-label="fila"
                                            onclick={() => clickAnimal(a.id)}
                                            class={`
                                font-medium bg-transparent rounded-lg
                                px-3 py-3 text-base
                                ${selecthashmap[a.id] ? estilos.danger : estilos.primario}
                            `}
                                        >
                                            {#if selecthashmap[a.id]}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke-width="1.5"
                                                    stroke="currentColor"
                                                    class="size-6"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                    />
                                                </svg>
                                            {:else}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke-width="1.5"
                                                    stroke="currentColor"
                                                    class="size-6"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                    />
                                                </svg>
                                            {/if}
                                        </button>
                                        {shorterWord(a.caravana)}
                                    </h3>
                                    {#if a.sexo == "H" && a.prenada != 1}
                                        <div
                                            class={`badge badge-outline badge-${getEstadoColor(a.prenada)}`}
                                        >
                                            {getEstadoNombre(a.prenada)}
                                        </div>
                                    {/if}
                                </div>
                                <div class="grid grid-cols-2 gap-y-2">
                                    <div class="flex items-start">
                                        <span class="font-semibold"
                                            >{getSexoNombre(a.sexo)}</span
                                        >
                                    </div>
                                    <div class="flex items-start">
                                        <span>Categoría:</span>
                                        <span class="font-semibold">
                                            {a.categoria}
                                        </span>
                                    </div>
                                    <div class="flex items-start">
                                        <span>Lote:</span>
                                        <span class="font-semibold">
                                            {a.expand
                                                ? a.expand.lote
                                                    ? a.expand.lote.nombre
                                                    : ""
                                                : ""}
                                        </span>
                                    </div>
                                    <div class="flex items-start">
                                        <span>Rodeo:</span>
                                        <span class="font-semibold">
                                            {a.expand
                                                ? a.expand.rodeo
                                                    ? a.expand.rodeo.nombre
                                                    : ""
                                                : ""}
                                        </span>
                                    </div>
                                    <div class="flex items-start">
                                        <span>Raza:</span>
                                        <span class="font-semibold">
                                            {a.raza}
                                        </span>
                                    </div>
                                    <div class="flex items-start">
                                        <span>Color:</span>
                                        <span class="font-semibold">
                                            {a.color}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</Navbar2>
<dialog id="servicioMasivo" class="modal modal-middle rounded-xl">
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
        <h3 class="text-lg font-bold">Servicios</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-1">
            <div>
                <label for="fechadesde" class="label">
                    <span class="label-text text-base">Fecha desde</span>
                </label>
                <label class="input-group">
                    <input
                        id="fechadesde"
                        type="date"
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={fechadesdeserv}
                        onchange={() => input("DESDE")}
                    />
                    {#if malfechadese}
                        <div class="label">
                            <span class="label-text-alt text-red-500"
                                >Debe seleccionar la fecha inicial del servicio</span
                            >
                        </div>
                    {/if}
                </label>
            </div>
            <div>
                <label for="fechahasta" class="label">
                    <span class="label-text text-base">Fecha hasta</span>
                </label>
                <label class="input-group">
                    <input
                        id="fechahasta"
                        type="date"
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={fechahastaserv}
                    />
                </label>
            </div>
            <div>
                <label for="fechaparto" class="label">
                    <span class="label-text text-base">Fecha parto</span>
                </label>
                <label class="input-group">
                    <input
                        id="fechaparto"
                        type="date"
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={fechaparto}
                    />
                </label>
            </div>
            <div class="lg:col-span-2">
                <label for="toros" class="label">
                    <span class="label-text text-base">Toros</span>
                </label>
                <label class="input-group">
                    {#if cargadoanimales}
                        <MultipleToros
                            toros={padres}
                            bind:valor={padresserv}
                            bind:listavalores={padreslist}
                            agregarElemento={agregarPadre}
                            quitarElemento={quitarPadre}
                        />

                        {#if malpadre}
                            <div class="label">
                                <span class="label-text-alt text-red-500"
                                    >Debe seleccionar al menos un padre</span
                                >
                            </div>
                        {/if}
                    {/if}
                </label>
            </div>
            <div class="lg:col-span-2">
                <label for="observacion" class="label">
                    <span class="label-text text-base">Observación</span>
                </label>
                <input
                    id="obs"
                    type="text"
                    class={`
                        input 
                        input-bordered 
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                    bind:value={observaciongeneral}
                    oninput={inputObsGeneral}
                />
            </div>
        </div>
        <div class="block justify-items-center mx-1">
            {#each selectanimales as a, i}
                <div
                    class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
                >
                    <div class="block p-4">
                        <div class="grid grid-cols-1 gap-y-2">
                            <div class="flex items-start">
                                <span>Caravana:</span>
                                <span class="font-semibold">
                                    {shorterWord(a.caravana)}
                                </span>
                            </div>
                            <div class="flex items-start col-span-2">
                                <InfoAnimal animal={a} />
                            </div>
                            <div>
                                {#if cargadoanimales}
                                    <MultipleToros
                                        toros={padres}
                                        bind:valor={
                                            selectanimales[i].padresserv
                                        }
                                        bind:listavalores={
                                            selectanimales[i].padres
                                        }
                                    />
                                {/if}
                            </div>
                            <div class="flex items-start">
                                <input
                                    bind:value={selectanimales[i].observacion}
                                    placeholder="Observación"
                                    class={`
                                        h-12 border border-gray-300
                                        px-2 
                                        w-full
                                        rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        ${estilos.bgdark2}
                                    `}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <button
                    class="btn btn-success text-white"
                    disabled={!botonhabilitado}
                    onclick={guardar}>Guardar</button
                >
                <button class="btn btn-error text-white" onclick={() => {}}
                    >Cancelar</button
                >
            </form>
        </div>
    </div>
</dialog>
<dialog id="inseminacionMasiva" class="modal modal-middle rounded-xl">
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
        <h3 class="text-xl font-bold">Inseminaciones múltiples</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-1">
            <div>
                <label for="fechains" class="label">
                    <span class="label-text text-base">Fecha inseminación</span>
                </label>
                <label class="input-group">
                    <input
                        id="fechainseminacion"
                        type="date"
                        max={HOY}
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={fechainseminacion}
                        onchange={() => onInput("FECHA")}
                    />
                    {#if malfecha}
                        <div class="label">
                            <span class="label-text-alt text-red-500"
                                >Debe seleccionar la fecha de inseminacion</span
                            >
                        </div>
                    {/if}
                </label>
            </div>
            <div>
                <label for="fechaparto" class="label">
                    <span class="label-text text-base">Fecha parto</span>
                </label>
                <label class="input-group">
                    <input
                        id="fechains"
                        type="date"
                        max={HOY}
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        disabled
                        bind:value={fechaparto}
                    />
                </label>
            </div>
            {#if cargadoanimales}
                <PredictSelect
                    {onwrite}
                    {onelegir}
                    bind:valor={padre}
                    etiqueta={"Padre"}
                    bind:cadena={pajuela}
                    lista={listapadres}
                    size="w-1/2"
                />
            {/if}
            <div class="">
                <label for="obs" class="label">
                    <span class="label-text text-base">Observacion </span>
                </label>

                <input
                    id="observacion"
                    type="text"
                    class={`
                            input 
                            input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            w-full
                            ${estilos.bgdark2}
                        `}
                    bind:value={observaciongeneral}
                    oninput={inputObsGeneral}
                />
            </div>
        </div>
        <div class="block justify-items-center mx-1">
            {#each selectanimales as a, i}
                <div
                    class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
                >
                    <div class="block p-4">
                        <div class="grid grid-cols-1 gap-y-2">
                            <div class="flex items-start col-span-1">
                                <span>Caravana:</span>
                                <span class="font-semibold">
                                    {shorterWord(a.caravana)}
                                </span>
                            </div>
                            <div class="flex items-start col-span-2">
                                <InfoAnimal animal={a} />
                            </div>
                            <div class="flex items-start col-span-2">
                                {#if cargadoanimales}
                                    <PredictSelect
                                        bind:valor={selectanimales[i].padre}
                                        etiqueta={"Padre"}
                                        bind:cadena={selectanimales[i].pajuela}
                                        lista={listapadres}
                                    />
                                {/if}
                            </div>

                            <div class="flex items-start col-span-2">
                                <input
                                    bind:value={selectanimales[i].observacion}
                                    placeholder="Observación"
                                    class={`
                                    h-12 border border-gray-300
                                    px-2 
                                    w-full
                                    rounded-md
                                    focus:outline-none focus:ring-2 
                                    focus:ring-green-500 
                                    focus:border-green-500
                                    ${estilos.bgdark2}
                                `}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <button
                    class="btn btn-success text-white"
                    disabled={!botonhabilitado}
                    onclick={guardar}>Guardar</button
                >
                <button class="btn btn-error text-white" onclick={() => {}}
                    >Cancelar</button
                >
            </form>
        </div>
    </div>
</dialog>
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
