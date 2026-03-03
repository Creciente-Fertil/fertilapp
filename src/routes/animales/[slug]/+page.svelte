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

    //Size
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1250);

    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    let pestañas = $state([]);
    let tab = $state("");
    let per = createPer();
    let userpermisos = $state([]);

    // Datos
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
        if (id == "") {
            madre = { id: -1 };
        } else {
            const record = await pb
                .collection("animales")
                .getOne(id, { expand: "lote,rodeo" });
            madre = record;
        }
    }
    async function getPadre(id) {
        if (id == "") {
            padre = { id: -1 };
        } else {
            const record = await pb
                .collection("animales")
                .getOne(id, { expand: "lote,rodeo" });
            padre = record;
        }
    }
    async function darBaja(fechafallecimiento, motivo) {
        if (!userpermisos[5]) {
            Swal.fire("Error permisos", getPermisosMessage(5), "error");
        }
        try {
            const data = {
                active: false,
                lote: "",
                rodeo: "",
                fechafallecimiento: fechafallecimiento + " 03:00:00",
                motivobaja: motivo,
            };
            await guardarHistorial(pb, slug);
            const record = await pb.collection("animales").update(slug, data);
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
    function openEliminarModal() {
        if (userpermisos[5]) {
            tab = "eliminar";
        } else {
            Swal.fire(
                "Sin permisos",
                "No tienes permisos para administrar animales",
                "error",
            );
        }
    }
    async function eliminar() {
        if (!userpermisos[5]) {
            Swal.fire("Error permisos", getPermisosMessage(5), "error");
        }

        try {
            const data = {
                delete: true,
                active: false,
                lote: "",
                rodeo: "",
            };

            const record = await pb.collection("animales").update(slug, data);
            Swal.fire(
                "Éxito eliminar",
                "Se pudo eliminar al animal",
                "success",
            );
            goto(pre + "/animales");
        } catch (err) {
            Swal.fire("Error eliminar", "No se eliminar al animal", "error");
        }
    }
    async function transferir(codigo) {
        if (!userpermisos[5]) {
            Swal.fire("Error permisos", getPermisosMessage(5), "error");
        }
        const resultcab = await pb.collection("cabs").getList(1, 1, {
            filter: `active = true && renspa = '${codigo}'`,
        });

        try {
            let data = {
                cab: resultcab.items[0].id,
                lote: "",
                rodeo: "",
            };

            const record = await pb.collection("animales").update(slug, data);

            let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));

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

    //*Transferir*/
    let codigo = $state("");
    let malcodigo = $state(false);
    let muchosrenspa = $state("");
    function openModalTransfer() {
        codigo = "";
        transferModal2.showModal();
    }
    async function transfer() {
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
    async function perfilAnimal(_id) {
        //slug = $page.params.slug;
        slug = _id;

        if (slug != "") {
            try {
                const recorda = await pb.collection("animales").getOne(slug, {
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
    }
    function calcularTabs() {
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
                { id: "historial", nombre: "Historial" },
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
                { id: "historial", nombre: "Historial" },
                //{ id: "eliminar", nombre: "Eliminar" },
                { id: "movimientos", nombre: "Movimientos" },
                //{ id: "transfer", nombre: "Transferencia" },
                { id: "acciones", nombre: "Acciones" },
            ];
        }
    }
    //Necesito una funcion que traiga toda la informacion del animal
    onMount(async () => {
        let _id = $page.params.slug;
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        await perfilAnimal(_id);

        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);
        per.setPer(respermisos.permisos, usuarioid);

        userpermisos = getPermisosList(per.per.permisos);
    });
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <DetalleAnimal {caravana}>
        {#if esdev}
            premisos {JSON.stringify(userpermisos, null, 2)}
        {/if}
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
                <CardAnimal cardsize="max-w-7xl" titulo="Pesajes">
                    <Pesajes
                        pesoanterior={peso}
                        bind:peso
                        {caravana}
                        bind:userpermisos
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
                    <HistoriaClinica 
                        {caravana}
                    />
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
                <CardAnimal cardsize="max-w-7xl" titulo="Movimientos">
                    <Movimientos />
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
