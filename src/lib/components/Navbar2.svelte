<script>
    import { slide } from "svelte/transition";
    import Oscuro from "./Oscuro.svelte";
    import PocketBase from "pocketbase";

    import { enabled } from "$lib/stores/enabled";
    import { onMount, onDestroy } from "svelte";
    import { usuario } from "$lib/stores/usuario";
    import { goto } from "$app/navigation";

    import { createDarker } from "$lib/stores/dark.svelte";
    import { page } from "$app/stores";
    import { createCaber } from "$lib/stores/cab.svelte";
    import NavegacionBottom from "./NavegacionBottom.svelte";
    import estilos from "$lib/stores/estilos";
    //SVG
    import Animal from "$lib/svgs/animal.svelte";
    import Creciente from "$lib/svgs/creciente.svelte";
    import Estable from "$lib/svgs/estable.svelte";
    import Lote from "$lib/svgs/lote.svelte";
    import Logo from "$lib/svgs/logo.svelte";
    import Movimiento from "$lib/svgs/movimiento.svelte";
    import Nacimiento from "$lib/svgs/nacimiento.svelte";
    import Observacion from "$lib/svgs/observacion.svelte";
    import Pesaje from "$lib/svgs/pesaje.svelte";
    import Rodeo from "$lib/svgs/rodeo.svelte";
    import Servicio from "$lib/svgs/servicio.svelte";
    import Tacto from "$lib/svgs/tacto.svelte";
    import Tratamiento from "$lib/svgs/tratamiento.svelte";
    import Bell from "$lib/svgs/bell.svelte";
    import Reportes from "$lib/svgs/reportes.svelte";
    import Importar from "$lib/svgs/importar.svelte";
    import Home from "$lib/svgs/home.svelte";
    import Topbar from "./navbar/Topbar.svelte";
    import Sidebar from "./navbar/Sidebar.svelte";
    //tamaño
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let { children } = $props();

    let pageurl = $page.url.pathname;
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let esCelu = $derived(innerWidth <= 1100);

    const pb = new PocketBase(ruta);
    let darker = createDarker();
    let leido = $state(true);
    let notificaciones = $state([]);
    let cab = $state({
        exist: false,
        nombre: "",
        id: "",
    });

    let nombreusuario = $state("");
    let primeraletra = $derived(
        nombreusuario.length > 0 ? nombreusuario[0].toLocaleUpperCase() : "",
    );
    let usuarioid = $state("");

    let rol = "Establecimiento";
    let nombreestablecimiento = $state("");

    //let rol = "cab"
    onDestroy(() => {
        //document.removeEventListener("click", handleClickOutsideMenu);
        //document.removeEventListener("click", handleClickOutsideNoti);
    });

    onMount(async () => {
        //document.addEventListener("click", handleClickOutsideMenu);
        //document.addEventListener("click", handleClickOutsideNoti);
        let caber = createCaber();
        nombreestablecimiento = caber.cab.nombre;
        if (window.innerWidth <= 600) {
            // Pantallas pequeñas
            nombreestablecimiento = nombreestablecimiento.slice(0, 15);
        }

        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        nombreusuario = pb_json.record.username;

        let hab = $enabled;
        if (hab === "no") {
            goto(pre + "/");
        }

        cab = caber.cab;
        await getNotis();
    });
    //menu
    let containerMenu = $state(null); // referencia al div principal
    let openMenu = $state(false);
    function toggleMenu() {
        openMenu = !openMenu;
    }
    function handleClickOutsideMenu(event) {
        if (!containerMenu.contains(event.target)) {
            openMenu = false;
        }
    }
    //notififaciones
    let dropdownOpen = $state(false);
    async function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
        await leerNotis(); // tu función existente
    }

    function closeDropdown() {
        dropdownOpen = false;
    }

    let containerNoti = $state(null); // referencia al div principal
    let openNoti = $state(false);
    function toggleNoti() {
        openNoti;
    }
    function handleClickOutsideNoti(event) {
        if (!containerNoti.contains(event.target)) {
            openNoti = false;
        }
    }

    function salir() {
        pb.authStore.clear();
        usuario.set("");
        enabled.set("no");
        goto(pre + "/");
    }
    function editarUser() {
        goto(pre + "/user/config");
    }
    function cambiarEstablecimiento() {
        goto(pre + "/establecimientos");
    }
    function verManual() {
        goto(pre + "/manual");
    }
    let checked = $state("");
    function handleClick() {
        checked == "checked" ? (checked = "") : (checked = "checked");
    }
    async function getNotis() {
        const records = await pb.collection("notificaciones").getFullList({
            sort: "-created",
            filter: `destino = '${usuarioid}' && leido = False`,
        });

        notificaciones = records;
        if (notificaciones.length > 0) {
            leido = false;
        }
    }
    async function leerNotis() {
        leido = true;

        for (let i = 0; i < notificaciones.length; i++) {
            try {
                let data = { leido: true };
                await pb
                    .collection("notificaciones")
                    .update(notificaciones[i].id, data);
            } catch (err) {
                console.error(err);
            }
        }
    }

    //let bgnav = "bg-green-500";
    let bgnav = "dark:bg-gray-900 bg-gray-50";
    let classtext = `text-lg px-2 font-light ${estilos.sidebartextocolor}`;
    let classnavbarr = `navbar ${bgnav} fixed top-0 left-0 right-0 z-50`;
    //let classtextnavbar = `text-white font-extrabold dark:text-gray-700`;
    let classtextnavbar = `text-gray-700 font-extrabold dark:text-white`;

    //Secciones
    let establecimientoOpen = $state(true);
    let animalesOpen = $state(true);
    let datosOpen = $state(true);
    //toggles
    function toggleEstablecimiento() {
        establecimientoOpen = !establecimientoOpen;
    }
    function toggleAnimales() {
        animalesOpen = !animalesOpen;
    }
    function toggleDatos() {
        datosOpen = !datosOpen;
    }
    //estadisticas
    function estadisticas() {
        goto(pre + "/animales/estadisticas");
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<!--Escritorio-->
<div class={`
    hidden 2xl:block min-h-screen
    dark:bg-gradient-to-br 
    dark:from-gray-900 
    dark:to-gray-800
    `}
>
    <Topbar
        escritorio={true}
        {bgnav}
        {esCelu}
        {classtextnavbar}
        {classnavbarr}
        {handleClick}
        {leerNotis}
        {leido}
        {primeraletra}
        {nombreusuario}
        {notificaciones}
        {editarUser}
        {cambiarEstablecimiento}
        {verManual}
        {salir}
    />
    <div class="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pt-16 fixed min-h-screen overflow-y-auto ">
        <Sidebar
            {nombreestablecimiento}
            {esCelu}
            {cab}
            {classtext}
            {toggleEstablecimiento}
            {establecimientoOpen}
            {toggleAnimales}
            {animalesOpen}
            {datosOpen}
            {toggleDatos}
        />
    </div>
    <div class="w-full ">
        <main class={`py-16 ${estilos.bgmain} ml-10 pl-10`}>
            {@render children()}
            
        </main>
    </div>
</div>
<!--Celular-->
<div
    class={`
        2xl:hidden 
        drawer min-h-screen
        dark:bg-gradient-to-br 
        dark:from-gray-900 
        dark:to-gray-800
    `}
>
    <input id="my-drawer" type="checkbox" class="drawer-toggle" bind:checked />
    <div class="drawer-content w-full">
        <Topbar
            escritorio={false}
            {bgnav}
            {esCelu}
            {classtextnavbar}
            {classnavbarr}
            {handleClick}
            {leerNotis}
            {leido}
            {primeraletra}
            {nombreusuario}
            {notificaciones}
            {editarUser}
            {cambiarEstablecimiento}
            {verManual}
            {salir}
        />

        <main class={`py-16 ${estilos.bgmain}`}>
            {@render children()}
            {#if esCelu}
                <NavegacionBottom />
            {/if}
        </main>
    </div>
    <div
        class="drawer-side overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pt-16"
    >
        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"
        ></label>
        <Sidebar
            {nombreestablecimiento}
            {esCelu}
            {cab}
            {classtext}
            {toggleEstablecimiento}
            {establecimientoOpen}
            {toggleAnimales}
            {animalesOpen}
            {datosOpen}
            {toggleDatos}
        />
    </div>
</div>
