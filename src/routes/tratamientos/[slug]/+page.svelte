<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import CardTratamiento from "$lib/components/tratamientos/CardTratamiento.svelte";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import { isEmpty, capitalize } from "$lib/stringutil/lib";
    //permisos
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    //localstorage
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import categorias from "$lib/stores/categorias";
    import DetalleTratamiento from "$lib/components/tratamientos/DetalleTratamiento.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import {
    editTratamiento,
        eliminarTipo,
        eliminarTratamiento,
    } from "$lib/java/tratamientos/tratamientosback";
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();

    function toggleJava() {
        versionjava = !versionjava;
    }

    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    let per = createPer();
    let userpermisos = $state([]);
    let slug = $state("");

    let usuarioid = $state("");
    let tipos = $state([]);
    //Datos tratamiento
    let edit = $state(false);
    let idtratamiento = $state("");
    let animal = $state("");
    let caravana = $state("");
    let categoria = $state("");
    let fecha = $state("");
    let tipo = $state("");
    let observacion = $state("");
    //Validaciones
    let malfecha = $state(false);
    let maltipo = $state(false);
    let botonhabilitado = $state(false);
    let vaciotratamiento = {
        edit: false,
        idtratamiento: "",
        animal: "",
        caravana: "",
        categoria: "",
        fecha: "",
        tipo: "",
        observacion: "",
        tipos: [],
        versionjava: false,
        edit:false
    };
    let detalletratamiento = $state({ ...vaciotratamiento });
    let proxytratamiento = createStorageProxy(
        "detalletratamiento",
        vaciotratamiento,
    );
    function validarBoton() {
        botonhabilitado = true;

        if (isEmpty(tipo)) {
            botonhabilitado = false;
        }
        if (isEmpty(fecha)) {
            botonhabilitado = false;
        }
    }
    function oninput(campo) {
        validarBoton();

        if (campo == "FECHA") {
            if (isEmpty(fecha)) {
                malfecha = true;
            } else {
                malfecha = false;
            }
        } else if (campo == "TIPO") {
            if (isEmpty(tipo)) {
                maltipo = true;
            } else {
                maltipo = false;
            }
        }
    }
    function loadDetalle() {
        detalletratamiento = proxytratamiento.load();
        idtratamiento = detalletratamiento.idtratamiento;
        animal = detalletratamiento.animal;
        caravana = detalletratamiento.caravana;
        categoria = detalletratamiento.categoria;
        fecha = detalletratamiento.fecha;
        tipo = detalletratamiento.tipo;
        observacion = detalletratamiento.observacion;

        edit = detalletratamiento.edit;
        tipos = detalletratamiento.tipos;
        versionjava = detalletratamiento.versionjava;
        cargado = true;
    }
    function setDetalle() {}
    function volver() {
        if (edit) {
            edit = false;
            return;
        }
        goto(pre + "/tratamientos");
    }

    async function editar() {
        if (!edit) {
            edit = true;
            return;
        }
        try {
            let data = {
                //animal,
                categoria,
                tipo,
                observacion,
                fecha: fecha + " 03:00:00",
            };
            if (versionjava) {
                let data_java = {
                    animalId: animal,
                    establishmentId: 1,
                    treatmentTypeId: tipo,
                    treatmentDate: fecha,
                    notes: observacion,
                };
                await editTratamiento(idtratamiento,data_java)
            } else {
                const record = await pb
                    .collection("tratamientos")
                    .update(idtratamiento, data);
            }

            Swal.fire(
                "Éxito editar",
                "Se pudo editar el tratamiento con exito",
                "success",
            );
            volver();
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error editar",
                "Hubo un error para editar el tratamiento",
                "error",
            );
            volver();
        }
    }
    async function eliminar() {
        Swal.fire({
            title: "Eliminar tratamiento",
            text: "¿Seguro que deseas eliminar el tratamiento?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                let data = { active: false };
                try {
                    if (versionjava) {
                        await eliminarTratamiento(idtratamiento);
                    } else {
                        const record = await pb
                            .collection("tratamientos")
                            .update(idtratamiento, data);
                    }

                    Swal.fire(
                        "Éxito eliminar",
                        "Se pudo eliminar el tratamiento con exito",
                        "success",
                    );
                    volver();
                } catch (err) {
                    console.error(err);
                    Swal.fire(
                        "Error eliminar",
                        "Hubo un error para eliminar el tratamiento",
                        "error",
                    );
                    volver();
                }
            }
        });
    }
    onMount(async () => {
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        loadDetalle();
    });
</script>

<Navbar2>
    <CardTratamiento cardsize="max-w-7xl" {edit}>
        {#if esdev}
            <Success
                texto={versionjava ? "Cerrar java" : "Version java"}
                onclick={toggleJava}
            />
        {/if}
        <DetalleTratamiento
            {edit}
            {cargado}
            {caravana}
            {tipos}
            bind:categoria
            bind:fecha
            bind:tipo
            bind:observacion
            {malfecha}
            {maltipo}
            {oninput}
        />
        <!-- Botones alineados a la derecha, más bajos, en la parte inferior -->
        {#if edit}
            <div
                class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
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
                    Cancelar
                </button>

                <!-- Botón Editar -->
                <button
                    class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                    onclick={editar}
                >
                    Guardar cambios
                </button>
            </div>
        {:else}
            <div
                class="mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                <button
                    class="mt-2 px-10 py-2 bg-[#A94442] text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-base"
                    onclick={eliminar}
                >
                    Eliminar
                </button>

                <!-- Botón Editar -->
                <button
                    class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                    onclick={editar}
                >
                    Editar
                </button>
            </div>
        {/if}
        <div class="form-control hidden">
            <label for="madre" class="label">
                <span class="label-text text-base">Animal: {caravana}</span>
            </label>
            <label for="fecha" class="label">
                <span class="label-text text-base">Fecha</span>
            </label>
            <label class="input-group">
                <input
                    id="fecha"
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
                    bind:value={fecha}
                    onchange={() => oninput("FECHA")}
                />
                <div class={`label ${malfecha ? "" : "hidden"}`}>
                    <span class="label-text-alt text-red-400"
                        >Debe seleccionar la fecha</span
                    >
                </div>
            </label>
            <label for="categoria" class="label">
                <span class="label-text text-base">Categoria</span>
            </label>
            <label class="input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={categoria}
                    disabled
                >
                    {#each categorias as c}
                        <option value={c.id}>{c.nombre}</option>
                    {/each}
                </select>
            </label>

            <label for="tipo" class="label">
                <span class="label-text text-base">Tipo tratamiento</span>
            </label>
            <label class="input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={tipo}
                    onchange={() => oninput("TIPO")}
                >
                    {#each tipos as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
                <div class={`label ${maltipo ? "" : "hidden"}`}>
                    <span class="label-text-alt text-red-400"
                        >Debe seleccionar un tipo</span
                    >
                </div>
            </label>
            <label class="form-control">
                <div class="label">
                    <span class="label-text">Observacion</span>
                </div>
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
                    bind:value={observacion}
                />
            </label>
        </div>
        <!-- Botones alineados a la izquierda, más bajos, en la parte inferior -->
        <div class="mt-6 flex space-x-3 hidden">
            <!-- Botón Eliminar -->
            <button
                class="px-4 py-1.5 bg-red-700 text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-sm"
                onclick={eliminar}
            >
                Eliminar
            </button>

            <!-- Botón Cancelar -->
            <button
                class="px-4 py-1.5 bg-white text-gray-800 font-medium rounded-full shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                onclick={volver}
            >
                Cancelar
            </button>

            <!-- Botón Editar -->
            <button
                class="px-4 py-1.5 bg-green-800 text-white font-medium rounded-full shadow-sm hover:bg-green-900 transition-colors text-sm"
                onclick={editar}
            >
                Editar
            </button>
        </div>
    </CardTratamiento>
</Navbar2>
