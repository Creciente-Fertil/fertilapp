<script>
    import Swal from "sweetalert2";
    import { goto } from "$app/navigation";
    import Oscuro from "$lib/components/OscuroLogin.svelte";
    import PocketBase from "pocketbase";
    import { fade, fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { page } from "$app/state";
    import { resetPassword } from "$lib/java/usuarios/usuariosback";
    import Secciones from "$lib/components/animal/Secciones.svelte";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let esdev = import.meta.env.VITE_DEV == "si";
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    let token = $state(page.url.searchParams.get("token"));
    let nuevacontra = $state("");
    let confcontra = $state("");

    function isEmpty(str) {
        return !str || str.length === 0;
    }
    function volver() {
        goto(pre + "/recover");
    }
    async function cambiar() {
        if (isEmpty(nuevacontra)) {
            Swal.fire("Error cambiar", "Contraseña vacia", "error");
            return;
        }
        if (isEmpty(token)) {
            Swal.fire("Error cambiar", "Token vacio", "error");
            return;
        }
        if (versionjava) {
            try {
                let data = {
                    token,
                    newPassword: nuevacontra,
                };
                let ans = await resetPassword(data)
                
                Swal.fire(
                    "Éxito cambiar",
                    "Se pudo cambiar la contraseña",
                    "success",
                );
                goto(pre + "/login");

            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error cambiar",
                    "No se pudo cambiar la contraseña",
                    "error",
                );
                goto(pre + "/login");
            }
        } else {
            const pb = new PocketBase(ruta);
            try {
                let data = {
                    token,
                    password: nuevacontra,
                    passwordConfirm: confcontra,
                };
                await pb
                    .collection("users")
                    .confirmPasswordReset(token, nuevacontra, confcontra);
                Swal.fire(
                    "Éxito cambiar",
                    "Se pudo cambiar la contraseña",
                    "success",
                );

                goto(pre + "/login");
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error cambiar",
                    "No se pudo cambiar la contraseña",
                    "success",
                );
                goto(pre + "/login");
            }
        }
    }
    function keyEvent(e) {
        if (e.code == "Enter") {
            if ((usuariomail != "") != "") {
                reset();
            }
        }
    }
</script>

<svelte:window on:keydown={keyEvent} />
<div
    class="min-h-screen bg-gradient-to-br from-green-400 to-green-700 dark:from-gray-900 dark:to-gray-800 p-4"
>
    <div class="flex justify-end m-10">
        <Oscuro></Oscuro>
    </div>
    <div class="flex items-center justify-center">
        <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full"
            in:fly={{ y: 50, duration: 200, easing: quintOut }}
            out:fade
        >
            <h1
                class="text-3xl font-bold text-green-700 dark:text-green-400 mb-6 text-center"
            >
                Bienvenido a Fertil
            </h1>
            <div class="space-y-6">
                <div>
                    <label
                        for="token"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Token
                    </label>
                    <input
                        type="text"
                        id="token"
                        bind:value={token}
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                    <label
                        for="nueva"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Nueva contraseña
                    </label>
                    <input
                        type="nueva"
                        id="token"
                        bind:value={nuevacontra}
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                    <label
                        for="conf"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Confirmar contraseña
                    </label>
                    <input
                        type="text"
                        id="conf"
                        bind:value={confcontra}
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>

                <div>
                    <button
                        class="w-full bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
                        onclick={cambiar}
                    >
                        Cambiar contraseña
                    </button>
                </div>
            </div>
            <!--<div class="mt-6 text-center">
                <a href="#" 
                    class="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition"
                >
                    ¿Olvidaste la contraseña?
                </a>
            </div>
            -->
            <div class="mt-8 border-t border-gray-200 pt-6 text-center">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Quiere ir a la pagina anterior?
                    <a
                        href={pre + "/recover"}
                        class="font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition"
                    >
                        Volver
                    </a>
                </p>
            </div>
        </div>
    </div>
</div>
