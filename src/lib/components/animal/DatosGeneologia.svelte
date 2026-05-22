<script>
    import estilos from "$lib/stores/estilos";
    import sexos from "$lib/stores/sexos";
    import categorias from "$lib/stores/categorias";
    import estados from "$lib/stores/estados";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import {
        shorterWord,
        getSexoNombre,
        capitalize,
    } from "$lib/stringutil/lib";
    import RadioButton from "../RadioButton.svelte";
    function getSexo(sex) {
        let obj = sexos.filter((s) => s.id == sex)[0];
        if (obj) {
            return obj.nombre;
        } else {
            return "";
        }
    }
    function getEstadoNombre(estado) {
        let obj = estados.filter((s) => s.id == estado)[0];
        if (obj) {
            return obj.nombre;
        } else {
            return "";
        }
    }
    let {
        rp = "",
        peso = "",
        sexo = "",
        nombrerodeo = "",
        nombrelote = "",
        categoria = "",
        raza = "",
        color = "",
        prenada = "",
        connacimiento = false,
        nacimiento = { fecha: "" },
        fecha = "",
        madre = { id: null, caravana: "" },
        padre = { id: null, caravana: "" },

        nuevaEntrada = async () => {},
    } = $props();
</script>

<div>
    <div class="grid grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
        <div class="mb-1 lg:mb-0 col-span-2 lg:col-span-1">
            <label for="rp" class="label mb-0 pb-0">
                <span
                    class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
                >
                    RP</span
                >
            </label>
            <label
                for="rp"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {shorterWord(rp)}
            </label>
        </div>
        <div class="mb-1 lg:mb-0">
            <label for="peso" class="label mb-0 pb-0">
                <span
                    class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
                >
                    Peso(KG)
                </span>
            </label>
            <label
                for="peso"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {peso}
            </label>
        </div>
        <div class="mb-1 lg:mb-0">
            <label for="sexo" class="label mb-0 pb-0">
                <span
                    class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
                >
                    Sexo</span
                >
            </label>
            <label
                for="sexo"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {getSexo(sexo)}
            </label>
        </div>
        <div class="mb-1 lg:mb-0">
            <label for="rodeo" class="label mb-0 pb-0">
                <span
                    class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
                >
                    Rodeo</span
                >
            </label>
            <label
                for="rodeo"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {nombrerodeo}
            </label>
        </div>
        <div class="mb-1 lg:mb-0">
            <label for="lote" class="label mb-0 pb-0">
                <span
                    class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
                >
                    Lote</span
                >
            </label>
            <label
                for="lote"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {nombrelote}
            </label>
        </div>
        <div class="mb-1 lg:mb-0">
            <label for="categoria" class="label mb-0 pb-0">
                <span
                    class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
                >
                    Categoria</span
                >
            </label>
            <label
                for="categoria"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {capitalize(categoria)}
            </label>
        </div>
        <div class="mb-1 lg:mb-0 col-span-2 lg:col-span-1">
            <label for="raza" class="label mb-0 pb-0">
                <span
                    class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
                >
                    Raza</span
                >
            </label>
            <label
                for="raza"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {shorterWord(raza)}
            </label>
        </div>
        <div class="mb-1 lg:mb-0 col-span-2 lg:col-span-1">
            <label for="color" class="label mb-0 pb-0">
                <span
                    class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
                >
                    Color</span
                >
            </label>
            <label
                for="color"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {shorterWord(color)}
            </label>
        </div>
        {#if sexo == "H"}
            <div class="mb-1 lg:mb-0 col-span-2 lg:w-1/2">
                <label for="prenada" class="label mb-0 pb-0">
                    <span
                        class="
                        label-text tracking-wide
                        text-md uppercase
                        font-semibold dark:text-gray-400
                        text-gray-500
                    "
                    >
                        Estado</span
                    >
                </label>
                <label
                    for="sexo"
                    class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
                >
                    {getEstadoNombre(prenada)}
                </label>
            </div>
        {/if}
    </div>
    {#if connacimiento}
        <div class="grid grid-cols-2 lg:grid-cols-2">
            <h3 class="text-2xl font-bold mt-2 mb-1 text-left">Nacimiento</h3>
        </div>

        <div class="grid grid-cols-1 gap-1 lg:gap-6 mb-2">
            <div>
                <label for="fechanacimiento" class="label mb-0 pb-0">
                    <span
                        class="
                            label-text tracking-wide
                            text-md uppercase
                            font-semibold dark:text-gray-400
                            text-gray-500
                        "
                    >
                        Fecha nacimiento</span
                    >
                </label>
                <label
                    for="fechanacimiento"
                    class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
                >
                    {new Date(nacimiento.fecha).toLocaleDateString()}
                </label>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
            {#if madre && madre.id && madre.id != ""}
                <div>
                    <label for="nombremadre" class="label">
                        <span class="label-text text-base">
                            <span
                                class="label-text tracking-wide text-md uppercase font-semibold dark:text-gray-400 text-gray-500"
                            >
                                Madre
                            </span>: {madre.caravana}
                        </span>
                    </label>

                    <div class="flex justify-start mx-0 px-0">
                        <button
                            class={`${estilos.basico} ${estilos.chico} ${estilos.primario}`}
                            onclick={async () => await nuevaEntrada(madre.id)}
                            >Ver animal</button
                        >
                    </div>
                </div>
            {/if}
            {#if padre && padre.id && padre.id != ""}
                <div>
                    <label for="nombrepadre" class="label">
                        <span class="label-text text-base">
                            <span
                                class="label-text tracking-wide text-md uppercase font-semibold dark:text-gray-400 text-gray-500"
                            >
                                Padre
                            </span>
                            : {padre.caravana}
                        </span>
                    </label>

                    <div class="flex justify-start mx-0 px-0">
                        <button
                            class={`${estilos.basico} ${estilos.chico} ${estilos.primario}`}
                            onclick={async () => await nuevaEntrada(padre.id)}
                            >Ver animal</button
                        >
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <div>
            <div
                class="grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-10 m-1 mb-2 lg:mt-2"
            >
                {#if fecha.length > 0}
                    <div class="grid grid-cols-1 gap-1 lg:gap-6 mb-2">
                        <div>
                            <label for="fechanacimiento" class="label">
                                <span class="label-text text-base"
                                    >Fecha nacimiento</span
                                >
                            </label>
                            <label
                                for="fechanacimiento"
                                class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-2`}
                            >
                                {new Date(
                                    fecha + " 03:00:00",
                                ).toLocaleDateString()}
                            </label>
                        </div>
                    </div>
                {/if}
                <h3 class="text-xl mx-1 font-bold mb-1 text-left">
                    No tiene un nacimiento registrado
                </h3>
            </div>
        </div>
    {/if}
</div>
