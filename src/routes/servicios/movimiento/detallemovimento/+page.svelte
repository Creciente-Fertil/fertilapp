<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import { onMount } from "svelte";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import { guardarHistorial } from "$lib/historial/lib";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { getPermisosCabUser } from "$lib/permisosutil/lib";
    import { createUserer } from "$lib/stores/user.svelte";
    import { goto } from "$app/navigation";
    import { isEmpty, addDays } from "$lib/stringutil/lib";
    import CardMovimiento from "$lib/components/servicios/CardMovimiento.svelte";
    import DetalleMovimiento from "$lib/components/servicios/DetalleMovimiento.svelte";
    import DetalleAnimalesMovimiento from "$lib/components/servicios/DetalleAnimalesMovimiento.svelte";
    import Buscador from "$lib/components/servicios/Buscador.svelte";
    import MultipleToros from "$lib/components/MultipleToros.svelte";
    import SelectToros from "$lib/components/SelectToros.svelte";
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    import InfoAnimal from "$lib/components/InfoAnimal.svelte";

    import Eye from "$lib/svgs/eye.svelte";
    import estilos from "$lib/stores/estilos";
    import ListaAnimales from "$lib/components/servicios/ListaAnimales.svelte";

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
    let usuarioid = $state("");
    let listaanimales = $state([]);
    let selecthashmap = $state({});
    let listapadres = $state([]);
    let padres = $state([]);
    //valores
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
    let proxymovimiento = $state({
        ...defaultmovimiento,
    });
    let proxy = createStorageProxy(
        "detallemovimientoservicio",
        defaultmovimiento,
    );
    //valores
    //general
    let animal = $state({});
    let esNatural = $state(true);
    let esservicio = $derived(esNatural);
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
    //Validaciones
    let malfechadese = $state(false);
    let malpadre = $state(false);
    let botonhabilitado = $state(false);
    let malfecha = $state(false);
    let cargadoanimales = $state(false);
    function quitarAnimal(id) {
        if (selecthashmap[id]) {
            delete selecthashmap[id];
            setDetalle();
            listaanimales = [];
            for (const [key, value] of Object.entries(selecthashmap)) {
                if (value != null) {
                    listaanimales.push(value);
                }
            }
        }
    }
    function setDetalle() {
        proxymovimiento.selecthashmap = selecthashmap;
        proxymovimiento.padre = padre;
        proxymovimiento.padres = padresserv;
        proxymovimiento.fechaparto = fechaparto;
        proxymovimiento.fechadesdeserv = fechadesdeserv;
        proxymovimiento.fechahastaserv = fechahastaserv;
        proxymovimiento.fechainseminacion = fechainseminacion;
        proxymovimiento.observacion = observaciongeneral;
        proxymovimiento.padreslist = padreslist;
        proxymovimiento.padresserv = padresserv;
        proxymovimiento.pajuela  = pajuela
        proxy.save(proxymovimiento);
    }
    function loadDetalle() {
        proxymovimiento = proxy.load();
        esNatural = proxymovimiento.esNatural;

        selecthashmap = proxymovimiento.selecthashmap;

        padresserv = proxymovimiento.padresserv;
        padreslist = proxymovimiento.padreslist;
        padre = proxymovimiento.padre;
        pajuela= proxymovimiento.pajuela;
        fechaparto = proxymovimiento.fechaparto;
        fechadesdeserv = proxymovimiento.fechadesdeserv;
        fechahastaserv = proxymovimiento.fechahastaserv;
        fechainseminacion = proxymovimiento.fechainseminacion;
        observaciongeneral = proxymovimiento.observacion;
        listaanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                let fila = value;
                if (esNatural) {
                    if (fila.padres.length == 0) {
                        fila.padres = padreslist;
                    }
                } else {
                    if (fila.padre.length == 0) {
                        fila.padre = padre;
                    }
                }
                if (fila.observacion.length == 0) {
                    fila.observacion = observaciongeneral;
                }

                listaanimales.push(fila);
            }
        }
        listaanimales.sort((a1, a2) =>
            a1.caravana.toLocaleLowerCase() < a2.caravana.toLocaleLowerCase()
                ? -1
                : 1,
        );
    }
    function validarBoton() {
        botonhabilitado = true;
        if (esservicio) {
            if (fechadesdeserv == "") {
                botonhabilitado = false;
            }
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
        if (!esservicio) {
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
                    for (let i = 0; i < listaanimales.length; i++) {
                        listaanimales[i].pajuela = pajuela;
                    }
                }
            }
        }
    }
    function onInput(campo) {
        input(campo);
        setDetalle();
    }
    function onelegir(id) {
        let p = listapadres.filter((pa) => pa.id == id)[0];
        for (let i = 0; i < listaanimales.length; i++) {
            listaanimales[i].pajuela = p.nombre;
            listaanimales[i].padre = id;
        }
        pajuela = p.nombre;
        onInput("PAJUELA");
    }
    function onwrite() {
        for (let i = 0; i < listaanimales.length; i++) {
            listaanimales[i].pajuela = pajuela;
        }
        onInput("PAJUELA");
    }
    function agregarPadre(id) {
        for (let i = 0; i < listaanimales.length; i++) {
            let servicio = listaanimales[i];
            if (!servicio.padres.includes(id)) {
                listaanimales[i].padres.push(id);
            }
        }

        setDetalle();
    }
    function quitarPadre(id) {
        for (let i = 0; i < listaanimales.length; i++) {
            let servicio = listaanimales[i];
            let idx = servicio.padres.findIndex((p) => p == id);
            if (idx != -1) {
                listaanimales[i].padres.splice(idx, 1);
            }
        }

        setDetalle();
    }
    function inputObsGeneral() {
        for (let i = 0; i < listaanimales.length; i++) {
            listaanimales[i].observacion = observaciongeneral;
        }
        setDetalle();
    }
    function verAnimal(id) {
        let a_idx = listaanimales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = listaanimales[a_idx];
            veranimal.showModal();
        }
    }
    function setDetalleDefault() {
        proxy.save(defaultmovimiento);
        loadDetalle();
    }
    async function mover() {
        if (listaanimales.length == 0) {
            Swal.fire("Sin madres", "No hay madres seleccionados", "error");
            return;
        }
        if (esservicio) {
            if (listapadres.length == 0) {
                Swal.fire("Sin padres", "No hay padres seleccionados", "error");
                return;
            }
            let errores = false;
            let serverrores = [];
            for (let i = 0; i < listaanimales.length; i++) {
                let servicio = listaanimales[i];
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
            for (let i = 0; i < listaanimales.length; i++) {
                let servicio = listaanimales[i];
                let i_error = serverrores.findIndex(
                    (pid) => pid == servicio.id,
                );
                if (i_error == -1) {
                    delete selecthashmap[servicio.id];
                }
            }
        } else {
            if (fechainseminacion == "") {
                Swal.fire(
                    "Error inseminaciones",
                    "Debe seleccionar una fecha",
                    "error",
                );
                esinseminacion = false;
                return;
            }
            let errores = false;
            let erroresins = [];
            for (let i = 0; i < listaanimales.length; i++) {
                let inseminacion = listaanimales[i];

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

            for (let i = 0; i < listaanimales.length; i++) {
                let inseminacion = listaanimales[i];
                let i_error = erroresins.findIndex(
                    (pid) => pid == inseminacion.id,
                );
                if (i_error == -1) {
                    delete selecthashmap[inseminacion.id];
                }
            }
        }
        setDetalleDefault();
        goto(pre + "/servicios");
    }
    function irAnimales() {
        goto(pre + "/servicios/movimiento");
    }
    function volver() {
        goto(pre + "/servicios/movimiento");
    }
    async function getAnimales() {
        const recordsa = await pb.collection("Animalestacto").getFullList({
            filter: `active=true && cab='${cab.id}'`,
            expand: "rodeo,lote,cab",
        });

        let animales = recordsa;
        animales.sort((a1, a2) =>
            a1.caravana.toLocaleLowerCase() > a2.caravana.toLocaleLowerCase()
                ? 1
                : -1,
        );

        padres = animales.filter((a) => a.sexo == "M");

        listapadres = padres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
        cargadoanimales = true;
    }

    onMount(async () => {
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        await getAnimales();
        loadDetalle();
    });
    let classbuscador = "container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4";
    let classmove = "container mx-auto py-3 px-4 max-w-6xl w-full";
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<!--Este va a ser el componente confirmar-->
<Navbar2>
    
    <div class={classmove}>
        
        <DetalleMovimiento
            {esNatural}
            {observaciongeneral}
            {fechaparto}
            {listapadres}
            {padres}
            {input}
            {onInput}
            {agregarPadre}
            {quitarPadre}
            {inputObsGeneral}
            {onwrite}
            {onelegir}
            {cargadoanimales}
            {mover}
            {volver}
            {fechadesdeserv}
            {fechahastaserv}
            {padreslist}
            {fechainseminacion}
            {padre}
            {pajuela}
        />
        
        <DetalleAnimalesMovimiento
            {esNatural}
            bind:selectanimales={listaanimales}
            {quitarAnimal}
            {listapadres}
            {padres}
            {cargadoanimales}
            {verAnimal}
            cambiar={setDetalle}
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
            <!-- Botón Editar -->
            <button
                class="
                    mt-2 px-10 py-2 bg-[#115642] text-white
                    font-medium rounded-full
                    shadow-sm hover:bg-green-700
                    transition-colors text-base
                    "
                onclick={mover}
            >
                Guardar
            </button>
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
