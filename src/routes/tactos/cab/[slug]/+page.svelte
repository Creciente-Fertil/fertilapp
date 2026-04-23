<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import CardTacto from "$lib/components/tactos/CardTacto.svelte";
    import RadioButton from "$lib/components/RadioButton.svelte";
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
    import tipostacto from "$lib/stores/tipostacto";
    import categorias from "$lib/stores/categorias";
    import DetalleTacto from "$lib/components/tactos/DetalleTacto.svelte";
    import estados from "$lib/stores/estados";
    import Success from "$lib/components/botones/Success.svelte";
    import { editTacto, eliminarTacto } from "$lib/java/tactos/tactosback";

    let versionjava = $state(false);
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();
    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    let per = createPer();
    let userpermisos = $state([]);
    let slug = $state("");

    function toggleJava() {
        versionjava = !versionjava;
    }

    let usuarioid = $state("");
    let defaultacto = {
        edit: false,
        idtacto: "",
        animal: "",
        caravana: "",
        fecha: "",
        observacion: "",
        prenada: 1,
        tipo: "",
        categoria: "",
        versionjava: false,
    };
    let detalletacto = $state({ ...defaultacto });
    let proxytacto = createStorageProxy("detalletacto", defaultacto);
    //Valores
    let edit = $state(false);
    let idtacto = $state("");
    let animal = $state("");
    let caravana = $state("");
    let fecha = $state("");
    let observacion = $state("");
    let prenada = $state("");
    let tipo = $state("");
    let categoria = $state("");
    //Validacione
    let malfecha = $state("");
    let botonhabilitado = $state(false);
    function loadTacto() {
        detalletacto = proxytacto.load();
        idtacto = detalletacto.idtacto;
        animal = detalletacto.animal;
        caravana = detalletacto.caravana;
        fecha = detalletacto.fecha;
        observacion = detalletacto.observacion;
        prenada = detalletacto.prenada;
        tipo = detalletacto.tipo;
        categoria = detalletacto.categoria;
        edit = detalletacto.edit;
        versionjava = detalletacto.versionjava;
    }
    function saveTacto() {
        detalletacto.idtacto = idtacto;
        detalletacto.animal = animal;
        detalletacto.caravana = caravana;
        detalletacto.fecha = fecha;
        detalletacto.observacion = observacion;
        detalletacto.prenada = prenada;
        detalletacto.tipo = tipo;
        detalletacto.categoria = categoria;
        versionjava = detalletacto.versionjava;
        proxytacto.save(detalletacto);
    }
    function validarBoton() {
        botonhabilitado = true;

        if (isEmpty(fecha)) {
            botonhabilitado = false;
        }
    }
    function oninput(inputName) {
        validarBoton();
        if (inputName == "FECHA") {
            if (isEmpty(fecha)) {
                malfecha = true;
            } else {
                malfecha = false;
            }
        }
    }
    async function editar() {
        if (!edit) {
            edit = true;
            return;
        }
        try {
            let data = {
                fecha: fecha + " 03:00:00",
                observacion,
                animal,
                categoria,
                prenada,
                tipo,
            };
            if (versionjava) {
                let data_java = {
                    animalId: animal,
                    date: fecha,
                    checkType: "ECOGRAFIA",
                    isPregnant: true,
                    notes: observacion,
                    establishmentId: 1,
                };
                await editTacto(idtacto, data_java);
            } else {
                const record = await pb
                    .collection("tactos")
                    .update(idtacto, data);
                await pb.collection("animales").update(animal, {
                    prenada,
                });
            }

            Swal.fire("Éxito guardar", "Se pudo guardar el tacto", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error guardar", "No se pudo guardar el tacto", "error");
        }
        volver();
    }
    function volver() {
        if (edit) {
            edit = false;
            return;
        }
        goto(pre + "/tactos/cab/");
    }
    function eliminar() {
        Swal.fire({
            title: "Eliminar tacto",
            text: "¿Seguro que deseas eliminar el tacto?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                let data = {
                    active: false,
                };
                try {
                    if (versionjava) {
                        await eliminarTacto(idtacto);
                    } else {
                        let recordaedit = await pb
                            .collection("tactos")
                            .update(idtacto, data);
                    }

                    Swal.fire(
                        "Tacto eliminado!",
                        "Se eliminó el tacto correctamente.",
                        "success",
                    );
                    proxytacto.save(defaultacto);
                    volver();
                } catch (e) {
                    Swal.fire(
                        "Acción cancelada",
                        "No se pudo eliminar el tacto",
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
        loadTacto();
    });
</script>

<Navbar2>
    <CardTacto cardsize="max-w-7xl">
        {#if esdev}
            <Success
                texto={versionjava ? "Cerrar java" : "Ver jjava"}
                onclick={toggleJava}
            />
        {/if}
        <DetalleTacto
            {edit}
            {idtacto}
            {caravana}
            bind:fecha
            bind:observacion
            bind:tipo
            {categoria}
            {malfecha}
            {oninput}
            {prenada}
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
        <!--Formulario-->
        <div class="form-control hidden">
            <label for="animal" class="label">
                <span class="label-text text-base">Animal: {caravana}</span>
            </label>

            <label for="tipo" class="label">
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
                >
                    {#each categorias.filter((c) => c.sexo == "H") as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
            </label>
            <div class="form-group">
                <label for="prenada" class="label">
                    <span class="label-text text-base">Estado</span>
                </label>

                <RadioButton
                    class="m-1 my-3"
                    bind:option={prenada}
                    deshabilitado={false}
                />
            </div>

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
                    onchange={() => oninput("FECHA")}
                />
                {#if malfecha}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar la fecha del tacto</span
                        >
                    </div>
                {/if}
            </label>
            <label for="tipo" class="label">
                <span class="label-text text-base">Tacto/Ecografia</span>
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
                >
                    {#each tipostacto as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
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
        <!--fin Formulario-->
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
    </CardTacto>
</Navbar2>
