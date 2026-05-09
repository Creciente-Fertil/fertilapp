<script>
  import Oscuro from "$lib/components/Oscuro.svelte";
  import CardBase from "$lib/components/CardBase.svelte";
  import { enabled } from "$lib/stores/enabled";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { createDarker } from "$lib/stores/dark.svelte";
  import { page } from "$app/stores";
  import Swal from "sweetalert2";
  import Creciente from "$lib/svgs/creciente.svelte";
  import estilos from "$lib/stores/estilos";
  import Success from "$lib/components/botones/Success.svelte";
  import Cancel from "$lib/components/botones/Cancel.svelte";
  import { saveEstablishment } from "$lib/java/establecimientos/establecimientosback";
  import {
    loadStorageEstablecimiento,
    saveStorageEstablecimiento,
    saveStorageEstablecimientoDefault,
  } from "$lib/java/establecimientos/establecimientostorage";
  import {
    getUser,
    setUser,
    setUserDefault,
  } from "$lib/userstorage/usersotrage";

  let innerWidth = $state(0);
  let innerHeight = $state(0);
  let esCelu = $derived(innerWidth <= 1100);
  let pre = import.meta.env.VITE_PRE;
  let darker = createDarker();

  let cab = $state(loadStorageEstablecimiento());
  let nombreusuario = $state("");
  let nombreestablecimiento = $state("");

  // Form state
  let nombreest = $state("");
  let contactoest = $state("");
  let direccionest = $state("");
  let saving = $state(false);

  onMount(() => {
    if ($enabled === "no") {
      goto(pre + "/");
      return;
    }
    const user = getUser();
    nombreusuario = user.useremail || "";
    nombreestablecimiento = cab.nombre || "";
  });

  function salir() {
    setUserDefault();
    saveStorageEstablecimientoDefault();
    enabled.set("no");
    goto(pre + "/");
  }
  function editarUser() {
    goto(pre + "/user/config");
  }
  function cambiarEstablecimiento() {
    goto(pre + "/establecimientos");
  }
  function volver() {
    goto(pre + "/establecimientos");
  }

  // Crea el establishment + reclama ownership. Despues actualiza
  // `usertoken.establishments` para que aparezca en el switcher sin
  // re-loguear, y vuelve al listado.
  async function guardar() {
    if (!nombreest || !direccionest) {
      Swal.fire("Faltan datos", "Nombre y dirección son obligatorios", "warning");
      return;
    }
    saving = true;
    try {
      const data = {
        nombre: nombreest,
        direccion: direccionest,
        contacto: contactoest,
        active: true,
      };
      const created = await saveEstablishment(data);
      if (!created || !created.establishmentId) {
        throw new Error("saveEstablishment no devolvio establishmentId");
      }
      // El back ya asocio al usuario autenticado como ADM en el create
      // (claim de ownership automatico cuando no se pasan userIds).

      // Refrescar la lista del switcher: agregamos el nuevo UE con rol
      // ADM (lo asume el back en `addUserToEstablishment` cuando es
      // claim de ownership).
      const u = getUser();
      const newUe = {
        establishmentId: created.establishmentId,
        establishmentName: created.name,
        role: "ADM",
      };
      setUser({
        ...u,
        establishments: [...(u.establishments || []), newUe],
      });

      Swal.fire(
        "Éxito",
        "Se guardó el establecimiento. Lo encontrás en tus establecimientos.",
        "success",
      );
      volver();
    } catch (err) {
      console.error("guardar establecimiento", err);
      Swal.fire(
        "Error",
        "No se pudo guardar el establecimiento. Revisá la consola.",
        "error",
      );
    } finally {
      saving = false;
    }
  }

  let bgnav = "dark:bg-gray-900 bg-gray-50";
  let classnavbarr = `navbar ${bgnav} fixed top-0 left-0 right-0 z-50`;
  let classtextnavbar = `text-gray-700 font-extrabold dark:text-white`;
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
  class={`
        min-h-screen
        dark:bg-gradient-to-br 
        dark:from-gray-900 
        dark:to-gray-800
    `}
>
  <div class="drawer-content w-full">
    <div class={classnavbarr}>
      <div class="flex-1">
        <a
          href={pre + "/inicio"}
          class={`pl-0 pr-1 btn btn-ghost text-2xl ${classtextnavbar}`}
        >
          {#if esCelu}
            <Creciente margenes="m-0" alto="h-8" largo="w-24" />
          {:else}
            <Creciente margenes="m-0" alto="h-12" largo="w-40" />
          {/if}
        </a>
      </div>
      <div class="flex mr-1 pr-1 lg:mr-5 lg:pr-5">
        <span class={classtextnavbar}>{nombreusuario}</span>

        <details class="dropdown dropdown-end">
          <summary class={`btn btn-square btn-ghost ${classtextnavbar}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-5 w-5 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              ></path>
            </svg>
          </summary>
          <div class="pr-3 mr-3">
            <ul
              class={`menu dropdown-content rounded-box z-[1] shadow ${classtextnavbar} ${bgnav}`}
            >
              <li><button onclick={editarUser}>Usuario</button></li>
              <li>
                <button onclick={cambiarEstablecimiento}
                  >Establecimientos</button
                >
              </li>
              <li><button onclick={salir}>Salir</button></li>
            </ul>
          </div>
        </details>
        <Oscuro></Oscuro>
      </div>
    </div>
    <main class={`pt-16 ${estilos.bgmain}`}>
      <!--Aca val el interior-->
      <CardBase titulo="Registra el nuevo establecimiento">
        <div class="space-y-4">
          <div>
            <label
              for="nombre"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nombre
            </label>
            <input
              type="nombre"
              id="nombre"
              bind:value={nombreest}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
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
              bind:value={direccionest}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>
          <div>
            <label
              for="contacto"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Contacto
            </label>
            <input
              type="contacto"
              id="contacto"
              bind:value={contactoest}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>
        </div>
        <div class="mt-8 flex justify-end gap-2">
          <Cancel texto="Cancelar" onclick={volver} />
          <Success
            onclick={guardar}
            texto={saving ? "Guardando…" : "Guardar establecimiento"}
            disabled={saving}
          />
        </div>
      </CardBase>
    </main>
  </div>
</div>
