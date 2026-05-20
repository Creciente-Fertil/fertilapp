<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";

    import Header from "$lib/components/animal/Header.svelte";
    import DetalleAnimal from "$lib/components/animal/DetalleAnimal.svelte";
    import CardAnimal from "$lib/components/animal/CardAnimal.svelte";
    import DatosBasicos from "$lib/components/animal/DatosBasicos.svelte";
    import Pariciones from "$lib/components/animal/Pariciones.svelte";
    import Tactos from "$lib/components/animal/Tactos.svelte";
    import Historial from "$lib/components/animal/Historial.svelte";
    import { guardarHistorial } from "$lib/historial/lib";
    import Acciones from "$lib/components/animal/Acciones.svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import { navegarAPadre } from "$lib/geneologia/lib";
    //PERMISOS
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import Inseminaciones from "$lib/components/animal/Inseminaciones.svelte";
    import Tratamientos from "$lib/components/animal/Tratamientos.svelte";
    import Observaciones from "$lib/components/animal/Observaciones.svelte";
    import Pesajes from "$lib/components/animal/Pesajes.svelte";
    import HistoriaClinica from "$lib/components/animal/HistoriaClinica.svelte";
    import Eliminar from "$lib/components/animal/Eliminar.svelte";
    import Movimientos from "$lib/components/animal/Movimientos.svelte";
    import tiponoti from "$lib/stores/tiponoti";
    import Servicios from "$lib/components/animal/Servicios.svelte";
    import SelectTab from "$lib/components/animal/SelectTab.svelte";
    import HorizontalTabs from "$lib/components/animal/HorizontalTabs.svelte";
    import AccionesTab from "$lib/components/animal/AccionesTab.svelte";
    import Transferir from "$lib/components/animal/Transferir.svelte";
    import {
        darBajaAnimal,
        eliminarAnimalJava,
        getAnimalId,
        transferirAnimal,
    } from "$lib/java/animales/animalesback";
    import { getUser } from "$lib/userstorage/usersotrage";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    import { isEmpty } from "$lib/stringutil/lib";

    //ver java
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");

    async function toggleJava() {
        versionjava = !versionjava;
        await getData(slug);
    }

    //Size
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1250);

    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let caber = createCaber();
    let cab = $state(caber.cab);
    let cargado = $state(false);
    let pestañas = $state([]);
    let tab = $state("");
    let per = createPer();
    let userpermisos = $state([]);

    // Datos
    let add = $state(false);
    let animal = $state({});
    let slug = $state("");
    let caravana = $state("");
    let usuarioid = $state("");
    let active = $state(true);
    let fechanacimiento = $state("");
    let sexo = $state("");
    let nacimiento = $state("");
    let padre = $state({});
    let madre = $state({});
    let rodeo = $state("");
    let lote = $state("");
    let peso = $state(0);
    let rp = $state("");
    let categoria = $state("");
    let pariciones = $state([]);
    let fechafall = $state("");
    let motivobaja = $state("");
    let raza = $state("");
    let color = $state("");
    let connacimiento = $state(false);
    let nacimientoobj = $state({});
    let tactos = $state([]);
    let prenada = $state(0);
    let modohistoria = $state(false);
    //pesajes
    let pesajes = $state([])
    //nuevo
    let fecha = $state("");
    let pesoanterior = $state("");
    let pesonuevo = $state("")
    let malfecha = $state(false);
    let malpeso = $state(false);
    let botonhabilitado = $state(false);
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
    async function guardarPesaje() {
        if(versionjava){

        }
        else{

        }
    }
    function openNewModal() {
        malfecha = false;
        malpeso = false;
        botonhabilitado = false;
        pesonuevo = "";
        fecha = "";
        
        nuevoPesajePerfilAnimal.showModal();
    }
    //detalle
    let fechaedit = $state("");
    let pesonuevoedit = $state("");
    let pesoanterioredit = $state("");
    let idpesaje = $state("");
    function openDetalle(id) {
        idpesaje = id;
        
        detallePesajePerfilAnimal.showModal();
        return
        let pesaje = pesajes.filter((p) => p.id == idpesaje)[0];

        fechaedit = pesaje.fecha.split(" ")[0];
        pesoanterioredit = pesaje.pesoanterior;
        pesonuevoedit = pesaje.pesonuevo;

        detallePesajePerfilAnimal.showModal();
    }
    //pesajes chart

    //Geneologia
    const genealogiaStorage = createStorageProxy("genealogia_arbol", {
        progenitores: [],
        posicionActual: -1,
    });
    async function getPariciones(id) {
        const recordpariciones = await pb
            .collection("nacimientos")
            .getFullList({
                filter: `madre='${id}' || padre='${id}'`,
                sort: "-created",
            });
        pariciones = recordpariciones;
    }
    async function getTactos(id) {
        const recordtactos = await pb.collection("tactos").getFullList({
            filter: `animal='${id}'`,
            sort: "-created",
        });

        tactos = recordtactos;
    }
    async function getMadre(id) {
        if (versionjava) {
            if (id == "" || id == null) {
                madre = { id: -1 };
            } else {
                let record = await getAnimalId(id);
                madre = record;
                nacimientoobj.nombremadre = madre.caravana;
            }
        } else {
            if (id == "") {
                madre = { id: -1 };
            } else {
                const record = await pb
                    .collection("animales")
                    .getOne(id, { expand: "lote,rodeo" });
                madre = record;
            }
        }
    }
    async function getPadre(id) {
        if (versionjava) {
            if (id == "" || id == null) {
                padre = { id: -1 };
            } else {
                let record = await getAnimalId(id);
                padre = record;
                nacimientoobj.nombrepadre = padre.caravana;
            }
        } else {
            if (id == "") {
                padre = { id: -1 };
            } else {
                const record = await pb
                    .collection("animales")
                    .getOne(id, { expand: "lote,rodeo" });
                padre = record;
            }
        }
    }
    async function darBaja(fechafallecimiento, motivo) {
        //if (!userpermisos[5]) {
        //    Swal.fire("Error permisos", getPermisosMessage(5), "error");
        //}
        if (versionjava) {
            if (motivo == "fallecimiento") {
                let data_falle = {
                    date: fechafallecimiento,
                    animalId: slug,
                };
                try {
                    await darBajaAnimal(data_falle, motivo);
                    Swal.fire(
                        "Éxito dar baja",
                        "Se logró dar baja el animal",
                        "success",
                    );
                } catch (err) {
                    console.error(err);
                    Swal.fire(
                        "Error dar baja",
                        "No se logró dar baja el animal",
                        "error",
                    );
                }
            } else if (motivo == "venta") {
                let data_venta = {
                    saleDate: fechafallecimiento,
                    price: "0",
                    animalId: slug,
                };
                try {
                    await darBajaAnimal(data_venta, motivo);
                    Swal.fire(
                        "Éxito dar baja",
                        "Se logró dar baja el animal",
                        "success",
                    );
                } catch (err) {
                    console.error(err);
                    Swal.fire(
                        "Error dar baja",
                        "No se logró dar baja el animal",
                        "error",
                    );
                }
            }
        } else {
            try {
                const data = {
                    active: false,
                    lote: "",
                    rodeo: "",
                    fechafallecimiento: fechafallecimiento + " 03:00:00",
                    motivobaja: motivo,
                };
                await guardarHistorial(pb, slug);
                const record = await pb
                    .collection("animales")
                    .update(slug, data);
                Swal.fire(
                    "Éxito dar de baja",
                    "Se pudo dar de baja al animal",
                    "success",
                );
                goto(pre + "/animales");
            } catch (err) {
                Swal.fire(
                    "Error dar de baja",
                    "No se pudo dar de baja al animal",
                    "error",
                );
            }
        }
    }
    function openEliminarModal() {
        tab = "eliminar";
        //if (userpermisos[5]) {
        //    tab = "eliminar";
        //} else {
        //    Swal.fire(
        //        "Sin permisos",
        //        "No tienes permisos para administrar animales",
        //        "error",
        //    );
        //}
    }
    async function eliminar() {
        //if (!userpermisos[5]) {
        //    Swal.fire("Error permisos", getPermisosMessage(5), "error");
        //      return;
        //}
        if (versionjava) {
            try {
                await eliminarAnimalJava(slug);
                Swal.fire(
                    "Éxito eliminar",
                    "Se pudo eliminar al animal",
                    "success",
                );
                goto(pre + "/animales");
            } catch (err) {
                Swal.fire(
                    "Error eliminar",
                    "No se eliminar al animal",
                    "error",
                );
            }
        } else {
            try {
                const data = {
                    delete: true,
                    active: false,
                    lote: "",
                    rodeo: "",
                };

                const record = await pb
                    .collection("animales")
                    .update(slug, data);
                Swal.fire(
                    "Éxito eliminar",
                    "Se pudo eliminar al animal",
                    "success",
                );
                goto(pre + "/animales");
            } catch (err) {
                Swal.fire(
                    "Error eliminar",
                    "No se eliminar al animal",
                    "error",
                );
            }
        }
    }
    async function transferir(codigo) {
        //if (!userpermisos[5]) {
        //    Swal.fire("Error permisos", getPermisosMessage(5), "error");
        //    return
        //}
        if (versionjava) {
            let data_transfer = {
                renspaCode: codigo,
                animalId: slug,
            };
            try {
                let res = await transferirAnimal(data_transfer);

                goto(pre + "/animales");
                Swal.fire(
                    "Éxito transferencia",
                    "Se pudo transferir al animal",
                    "success",
                );
            } catch (err) {
                if (err.message == "transfer") {
                    Swal.fire(
                        "Error transferencia",
                        "El animal ya fue transferido",
                        "error",
                    );
                }
                if (err.message == "renspa") {
                    Swal.fire(
                        "Error transferencia",
                        "No hay un establecimiento con ese renspa",
                        "error",
                    );
                }
            }
        } else {
            const resultcab = await pb.collection("cabs").getList(1, 1, {
                filter: `active = true && renspa = '${codigo}'`,
            });

            try {
                let data = {
                    cab: resultcab.items[0].id,
                    lote: "",
                    rodeo: "",
                };

                const record = await pb
                    .collection("animales")
                    .update(slug, data);

                let pb_json = JSON.parse(
                    localStorage.getItem("pocketbase_auth"),
                );

                let origenusuarioid = pb_json.record.id;
                let datatrans = {
                    texto: "Se transfirió a " + codigo,
                    titulo: "Transferencia de 1 animal",
                    tipo: tiponoti[1].id,
                    origen: origenusuarioid,
                    destino: resultcab.items[0].user,
                    leido: false,
                };
                await pb.collection("notificaciones").create(datatrans);

                goto(pre + "/animales");
                Swal.fire(
                    "Éxito transferencia",
                    "Se pudo transferir al animal",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error transferencia",
                    "No se pudo transferir al animal",
                    "error",
                );
            }
        }
    }

    //*Transferir*/
    let codigo = $state("");
    let malcodigo = $state(false);
    let codigovacio = $state(true);
    let muchosrenspa = $state(false);
    function openModalTransfer() {
        codigo = "";
        transferModal2.showModal();
    }
    function onInputTransfer() {
        if (codigo.trim().length == 0) {
            codigovacio = true;
        } else {
            codigovacio = false;
        }
    }
    async function transfer() {
        onInputTransfer();
        if (codigovacio) {
            Swal.fire("Renspa vacio", "Debe escribir un renspa", "error");
            return;
        }
        if (versionjava) {
            Swal.fire({
                title: "Transferir animal",
                text: `¿Seguro que deseas transferir el animal ${caravana} a ${codigo}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: "No",
            }).then(async (result) => {
                if (result.value) {
                    await transferir(codigo);
                }
            });
        } else {
            const resultList = await pb.collection("cabs").getList(1, 1, {
                filter: `active = true && renspa = '${codigo}'`,
            });
            if (resultList.items.length == 0) {
                malcodigo = true;

                return;
            }
            if (resultList.totalItems > 1) {
                Swal.fire(
                    "Error transferencia",
                    "Hay varios establecimientos con ese RENSPA",
                    "error",
                );
                muchosrenspa = true;
                return;
            }
            transferModal2.close();

            Swal.fire({
                title: "Transferir animal",
                text: `¿Seguro que deseas transferir el animal ${caravana} a ${codigo}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: "No",
            }).then(async (result) => {
                if (result.value) {
                    await transferir(codigo);
                }
            });
        }
    }

    async function irPadre(_id) {
        //Revisar si esta en la cabaña
        //Lo idea seria poder ver los datos del animaal este donde este
        let recordxiste = await pb.collection("animales").getFullList({
            filter: `cab='${cab.id}' && id='${_id}'`,
            expand: "lote,rodeo,nacimiento",
            skipTotal: true,
        });
        if (recordxiste.length > 0) {
            genealogiaStorage.save({ progenitores: [], posicionActual: -1 });
            padre = recordxiste[0];
            navegarAPadre(animal.id, animal.caravana, animal);

            navegarAPadre(padre.id, padre.caravana, padre);

            goto(`${pre}/animales/geneologia`);
            //slug = $page.params.slug;
            //await perfilAnimal(_id)
            //window.location.reload();
        } else {
            Swal.fire(
                "Error padre",
                "No existe el animal en esta cabaña",
                "error",
            );
        }
    }
    function perfilNuevoAnimal() {
        animal = {};
        caravana = "";
        color = "";
        raza = "";
        active = "";
        fechanacimiento = "";
        nacimiento = "";
        nacimientoobj = {};

        peso = "";
        sexo = "h";
        rodeo = "";
        lote = "";
        categoria = "";
        prenada = 0;
        rp = "";
        fechafall = "";
        motivobaja = "";

        cargado = true;

        tab = "datos";
        calcularNuevasTabs();
    }
    async function perfilAnimal(_id) {
        //slug = $page.params.slug;
        slug = _id;
        if (!versionjava) {
            if (slug != "") {
                try {
                    const recorda = await pb
                        .collection("animales")
                        .getOne(slug, {
                            expand: "nacimiento",
                        });
                    animal = recorda;
                    caravana = recorda.caravana;
                    color = recorda.raza;
                    raza = recorda.color;
                    active = recorda.active;
                    fechanacimiento = recorda.fechanacimiento.split(" ")[0];

                    nacimiento = "";
                    nacimientoobj = {};
                    if (recorda.nacimiento != "") {
                        connacimiento = true;
                        nacimiento = recorda.nacimiento;
                        nacimientoobj = recorda.expand.nacimiento;
                        await getMadre(recorda.expand.nacimiento.madre);
                        await getPadre(recorda.expand.nacimiento.padre);
                    }
                    peso = recorda.peso;
                    sexo = recorda.sexo;
                    rodeo = recorda.rodeo;
                    lote = recorda.lote;
                    categoria = recorda.categoria;
                    prenada = recorda.prenada == 1 ? 0 : recorda.prenada;
                    rp = recorda.rp;
                    if (recorda.fechafallecimiento != "") {
                        fechafall = recorda.fechafallecimiento.split(" ")[0];
                        motivobaja = recorda.motivobaja;
                    }
                    cargado = true;
                    tab = "datos";
                    calcularTabs();
                } catch (err) {
                    Swal.fire("Error animal", "No existe el animal", "error");
                }
            }
        } else {
            if (slug != "") {
                let recorda = await getAnimalId(slug);

                animal = recorda;
                caravana = recorda.caravana;
                color = recorda.raza;
                raza = recorda.color;
                active = recorda.active;
                fechanacimiento =
                    recorda.fechanacimiento &&
                    recorda.fechanacimiento.length > 0
                        ? recorda.fechanacimiento.split(" ")[0]
                        : "";

                nacimiento = "";
                nacimientoobj = {};
                if (recorda.nacimiento != "" && recorda.nacimiento != null) {
                    connacimiento = true;
                    nacimiento = recorda.nacimiento;

                    nacimientoobj = recorda.expand.nacimiento;
                    
                    await getMadre(recorda.expand.nacimiento.madre);
                    await getPadre(recorda.expand.nacimiento.padre);
                }
                peso = recorda.peso;
                sexo = recorda.sexo;
                rodeo = recorda.rodeo;
                lote = recorda.lote;
                categoria = recorda.categoria;
                prenada = recorda.prenada == 1 ? 0 : recorda.prenada;
                rp = recorda.rp;
                if (
                    recorda.fechafallecimiento != "" &&
                    recorda.fechafallecimiento != null
                ) {
                    fechafall = recorda.fechafallecimiento.split(" ")[0];
                    motivobaja = recorda.motivobaja;
                }
                cargado = true;
                tab = "datos";
                calcularTabs();
            }
        }
    }
    function calcularNuevasTabs() {
        pestañas = [];
    }
    function calcularTabs() {
        if (add) {
            calcularNuevasTabs();
            return;
        }
        if (sexo.toLowerCase() == "h") {
            pestañas = [
                { id: "datos", nombre: "Datos básicos" },
                { id: "pesajes", nombre: "Pesajes" },
                //{ id: "tratamientos", nombre: "Tratamientos" },
                //{ id: "observaciones", nombre: "Observaciones" },
                //{ id: "pariciones", nombre: "Pariciones" },
                //{ id: "tactos", nombre: "Tactos" },
                //{ id: "servicios", nombre: "Servicios" },
                { id: "clinica", nombre: "Historia clínica" },
                //{ id: "historial", nombre: "Historial" },
                //{ id: "eliminar", nombre: "Eliminar" },
                { id: "movimientos", nombre: "Movimientos" },
                //{ id: "transfer", nombre: "Transferencia" },
                { id: "acciones", nombre: "Acciones" },
            ];
        } else {
            pestañas = [
                { id: "datos", nombre: "Datos básicos" },
                { id: "pesajes", nombre: "Pesajes" },
                //{ id: "tratamientos", nombre: "Tratamientos" },
                //{ id: "observaciones", nombre: "Observaciones" },
                { id: "clinica", nombre: "Historia clínica" },
                //{ id: "historial", nombre: "Historial" },
                //{ id: "eliminar", nombre: "Eliminar" },
                { id: "movimientos", nombre: "Movimientos" },
                //{ id: "transfer", nombre: "Transferencia" },
                { id: "acciones", nombre: "Acciones" },
            ];
        }
    }
    async function getData() {
        if (versionjava) {
            let _id = $page.params.slug;
            let user_data = getUser();
            usuarioid = user_data.id;

            cab = loadStorageEstablecimiento();
            if (_id == "0") {
                add = true;
                perfilNuevoAnimal();
            } else {
                await perfilAnimal(_id);
            }

            userpermisos = [];
        } else {
            let _id = $page.params.slug;
            let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
            usuarioid = pb_json.record.id;
            if (_id == "0") {
                add = true;
                perfilNuevoAnimal();
            } else {
                await perfilAnimal(_id);
            }

            let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);
            per.setPer(respermisos.permisos, usuarioid);

            userpermisos = getPermisosList(per.per.permisos);
        }
    }
    //Necesito una funcion que traiga toda la informacion del animal
    onMount(async () => {
        await getData();
    });
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <DetalleAnimal {caravana} {add}>
        {#if esdev}
            premisos {JSON.stringify(userpermisos, null, 2)}

            <button
                class={`
                    ${estilos.btnbuscador}
                    ${estilos.btntextbuscador}
                `}
                onclick={toggleJava}
            >
                {#if versionjava}
                    <span class="text-lg">Cerrar java</span>
                {:else}
                    <span class="text-lg">Ver java</span>
                {/if}
            </button>
        {/if}
        {#if !add}
            <div class="flex justify-center mt-1">
                <div class="w-full max-w-7xl px-4">
                    <!-- Combo alineado al borde izquierdo de la card -->
                    {#if esCelu}
                        <SelectTab bind:pestañas bind:tab />
                    {:else}
                        <HorizontalTabs bind:pestañas bind:tab />
                    {/if}
                </div>
            </div>
        {/if}

        {#if cargado}
            {#if tab == "datos"}
                <!--Datos animal-->
                <CardAnimal cardsize="max-w-7xl" titulo="">
                    <DatosBasicos
                        bind:rp
                        bind:peso
                        bind:prenada
                        bind:categoria
                        bind:lote
                        bind:rodeo
                        bind:sexo
                        bind:caravana
                        bind:connacimiento
                        bind:raza
                        bind:color
                        bind:nacimiento={nacimientoobj}
                        bind:padreobj={padre}
                        bind:madreobj={madre}
                        bind:fechanacimiento
                        bind:modohistoria
                        bind:userpermisos
                        {irPadre}
                        {calcularTabs}
                        {esCelu}
                        {openEliminarModal}
                        {add}
                        {versionjava}
                    />
                </CardAnimal>
                <div class="hidden">
                    <CardAnimal cardsize="max-w-7xl" titulo="Acciones">
                        <Acciones
                            {caravana}
                            bind:fechafallecimiento={fechafall}
                            bind:motivo={motivobaja}
                            bajar={async (fechafallecimiento, motivo) =>
                                await darBaja(fechafallecimiento, motivo)}
                            {eliminar}
                            transferir={async (codigo) =>
                                await transferir(codigo)}
                        />
                    </CardAnimal>
                </div>
            {:else if tab == "pesajes"}
                <!--Pesajes-->
                <CardAnimal cardsize="max-w-7xl">
                    <Pesajes
                        pesoanterior={peso}
                        bind:peso
                        {caravana}
                        bind:userpermisos
                        {versionjava}
                        {cab}
                        {openNewModal}
                        {pesajes}
                        {openDetalle}
                    ></Pesajes>
                </CardAnimal>
            {:else if tab == "tratamientos"}
                <!--Tipos y tratamientos-->
                <CardAnimal cardsize="max-w-7xl" titulo="Tratamientos">
                    <Tratamientos cabid={cab.id} {categoria} bind:userpermisos
                    ></Tratamientos>
                </CardAnimal>
            {:else if tab == "observaciones"}
                <!--Observaciones-->
                <CardAnimal cardsize="max-w-7xl" titulo="Observaciones">
                    <Observaciones
                        cabid={cab.id}
                        {categoria}
                        bind:userpermisos
                    />
                </CardAnimal>
            {:else if tab == "pariciones"}
                <!--Animales nacimientos-->
                <CardAnimal cardsize="max-w-7xl" titulo="Pariciones">
                    <Pariciones
                        cabid={cab.id}
                        sexoanimal={sexo}
                        bind:prenada
                        bind:userpermisos
                    />
                </CardAnimal>
            {:else if tab == "tactos"}
                <!--Tactos-->
                <CardAnimal cardsize="max-w-7xl" titulo="Tactos">
                    <Tactos
                        cabid={cab.id}
                        bind:prenadaori={prenada}
                        {categoria}
                        bind:userpermisos
                    />
                </CardAnimal>
            {:else if tab == "servicios"}
                <!--Animales servicios-->
                <CardAnimal
                    cardsize="max-w-7xl"
                    titulo="Inseminaciones y Servicios"
                >
                    <Servicios cabid={cab.id} {categoria} bind:userpermisos />
                </CardAnimal>
            {:else if tab == "clinica"}
                <!--Pesajes, tactos, servicios, tratamientos, observaciones,pariciones-->
                <CardAnimal cardsize="max-w-7xl" titulo="">
                    <HistoriaClinica {caravana} {cab} {versionjava} />
                </CardAnimal>
            {:else if tab == "historial"}
                <!--Historial del animal-->
                <CardAnimal cardsize="max-w-7xl" titulo="Historial">
                    <Historial />
                </CardAnimal>
            {:else if tab == "eliminar"}
                <CardAnimal cardsize="max-w-7xl" titulo="Eliminar">
                    <Eliminar
                        {caravana}
                        bind:fechafallecimiento={fechafall}
                        bind:motivo={motivobaja}
                        bajar={async (fechafallecimiento, motivo) =>
                            await darBaja(fechafallecimiento, motivo)}
                        {eliminar}
                    />
                </CardAnimal>
            {:else if tab == "movimientos"}
                <CardAnimal cardsize="max-w-7xl">
                    <Movimientos {caravana} {animal} {cab} {versionjava} />
                </CardAnimal>
            {:else if tab == "transfer"}
                <CardAnimal cardsize="max-w-7xl" titulo="Transferencia">
                    <Transferir
                        {caravana}
                        openModal={openModalTransfer}
                        {transfer}
                        bind:codigo
                        {muchosrenspa}
                        {malcodigo}
                    />
                </CardAnimal>
            {:else if tab == "acciones"}
                <CardAnimal cardsize="max-w-7xl" titulo="Acciones">
                    <AccionesTab
                        {caravana}
                        bind:fechafallecimiento={fechafall}
                        bind:motivo={motivobaja}
                        bajar={async (fechafallecimiento, motivo) =>
                            await darBaja(fechafallecimiento, motivo)}
                        {eliminar}
                        openModal={openModalTransfer}
                        {transfer}
                        bind:codigo
                        {muchosrenspa}
                        {malcodigo}
                        {codigovacio}
                        {versionjava}
                        {onInputTransfer}
                    />
                </CardAnimal>
            {/if}
        {/if}
    </DetalleAnimal>
</Navbar2>

<dialog
    id="eliminarModal"
    class="
            modal modal-top mt-10 ml-5
            lg:items-start
            rounded-xl
            lg:modal-middle
        "
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

        <h3 class="text-lg font-bold">Eliminar</h3>

        <div class="form-control">Eliminar</div>

        <div class="modal-action justify-end">
            <form method="dialog">
                <!-- if there is a button, it will close the modal -->
                <button class="btn btn-error text-white">Cancelar</button>
            </form>
        </div>
    </div>
</dialog>
<dialog
    id="transferModal2"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div class="modal-box w-11/12 max-w-xl bg-white dark:bg-gray-800">
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <!--<h3 class="text-lg font-bold">Buscar cabañas</h3> -->
        <div class="form-control p-8 w-full">
            <h2
                class="text-xl font-bold text-green-700 dark:text-green-400 mb-6 text-start"
            >
                RENSPA
            </h2>
            <input
                id="token"
                type="text"
                class={`
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    flex-grow
                    ${estilos.bgdark2}
                `}
                bind:value={codigo}
            />
            {#if malcodigo}
                <div class="label">
                    <span class="label-text-alt text-red-500"
                        >No existe un establecimiento con ese renspa</span
                    >
                </div>
            {/if}
            {#if muchosrenspa}
                <div class="label">
                    <span class="label-text-alt text-red-500"
                        >Hay varios establecimientos con ese renspa</span
                    >
                </div>
            {/if}
            <button
                class="mt-1 btn btn-success text-white text-xl"
                onclick={transfer}>Transferir</button
            >
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <!-- if there is a button, it will close the modal -->

                <button class="btn btn-error text-white">Cerrar</button>
            </form>
        </div>
    </div>
</dialog>
<!--Pesajes-->
<dialog
    id="nuevoPesajePerfilAnimal"
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
                onclick={() => nuevoPesajePerfilAnimal.close()}>Cancelar</button
            >
        </div>
    </div>
</dialog>
<dialog
    id="detallePesajePerfilAnimal"
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
