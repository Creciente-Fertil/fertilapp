<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    //solo modifique el navbarr
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Swal from "sweetalert2";
    import PocketBase from "pocketbase";
    import { createRoler } from "$lib/stores/defaultrol.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { createCaber } from "$lib/stores/cab.svelte";

    import CardBase from "$lib/components/CardBase.svelte";
    import Colaboradores from "$lib/components/establecimiento/Colaboradores.svelte";
    import ListaColabs from "$lib/components/establecimiento/ListaColabs.svelte";
    import DetalleEstablecimiento from "$lib/components/establecimiento/DetalleEstablecimiento.svelte";
    //botones
    import Success from "$lib/components/botones/Success.svelte";
    import Danger from "$lib/components/botones/Danger.svelte";
    //permisos
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { usuario } from "$lib/stores/usuario";
    import {
        codigoSinRepetir,
        codigoSinRepetirEstablecimiento,
    } from "$lib/pbutils/lib";
    import provincias from "$lib/stores/geo/provincias";
    import localidades from "$lib/stores/geo/localidades";
    import estilos from "$lib/stores/estilos";
    import HorizontalTab from "$lib/components/establecimiento/HorizontalTab.svelte";
    import {
        getEstablishmentId,
        saveEstablishment,
    } from "$lib/java/establecimientos/establecimientosback";
    //Size
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1250);

    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let esdev = import.meta.env.VITE_DEV == "si";

    const pb = new PocketBase(ruta);
    const regexRenspa = /^\d{2}\.\d{3}\.\d\.\d{5}\.\d{2}$/;

    //ver java
    let versionjava = $state(false);
    async function toggleJava() {
        versionjava = !versionjava;
        await getCabaña()
    }
    let usuarioid = $state("");
    let cab = $state({
        exist: false,
        nombre: "",
        id: "",
    });
    let caber = createCaber();
    let per = createPer();
    let permisos = $state({});
    let colabs = $state([]);
    let modoedicion = $state(false);
    let pestañas = $state([
        { id: "datos", nombre: "Establecimiento" },
        { id: "colaboradores", nombre: "Colaboradores" },
    ]);
    let tab = $state("datos");
    let textodetalle = $state("Registra tu establecimiento");
    //Datos cabaña
    let nombre = $state("");
    let direccion = $state("");
    let contacto = $state("");
    let codigo = $state("");
    let renspa = $state("");
    let provincia = $state("");
    let localidad = $state("");
    let localidadesProv = $state([]);
    let telefono = $state("");
    let mail = $state("");
    let titular = $state("");
    let renspaValido = $state(true);
    //Datos viejos
    let datosviejos = $state({});
    //Desasociar
    let asociado = $state(false);
    let idestxcolab = $state("");
    //validar dato cabaña
    let malnombre = $state(false);
    let botonhabilitado = $state(false);
    function validarBotonNuevo() {
        if (nombre.trim().length > 0) {
            botonhabilitado = true;
        } else {
            botonhabilitado = false;
        }
    }
    function validarBotonEdit() {
        if (nombre.trim().length > 0) {
            botonhabilitado = true;
        } else {
            botonhabilitado = false;
        }
    }
    function onChangeNuevo(campo) {
        validarBotonNuevo();
        if (campo == "NOMBRE") {
            if (nombre.trim().length > 0) {
                malnombre = false;
            } else {
                malnombre = true;
            }
        }
    }
    function onChangeEdit(campo) {
        validarBotonEdit();
        if (campo == "NOMBRE") {
            if (nombre.trim().length > 0) {
                malnombre = false;
            } else {
                malnombre = true;
            }
        }
    }
    async function getCabaña() {
        if (versionjava) {
            let record = await getEstablishmentId(1);
            datosviejos = { ...record };
            nombre = record.nombre;
            textodetalle = nombre;
            direccion = record.direccion;
            contacto = record.contacto;
            codigo = record.codigo;
            contacto = record.contacto;
            renspa = record.renspa;
            localidad = record.localidad;
            provincia = record.provincia;
            telefono = record.telefono;
            mail = record.mail;
            localidadesProv = localidades.filter(
                (lo) => lo.idProv == provincia,
            );
            let data_est = {
                nombre: record.nombre,
                id: record.id,
                exist: true,
            };
            saveStorageEstablecimiento(data_est);
        } else {
            try {
                const record = await pb
                    .collection("cabs")
                    .getFirstListItem(`id='${cab.id}' && active=true`, {});
                datosviejos = { ...record };
                nombre = record.nombre;
                textodetalle = nombre;
                direccion = record.direccion;
                contacto = record.contacto;
                codigo = record.codigo;
                contacto = record.contacto;
                renspa = record.renspa;
                localidad = record.localidad;
                provincia = record.provincia;
                telefono = record.telefono;
                mail = record.mail;

                localidadesProv = localidades.filter(
                    (lo) => lo.idProv == provincia,
                );
                caber.setCab(record.nombre, record.id);
            } catch (err) {
                caber.setDefault();
                nombre = "";
                direccion = "";
                contacto = "";
                codigo = "";
                contacto = "";
                renspa = "";
                localidad = "";
                provincia = "";
                telefono = "";
                mail = "";
                goto(pre + "/");
            }
        }
    }
    async function getColabs() {
        const records = await pb.collection("estxcolabs").getFullList({
            expand: "colab",
            filter: `cab='${cab.id}'`,
            sort: "colab.apellido",
        });
        colabs = records;
    }

    async function guardarColab(data) {
        let listapermisos = getPermisosList(permisos.permisos);
        if (!listapermisos[0]) {
            Swal.fire("Error permisos", getPermisosMessage(0), "error");
            reestablercerCabaña();
            return;
        }
        let codigo = await codigoSinRepetir(pb);
        try {
            let userdata = {
                username: data.email.split("@")[0],
                email: data.email,
                emailVisibility: true,
                password: data.contra,
                passwordConfirm: data.contra,
                name: data.email,
                codigo: codigo,
                active: true,
            };
            const recorduser = await pb.collection("users").create(userdata);
            let colabdata = {
                nombre: data.nombre,
                apellido: data.apellido,
                telefono: data.telefono,
                user: recorduser.id,
            };
            const recordcolab = await pb
                .collection("colaboradores")
                .create(colabdata);
            let estxcolabdata = {
                colab: recordcolab.id,
                cab: cab.id,
            };
            const recordexc = await pb
                .collection("estxcolabs")
                .create(estxcolabdata);
            let permisosdata = {
                estxcolab: recordexc.id,
                permisos: "",
            };
            await pb.collection("permisos").create(permisosdata);

            await getColabs();
        } catch (err) {
            console.error(err);
        }
    }
    async function guardarCabaña() {
        if (versionjava) {
            const data = {
                nombre,
                direccion,
                user: usuarioid,
                active: true,
                contacto,
                renspa,
                localidad,
                provincia,
                telefono,
                mail,
                codigo: "",
            };
            textodetalle = nombre;
            try {
                const record = await saveEstablishment(data);
                Swal.fire(
                    "Exito guadar",
                    "Se pudo guardar la cabaña con éxito",
                    "success",
                );
                caber.setCab(nombre, record.id);
                per.setPer("0,1,2,3,4,5", usuarioid);
                goto(pre + "/");
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar la cabaña",
                    "error",
                );
            }
            renspaValido = true;
        } else {
            let codigo = await codigoSinRepetirEstablecimiento(pb);
            const data = {
                nombre,
                direccion,
                user: usuarioid,
                active: true,
                contacto,
                renspa,
                localidad,
                provincia,
                telefono,
                mail,
                codigo,
            };
            textodetalle = nombre;
            try {
                const record = await pb.collection("cabs").create(data);
                Swal.fire(
                    "Exito guadar",
                    "Se pudo guardar la cabaña con éxito",
                    "success",
                );
                caber.setCab(nombre, record.id);
                per.setPer("0,1,2,3,4,5", usuarioid);
                goto(pre + "/");
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar la cabaña",
                    "error",
                );
            }
            renspaValido = true;
        }
    }
    function reestablercerCabaña() {
        nombre = datosviejos.nombre;
        direccion = datosviejos.direccion;
        contacto = datosviejos.contacto;
        codigo = datosviejos.codigo;
        renspa = datosviejos.renspa;
        localidad = datosviejos.localidad;
        provincia = datosviejos.provincia;
        telefono = datosviejos.telefono;
        mail = datosviejos.mail;
        textodetalle = nombre;
    }
    async function editarCabaña() {
        let listapermisos = getPermisosList(permisos.permisos);
        if (!listapermisos[0]) {
            Swal.fire("Error permisos", getPermisosMessage(0), "error");
            reestablercerCabaña();
            return;
        }
        const data = {
            nombre,
            direccion,
            contacto,
            contacto,
            renspa,
            localidad,
            provincia,
            telefono,
            mail,
        };
        textodetalle = nombre;
        try {
            const record = await pb.collection("cabs").update(cab.id, data);
            Swal.fire(
                "Exito modificar",
                "Se pudo modificar la cabaña con éxito",
                "success",
            );
            caber.setCab(nombre, cab.id);
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error modificar",
                "No se pudo modificar la cabaña con éxito",
                "error",
            );
        }
        renspaValido = true;
    }
    async function desasociar() {
        await pb.collection("estxcolabs").delete(idestxcolab);
        try {
            const record = await pb
                .collection("cabs")
                .getFirstListItem(`user='${usuarioid}' && active=true`, {});
            caber.setCab(record.nombre, record.id);
            per.setPer("0,1,2,3,4,5", usuarioid);
        } catch (err) {
            try {
                //Revisa si sos colaborador
                const recordcab = await pb
                    .collection("estxcolabs")
                    .getFirstListItem(`colab.user='${usuarioid}'`, {
                        expand: "colab,cab,colab.user",
                    });
                const recordper = await pb
                    .collection("permisos")
                    .getFirstListItem(`estxcolab='${recordcab.id}'`);
                per.setPer(recordper.permisos, usuarioid);
                caber.setCab(
                    recordcab.expand.cab.nombre,
                    recordcab.expand.cab.id,
                );
            } catch (err) {
                caber.setDefault();
                per.setDefault();
            }
        }
        goto(pre + "/");
    }
    function mostrarcolab(data) {
        console.log("padre: " + data);
    }
    function getNombreProvincia(id) {
        let p = provincias.filter((pro) => pro.id == id)[0];
        if (p) {
            return p.nombre;
        } else {
            return "";
        }
    }
    function getNombreLocalidad(id) {
        let l = localidades.filter((lo) => lo.nombre == id)[0];
        if (l) {
            return l.nombre;
        } else {
            return "";
        }
    }
    function getLocalidades(idProv) {
        localidad = "";
        localidadesProv = localidades.filter((lo) => lo.idProv == idProv);
    }
    function escribirRenspa() {
        if (!renspaValido) {
            renspaValido = regexRenspa.test(renspa);
        }
    }
    onMount(async () => {
        cab = caber.cab;

        let pb_json = await JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        if (cab.exist) {
            permisos = per.per;
            await getCabaña();
            await getColabs();
            const recordcolab = await pb
                .collection("colaboradores")
                .getList(1, 1, {
                    filter: `user = '${usuarioid}'`,
                });
            if (recordcolab.items.length > 0) {
                const recordestxcolab = await pb
                    .collection("estxcolabs")
                    .getList(1, 1, {
                        filter: `colab = '${recordcolab.items[0].id}' && cab = '${cab.id}'`,
                    });
                if (recordestxcolab.items.length > 0) {
                    asociado = true;
                    idestxcolab = recordestxcolab.items[0].id;
                } else {
                    asociado = false;
                }
            } else {
                asociado = false;
            }
        }
    });
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <DetalleEstablecimiento {textodetalle}>
        {#if cab.exist}
            <HorizontalTab bind:pestañas bind:tab />
            {#if tab == "datos"}
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2">
                        <div class="pr-3">
                            <label for="renspa" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    RENSPA
                                </span>
                            </label>
                            {#if !modoedicion}
                                <label
                                    for="renspa"
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                                >
                                    {renspa}
                                </label>
                            {:else}
                                <label class="form-control">
                                    <input
                                        type="text"
                                        id="renspa"
                                        bind:value={renspa}
                                        required
                                        class={`
                                    w-full px-3 py-2 border rounded-md shadow-sm
                                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                    transition duration-150 ease-in-out
                                    border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    pl-2
                                `}
                                    />
                                    <div class="label">
                                        <span class="label-text-alt"
                                            >Formato: 00.000.0.00000.00</span
                                        >
                                    </div>
                                </label>
                            {/if}
                        </div>
                        <div class="pr-3">
                            <label for="nombre" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    NOMBRE*
                                </span>
                            </label>

                            {#if !modoedicion}
                                <label
                                    for="nombre"
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                                >
                                    {nombre}
                                </label>
                            {:else}
                                <input
                                    type="text"
                                    id="nombre"
                                    bind:value={nombre}
                                    required
                                    class={`
                                        w-full px-3 py-2 border rounded-md shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                        transition duration-150 ease-in-out
                                        border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    `}
                                    oninput={() => onChangeEdit("NOMBRE")}
                                />
                            {/if}
                            {#if malnombre}
                                <div class="label">
                                    <span class="label-text-alt text-red-500"
                                        >Debe escribir algún nombre</span
                                    >
                                </div>
                            {/if}
                        </div>
                        <div class="pr-3">
                            <label for="Provincia" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    Provincia
                                </span>
                            </label>
                            {#if !modoedicion}
                                <label
                                    for="Provincia"
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                                >
                                    {getNombreProvincia(provincia)}
                                </label>
                            {:else}
                                <label class="input-group">
                                    <select
                                        class={`
                                            select select-bordered w-full
                                            rounded-md
                                            focus:outline-none focus:ring-2 
                                            focus:ring-green-500 
                                            focus:border-green-500  
                                            ${estilos.bgdark2}
                                            pl-2
                                        `}
                                        bind:value={provincia}
                                        onchange={() =>
                                            getLocalidades(provincia)}
                                    >
                                        <option value="" class="rounded"
                                        ></option>
                                        {#each provincias as p}
                                            <option value={p.id} class="rounded"
                                                >{p.nombre}</option
                                            >
                                        {/each}
                                    </select>
                                </label>
                            {/if}
                        </div>
                        <div class="pr-3">
                            <label for="Localidad" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    Localidad
                                </span>
                            </label>
                            {#if !modoedicion}
                                <label
                                    for="Localidad"
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                                >
                                    {getNombreLocalidad(localidad)}
                                </label>
                            {:else}
                                <label class="input-group">
                                    <select
                                        class={`
                                            select select-bordered w-full
                                            rounded-md
                                            focus:outline-none focus:ring-2 
                                            focus:ring-green-500 
                                            focus:border-green-500
                                            
                                            ${estilos.bgdark2}
                                        `}
                                        bind:value={localidad}
                                    >
                                        <option value="" class="rounded"
                                        ></option>
                                        {#each localidadesProv as l}
                                            <option
                                                value={l.nombre}
                                                class="rounded"
                                                >{l.nombre}</option
                                            >
                                        {/each}
                                    </select>
                                </label>
                            {/if}
                        </div>
                        <div class="pr-3">
                            <label for="direccion" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    Dirección
                                </span>
                            </label>
                            {#if !modoedicion}
                                <label
                                    for="direccion"
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                                >
                                    {direccion}
                                </label>
                            {:else}
                                <input
                                    type="text"
                                    id="direccion"
                                    disabled={!modoedicion}
                                    bind:value={direccion}
                                    required
                                    class={`
                                        w-full px-3 py-2 border rounded-md shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                        transition duration-150 ease-in-out
                                        ${
                                            modoedicion
                                                ? "border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        }
                                    `}
                                />
                            {/if}
                        </div>
                        <div class="pr-3">
                            <label for="contacto" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    REDES
                                </span>
                            </label>
                            {#if !modoedicion}
                                <label
                                    for="contacto"
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                                >
                                    {contacto}
                                </label>
                            {:else}
                                <input
                                    type="text"
                                    id="contacto"
                                    disabled={!modoedicion}
                                    bind:value={contacto}
                                    required
                                    class={`
                                        w-full px-3 py-2 border rounded-md shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                        transition duration-150 ease-in-out
                                        ${
                                            modoedicion
                                                ? "border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        }
                                    `}
                                />
                            {/if}
                        </div>
                        <div class="pr-3">
                            <label for="Teléfono" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    TELÉFONO
                                </span>
                            </label>
                            {#if !modoedicion}
                                <label
                                    for="Teléfono"
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                                >
                                    {telefono}
                                </label>
                            {:else}
                                <input
                                    type="text"
                                    id="telefono"
                                    bind:value={telefono}
                                    required
                                    class={`
                                        w-full px-3 py-2 border rounded-md shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                        transition duration-150 ease-in-out
                                        ${
                                            modoedicion
                                                ? "border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        }
                                    `}
                                />
                            {/if}
                        </div>
                        <div class="pr-3">
                            <label for="Correo" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    CORREO
                                </span>
                            </label>
                            {#if !modoedicion}
                                <label
                                    for="Correo"
                                    class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                                >
                                    {mail}
                                </label>
                            {:else}
                                <input
                                    type="text"
                                    id="mail"
                                    bind:value={mail}
                                    required
                                    class={`
                                        w-full px-3 py-2 border rounded-md shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                        transition duration-150 ease-in-out
                                        ${
                                            modoedicion
                                                ? "border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        }
                                    `}
                                />
                            {/if}
                        </div>
                        <div class="pr-3">
                            <label for="codigo" class="label">
                                <span
                                    class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
                                >
                                    CÓDIGO TRANSFERENCIA
                                </span>
                            </label>
                            <label
                                for="codigo"
                                class={`text-lg ${estilos.labelcolor} py-0 my-0 pl-2`}
                            >
                                {codigo}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="mt-8 flex justify-end">
                    {#if !modoedicion}
                        <Success
                            texto={"Editar establecimiento"}
                            onclick={() => {
                                modoedicion = true;
                                botonhabilitado = true;
                            }}
                            disabled={false}
                            fuentesize="text-md"
                            fuentepeso="font-bold"
                            px="px-6"
                            py="py-0"
                            btn="btn"
                        />
                    {:else}
                        <Danger
                            onclick={() => {
                                reestablercerCabaña();
                                modoedicion = false;
                                botonhabilitado = false;
                            }}
                            texto="Cancelar"
                            fuentesize="text-md"
                            fuentepeso="font-bold"
                            px="px-6"
                            py="py-2"
                            btn="btn"
                        />
                        <Success
                            texto={"Editar establecimiento"}
                            onclick={async () => {
                                modoedicion = false;
                                await editarCabaña();
                            }}
                            disabled={!botonhabilitado}
                            fuentesize="text-md"
                            fuentepeso="font-bold"
                            px="px-6"
                            py="py-2"
                            btn="btn"
                        />
                    {/if}
                </div>
            {:else}
                <Colaboradores
                    bind:colabs
                    {mostrarcolab}
                    {guardarColab}
                    {desasociar}
                    {asociado}
                    cabid={cab.id}
                    {cab}
                    bind:permisos
                />
                <ListaColabs bind:colabs />
            {/if}
        {:else}
            <div class="space-y-4">
                <div>
                    <label
                        for="nombre"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Nombre*
                    </label>
                    <input
                        type="nombre"
                        id="nombre"
                        oninput={() => onChangeNuevo("NOMBRE")}
                        bind:value={nombre}
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                    {#if malnombre}
                        <div class="label">
                            <span class="label-text-alt text-red-500"
                                >Debe escribir algún nombre</span
                            >
                        </div>
                    {/if}
                </div>
                <div>
                    <label
                        for="direccion"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Dirección
                    </label>
                    <input
                        type="direccion"
                        id="direccion"
                        bind:value={direccion}
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
                <div>
                    <label
                        for="contacto"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Redes
                    </label>
                    <input
                        type="contacto"
                        id="contacto"
                        bind:value={contacto}
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
            </div>
            <div class="mt-8 flex justify-end">
                <Success
                    texto={"Guardar establecimiento"}
                    onclick={guardarCabaña}
                    disabled={!botonhabilitado}
                    fuentesize="text-md"
                    fuentepeso="font-bold"
                    px="px-6"
                    py="py-1"
                    btn="btn"
                />
            </div>
        {/if}
    </DetalleEstablecimiento>
</Navbar2>
