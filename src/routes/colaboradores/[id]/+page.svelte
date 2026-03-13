<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import PocketBase from "pocketbase";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import permisos from "$lib/stores/permisos";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import { goto } from "$app/navigation";
    //permisos
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import Danger from "$lib/components/botones/Danger.svelte";
    let ruta = import.meta.env.VITE_RUTA;
    const pb = new PocketBase(ruta);
    let pre = import.meta.env.VITE_PRE;
    let id = $state("");
    let idpermiso = $state("");
    let nombre = $state("");
    let apellido = $state("");
    let userpermisos = $state([false, false, false, false, false, false]);
    let per = createPer();
    let perpermisos = $state({});
    async function getPermisos() {
        const record = await pb
            .collection("permisos")
            .getFirstListItem(`estxcolab='${id}'`, {
                expand: "estxcolab,estxcolab.colab",
            });
        idpermiso = record.id;
        let per = record.permisos.length == 0 ? [] : record.permisos.split(",");
        if (per.length != 0) {
            for (let i = 0; i < per.length; i++) {
                let idx = parseInt(per[i], 10);
                userpermisos[idx] = true;
            }
        }

        nombre = record.expand.estxcolab.expand.colab.nombre;
        apellido = record.expand.estxcolab.expand.colab.apellido;
    }
    function removeLastChar(inputString) {
        // If the string is not empty, return the string excluding the last character
        if (inputString.length > 0) {
            return inputString.slice(0, -1);
        }
        // If the string is empty, return an empty string
        return "";
    }
    async function guardarPermiso() {
        let listapermisos = getPermisosList(perpermisos.permisos);
        if (!listapermisos[0]) {
            Swal.fire("Error permisos", getPermisosMessage(0), "error");

            return;
        }
        let per = "";
        for (let i = 0; i < userpermisos.length; i++) {
            if (userpermisos[i]) {
                per += "" + i + ",";
            }
        }
        let data = {
            permisos: removeLastChar(per),
        };
        try {
            await pb.collection("permisos").update(idpermiso, data);
            await getPermisos();
            Swal.fire(
                "Éxitos permisos",
                "Permisos guardados con éxito",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error permisos",
                "No se pudieron guardar los permisos con éxito",
                "error",
            );
        }
    }

    async function desasociar() {
        let listapermisos = getPermisosList(perpermisos.permisos);
        if (!listapermisos[0]) {
            Swal.fire("Error permisos", getPermisosMessage(0), "error");

            return;
        }
        Swal.fire({
            title: "Desasociar colaborador",
            text: "¿Seguro que deseas desasociar el colaborador?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                try {
                    let recordper = await pb
                        .collection("permisos")
                        .getFirstListItem(`estxcolab='${id}'`);
                    await pb.collection("permisos").delete(recordper.id);
                    await pb.collection("estxcolabs").delete(id);
                    goto(pre + "/establecimiento");
                } catch (err) {
                    console.error(err);
                }
            }
        });
    }
    function volver() {
        goto(pre + "/establecimiento");
    }
    onMount(async () => {
        id = $page.params.id;
        await getPermisos();
        perpermisos = per.per;
    });
</script>

<Navbar2>
    <div class="mx-9 mt-1">
        <a
            href={`${pre + "/establecimiento"}`}
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
            Volver a colaboradores
        </a>
    </div>
    <dir class="mb-1">
        <h1 class="text-2xl font-bold">{apellido},{nombre}</h1>
    </dir>
    <dir class="mb-1">
        <h1 class="text-lg font-semibold">Permisos</h1>
    </dir>
    <div class="grid grid-cols-1 px-9">
        <div class="">
            <div class="form-control w-11/12 lg:w-1/2">
                <label class="label cursor-pointer">
                    <span class="label-text text-base"
                        >Administar los datos del establecimiento y sus
                        colaboradores</span
                    >
                    <input
                        type="checkbox"
                        class="toggle toggle-md toggle-success"
                        bind:checked={userpermisos[0]}
                    />
                </label>
            </div>
        </div>
        <div class="">
            <div class="form-control w-11/12 lg:w-1/2">
                <label class="label cursor-pointer">
                    <span class="label-text text-base"
                        >Crear grupos de animales como lotes y rodeos</span
                    >
                    <input
                        type="checkbox"
                        class="toggle toggle-md toggle-success"
                        bind:checked={userpermisos[1]}
                    />
                </label>
            </div>
        </div>
        <div class="">
            <div class="form-control w-11/12 lg:w-1/2">
                <label class="label cursor-pointer">
                    <span class="label-text text-base"
                        >Importar archivos para cargas masivas</span
                    >
                    <input
                        type="checkbox"
                        class="toggle toggle-md toggle-success"
                        bind:checked={userpermisos[2]}
                    />
                </label>
            </div>
        </div>
        <div class="">
            <div class="form-control w-11/12 lg:w-1/2">
                <label class="label cursor-pointer">
                    <span class="label-text text-base"
                        >Realizar movimientos de múltiples animales</span
                    >
                    <input
                        type="checkbox"
                        class="toggle toggle-md toggle-success"
                        bind:checked={userpermisos[3]}
                    />
                </label>
            </div>
        </div>
        <div class="">
            <div class="form-control w-11/12 lg:w-1/2">
                <label class="label cursor-pointer">
                    <span class="label-text text-base"
                        >Registrar los diferentes eventos del establecimiento</span
                    >
                    <input
                        type="checkbox"
                        class="toggle toggle-md toggle-success"
                        bind:checked={userpermisos[4]}
                    />
                </label>
            </div>
        </div>
        <div class="">
            <div class="form-control w-11/12 lg:w-1/2">
                <label class="label cursor-pointer">
                    <span class="label-text text-base"
                        >Administrar la información básica de los animales</span
                    >
                    <input
                        type="checkbox"
                        class="toggle toggle-md toggle-success"
                        bind:checked={userpermisos[5]}
                    />
                </label>
            </div>
        </div>
        <div
            class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
        >
            <div class="mt-1">
                <Danger onclick={desasociar} texto="Desasociar" />
            </div>
            <div class="mt-1">
                <Success onclick={guardarPermiso} texto="Guardar" />
            </div>
        </div>
        <div class="hidden grid grid-cols-2">
            <dir class="w-11/12 lg:w-1/2 flex justify-start">
                <button
                    class={estilos.mediumsolidgreen}
                    onclick={guardarPermiso}>Guardar permisos</button
                >
            </dir>
            <dir class="w-11/12 lg:w-1/2 flex justify-start">
                <button class={estilos.mediumsolidred} onclick={desasociar}
                    >Desasociar</button
                >
            </dir>
        </div>
    </div>
</Navbar2>
