<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Swal from "sweetalert2";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createDarker } from "$lib/stores/dark.svelte";
    import CardBase from "$lib/components/CardBase.svelte";
    import estilos from "$lib/stores/estilos";
    import { usuario } from "$lib/stores/usuario";
    import { enabled } from "$lib/stores/enabled";
    import { getUser } from "$lib/userstorage/usersotrage";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    import { editUser, getUserId, processUser } from "$lib/java/usuarios/usuariosback";
    import Success from "$lib/components/botones/Success.svelte";
    import Danger from "$lib/components/botones/Danger.svelte";
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let usuarioid = $state("");
    let tokencolab = $state("");
    let username = $state("");
    let usermail = $state("");
    let totalanimales = $state(0);
    let totalesta = $state(0);
    let nombre = $state("");
    let nivel = $state("");
    let apellido = $state("");
    let viejacontra = $state("");
    let malviejacontra = $state("");
    let contra = $state("");
    let confcontra = $state("");
    let malcontra = $state("");
    let malconfcontra = $state("");
    let botonhabilitado = $state(false);
    let olddata = $state({});
    let darker = createDarker();
    let modoedicion = $state(false);

    async function toggleJava() {
        versionjava = !versionjava;
        await getData();
    }

    let cab = $state({
        exist: false,
        nombre: "",
        id: "",
    });

    async function editarUsuario() {
        const data = {
            username,
            nombre,
            apellido,
        };
        try {
            if (versionjava) {
                let new_data = { ...olddata };
                new_data.firstName = nombre;
                new_data.lastName = apellido;
                new_data.username = username;
                await editUser(new_data, usuarioid);
            } else {
                const record = await pb
                    .collection("users")
                    .update(usuarioid, data);
                const colabs = await pb
                    .collection("colaboradores")
                    .getList(1, 1, {
                        filter: `user = '${usuarioid}'`,
                        skipTotal: false,
                    });
                if (colabs.items.length > 0) {
                    await pb
                        .collection("colaboradores")
                        .update(colabs.items[0].id, { nombre, apellido });
                }
            }

            Swal.fire(
                "Exito modificar",
                "Se pudo modificar el usuario con éxito",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error modificar",
                "No se pudo modificar el usuario con éxito",
                "error",
            );
        }
    }
    function cerrarModal() {
        contra = "";
        confcontra = "";
        viejacontra = "";
        modalCambioContra.close();
    }
    function openCambioContra() {
        contra = "";
        confcontra = "";
        viejacontra = "";
        modalCambioContra.showModal();
    }
    function validarBoton() {
        botonhabilitado = true;
        if (contra == "" || contra.length < 10) {
            botonhabilitado = false;
        }
        if (viejacontra == "") {
            botonhabilitado = false;
        }
        if (contra != confcontra) {
            botonhabilitado = false;
        }
    }
    function onchange(campo) {
        validarBoton();
        if (campo == "CONTRA") {
            if (contra == "" || contra.length < 10) {
                malcontra = true;
            } else {
                malcontra = false;
            }
        }
        if (campo == "CONF") {
            if (contra != confcontra) {
                malconfcontra = true;
            } else {
                malconfcontra = false;
            }
        }
        if (campo == "ANTERIOR") {
            if (viejacontra == "") {
                malviejacontra = true;
            } else {
                malviejacontra = false;
            }
        }
    }
    async function cambiarContra() {
        const data = {
            password: contra,
            passwordConfirm: confcontra,
            oldPassword: viejacontra,
        };

        try {
            const record = await pb.collection("users").update(usuarioid, data);
            Swal.fire(
                "Exito cambio de contraseña",
                "Se pudo cambiar la contraseña",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error cambio de contraseña",
                "No se pudo cambiar la contraseña",
                "error",
            );
        }
    }
    async function eliminarCuenta() {
        let html = `
            Estas apunto de eliminar la cuenta y sus datos,
            <br>
            Solo se mantendra los datos de animales transferidos a otro establecimiento.
            <br>
            Ante la duda comunicarse con aplicacionfertil@gmail.com
        `;
        Swal.fire({
            title: "¿Seguro que deseas eliminar la cuenta?",
            html,
            showDenyButton: true,
            showCancelButton: true,
            showConfirmButton: false,
            //confirmButtonText: "Confirmación",
            cancelButtonText: `Cancelar`,
            denyButtonText: `Eliminar`,
        }).then(async (result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isDenied) {
                Swal.fire("Eliminada!", "", "success");
                let data = { active: false };
                const record = await pb
                    .collection("users")
                    .update(usuarioid, data);
                pb.authStore.clear();
                usuario.set("");
                enabled.set("no");
                goto(pre + "/");
            } else if (result.isDenied) {
            }
        });
    }
    async function getData() {
        if (versionjava) {
            let usuario = getUser();
            usuarioid = usuario.id;
            let user_java = await getUserId(usuarioid);
            olddata = user_java;
            let user_data = processUser(user_java);
            usermail = user_data.email;
            username = user_data.username;
            nombre = user_data.nombre;
            apellido = user_data.apellido;
            totalanimales = 0;
            totalesta = 0;
            nivel = user_data.nivel;

            tokencolab = "";
            cab = loadStorageEstablecimiento();
        } else {
            let caber = createCaber();
            let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
            usuarioid = pb_json.record.id;
            usermail = pb_json.record.email;
            username = pb_json.record.username;
            nombre = pb_json.record.nombre;
            apellido = pb_json.record.apellido;

            //const record = await pb.collection("users").getOne(usuarioid);

            //nivel = record.nivel;
            nivel = pb_json.record.nivel;

            tokencolab = pb_json.record.codigo;
            cab = caber.cab;
            const resans = await pb.collection("Animalesxuser").getList(1, 1, {
                filter: `user='${usuarioid}' && active = true`,
            });
            const rescab = await pb.collection("cabs").getList(1, 1, {
                filter: `user = '${usuarioid}' && active = true`,
            });
            totalanimales = resans.totalItems;
            totalesta = rescab.totalItems;
        }
    }
    onMount(async () => {
        await getData();
    });
</script>

<Navbar2>
    {#if esdev}
        <Success
            texto={versionjava ? "Cerrar java" : "Ver java"}
            onclick={toggleJava}
        />
    {/if}
    <CardBase titulo="Configuración" cardsize="max-w-5xl">
        <div class="rounded-2xl shadow p-6 mb-6 text-xl">
            <h2
                class="text-xl font-semibold dark:from-gray-900 dark:to-gray-800 mb-3"
            >
                Datos personales
            </h2>
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div>
                        <label
                            for="nombre"
                            class={`block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            Nombre de usuario
                        </label>
                        {#if !modoedicion}
                            <label
                                for="nombre"
                                class={`block text-md font-medium text-gray-700 dark:text-gray-300 mb-1`}
                            >
                                {username}
                            </label>
                        {:else}
                            <input
                                type="text"
                                id="usernombre"
                                bind:value={username}
                                required
                                class={`
                            w-full px-3 py-2 border rounded-md shadow-sm
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            transition duration-150 ease-in-out
                            border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                        `}
                            />
                        {/if}
                    </div>
                    <div>
                        <label
                            for="nombre"
                            class={`block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            Nombre
                        </label>
                        {#if !modoedicion}
                            <label
                                for="nombre"
                                class={`block text-md font-medium text-gray-700 dark:text-gray-300 mb-1`}
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
                            />
                        {/if}
                    </div>
                    <div>
                        <label
                            for="apellido"
                            class={`block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            Apellido
                        </label>
                        {#if !modoedicion}
                            <label
                                for="nombre"
                                class={`block text-md font-medium text-gray-700 dark:text-gray-300 mb-1`}
                            >
                                {apellido}
                            </label>
                        {:else}
                            <input
                                type="text"
                                id="apellido"
                                bind:value={apellido}
                                required
                                class={`
                            w-full px-3 py-2 border rounded-md shadow-sm
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            transition duration-150 ease-in-out
                            border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                        `}
                            />
                        {/if}
                    </div>
                    <div>
                        <label
                            for="mail"
                            class={`block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            Correo
                        </label>
                        <label
                            for="mail"
                            class={`block text-md font-medium text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            {usermail}
                        </label>
                    </div>
                    <div>
                        <label
                            for="codigo "
                            class={`mt-2 block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            Codigo de colaboracion
                        </label>
                        <label
                            for="codigo"
                            class={`mt-2 block text-md font-medium text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            {tokencolab}
                        </label>
                    </div>
                </div>
            </div>
            <div class="mt-8 flex justify-end mb-3 gap-2">
                {#if !modoedicion}
                    <Success
                        texto="Editar información personal"
                        onclick={() => (modoedicion = true)}
                    />
                {:else}
                    <Danger
                        texto="Cancelar"
                        onclick={() => (modoedicion = false)}
                    />

                    <Success
                        onclick={async () => {
                            modoedicion = false;
                            await editarUsuario();
                        }}
                        texto="Guardar"
                    />
                {/if}
            </div>
        </div>
        <div class="rounded-2xl shadow p-6 mb-6">
            <h2 class="text-xl font-semibold">Seguridad</h2>
            <div class="grid grid-cols-1 mt-2 gap-1">
                <!--<div class="mt-2 flex justify-start">-->
                <div class="">
                    <div class="flex justify-end">
                        <Success
                            onclick={openCambioContra}
                            texto="Cambiar contraseña"
                        />
                    </div>

                    <div
                        class="
                            bg-red-50 border border-red-300 rounded-2xl p-5 mt-10
                            dark:bg-red-900/20 dark:border-red-700
                            transition-colors duration-300 ease-in-out
                        "
                    >
                        <h2
                            class="
                                text-lg font-semibold text-red-600 mb-2
                                dark:text-red-400
                            "
                        >
                            Eliminar cuenta
                        </h2>

                        <p
                            class="
                                text-sm text-gray-600 mb-4
                                dark:text-gray-400
                            "
                        >
                            Esta acción eliminará permanentemente todos tus
                            datos y no podrá deshacerse.
                        </p>
                        <div class="flex justify-end">
                            <Danger texto="Eliminar" onclick={eliminarCuenta} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="rounded-2xl shadow p-6 mb-6">
            <h2 class="text-xl font-semibold">Plan</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
                <div>
                    <label
                        for="nivel "
                        class={`mt-2 block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1`}
                    >
                        Nivel
                    </label>
                    <label
                        for="nivel"
                        class={`mt-2 block text-md font-medium text-gray-700 dark:text-gray-300 mb-1`}
                    >
                        {nivel}
                    </label>
                </div>
                <div>
                    <label
                        for="animales "
                        class={`mt-2 block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1`}
                    >
                        Animales en la cuenta
                    </label>
                    <label
                        for="animales"
                        class={`mt-2 block text-md font-medium text-gray-700 dark:text-gray-300 mb-1`}
                    >
                        {totalanimales}
                    </label>
                </div>
                <div>
                    <label
                        for="esta "
                        class={`mt-2 block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1`}
                    >
                        Establecimientos en la cuenta
                    </label>
                    <label
                        for="esta"
                        class={`mt-2 block text-md font-medium text-gray-700 dark:text-gray-300 mb-1`}
                    >
                        {totalesta}
                    </label>
                </div>
                <div class="mt-2 col-span-1 md:col-span-2">
                    <div class="flex justify-end">
                        <Success
                            onclick={() => goto(pre + "/user/nivel")}
                            texto="Cambiar plan"
                        />
                    </div>
                </div>
            </div>
        </div>
    </CardBase>
</Navbar2>
<dialog
    id="modalCambioContra"
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
        <h3 class="text-lg font-bold">Cambio contraseña</h3>
        <div class="form-control">
            <label for="anterior" class="label">
                <span class={estilos.labelForm}>Contraseña anterior</span>
            </label>
            <input
                id="anterior"
                type="text"
                class={`
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    w-full
                    ${estilos.bgdark2}
                `}
                bind:value={viejacontra}
                oninput={() => onchange("ANTERIOR")}
            />
            {#if malviejacontra}
                <div class="label">
                    <span class="label-text-alt text-red-500"
                        >Debe escribir la contraseña anterior
                    </span>
                </div>
            {/if}
            <label for="contra" class="label">
                <span class={estilos.labelForm}>Nueva contraseña</span>
            </label>
            <input
                id="contra"
                type="text"
                class={`
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    w-full
                    ${estilos.bgdark2}
                `}
                bind:value={contra}
                oninput={() => onchange("CONTRA")}
            />
            {#if malcontra}
                <div class="label">
                    <span class="label-text-alt text-red-500"
                        >Debe escribir alguna contraseña y debe tener al menos
                        10 caracteres</span
                    >
                </div>
            {/if}
            <label for="confirmcontra" class="label">
                <span class={estilos.labelForm}>Confirmar contraseña</span>
            </label>
            <input
                id="confirmcontra"
                type="text"
                class={`
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    w-full
                    ${estilos.bgdark2}
                `}
                bind:value={confcontra}
                oninput={() => onchange("CONF")}
            />
            {#if malconfcontra}
                <div class="label">
                    <span class="label-text-alt text-red-500"
                        >Las contraseñas deben coincidir</span
                    >
                </div>
            {/if}
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <!-- if there is a button, it will close the modal -->
                <button
                    class="btn btn-success text-white"
                    disabled={!botonhabilitado}
                    onclick={cambiarContra}>Guardar</button
                >
                <button class="btn btn-neutral" onclick={cerrarModal}
                    >Cerrar</button
                >
            </form>
        </div>
    </div>
</dialog>
