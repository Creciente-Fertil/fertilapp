<script>
    import { page } from "$app/stores";
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import Swal from "sweetalert2";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import { getPermisosMessage } from "$lib/permisosutil/lib";
    import { getUser } from "$lib/userstorage/usersotrage";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    import {
        listColaboradores,
        loadCatalog,
        getColabPermisos,
        assignRole,
        grantPermiso,
        revokePermiso,
        getRoles,
    } from "$lib/java/permisos/permisosback";
    import {
        PERMISSION_GROUPS,
        ROLE_PRESETS,
        permsToBackend,
        permsFromBackend,
        detectPreset,
    } from "$lib/java/permisos/mapping";

    const pre = import.meta.env.VITE_PRE;

    /* ---------- Helpers ---------- */
    // Construye un objeto perms agrupado a partir de un preset, o
    // (cuando no hay preset / es "custom") devuelve uno vacio con
    // establecimiento.ver fijo (es required).
    function applyPreset(presetId) {
        const preset = ROLE_PRESETS.find((r) => r.id === presetId);
        if (!preset || !preset.permissions) {
            const out = {};
            for (const g of PERMISSION_GROUPS) out[g.id] = [];
            out.establecimiento = ["ver"];
            return out;
        }
        const out = {};
        for (const k of Object.keys(preset.permissions)) {
            out[k] = [...preset.permissions[k]];
        }
        return out;
    }

    function permsEqual(a, b) {
        for (const g of PERMISSION_GROUPS) {
            const aa = [...(a[g.id] || [])].sort();
            const bb = [...(b[g.id] || [])].sort();
            if (aa.length !== bb.length) return false;
            for (let i = 0; i < aa.length; i++)
                if (aa[i] !== bb[i]) return false;
        }
        return true;
    }

    function avatarColor(seed) {
        const palette = [
            "#168561",
            "#3f9d77",
            "#115642",
            "#74bb9d",
            "#0d4434",
            "#a9d6c1",
            "#7e878a",
        ];
        let h = 0;
        for (let i = 0; i < (seed || "").length; i++)
            h = (h * 31 + seed.charCodeAt(i)) >>> 0;
        return palette[h % palette.length];
    }

    function summaryFor(perms) {
        const lines = [];
        const has = (g, a) => (perms[g] || []).includes(a);
        const groupHas = (g) => (perms[g] || []).length > 0;

        if (has("establecimiento", "editar") || has("establecimiento", "colabs")) {
            lines.push({
                tone: "yes",
                text: "Puede modificar la configuración del establecimiento.",
            });
        } else {
            lines.push({
                tone: "no",
                text: "No puede modificar la configuración del establecimiento.",
            });
        }
        if (has("establecimiento", "colabs")) {
            lines.push({
                tone: "yes",
                text: "Puede asociar y desasociar otros colaboradores.",
            });
        }
        if (groupHas("eventos")) {
            if (has("eventos", "crear"))
                lines.push({
                    tone: "yes",
                    text: "Registra eventos: tactos, servicios, pesajes, tratamientos.",
                });
            else
                lines.push({
                    tone: "soft",
                    text: "Solo ve los eventos registrados.",
                });
        }
        if (has("movimientos", "crear")) {
            lines.push({
                tone: "yes",
                text: "Mueve animales en masa entre lotes y rodeos.",
            });
        }
        if (has("grupos", "crear") || has("grupos", "editar")) {
            lines.push({ tone: "yes", text: "Crea y edita lotes y rodeos." });
        }
        if (has("importar", "importar")) {
            lines.push({
                tone: "yes",
                text: "Carga datos masivos desde planillas.",
            });
        }
        if (has("animales", "eliminar")) {
            lines.push({
                tone: "warn",
                text: "Puede dar de baja animales del establecimiento.",
            });
        } else if (has("animales", "editar")) {
            lines.push({
                tone: "yes",
                text: "Edita la información básica de los animales.",
            });
        }
        if (lines.length === 1) {
            lines.push({
                tone: "soft",
                text: "Acceso de solo lectura al resto.",
            });
        }
        return lines;
    }

    /* ---------- State ---------- */
    // userId del colab seleccionado (string desde el route param).
    let userId = $state("");
    // Establecimiento actual del usuario logueado. Se persiste en
    // localStorage["establecimiento"] desde el flujo de login Java
    // (saveStorageEstablecimiento). cab.id es el Java establishmentId.
    let cab = $state(loadStorageEstablecimiento());
    let colabs = $state([]);
    let catalog = $state([]); // [{ permissionId, resource, action, ... }]
    let roles = $state([]); // [{ roleId, code, name }]
    let query = $state("");
    let loading = $state(true);
    let saving = $state(false);
    let sidebarOpen = $state(false);
    let toast = $state(null);
    // Si el usuario actual no tiene USER_PERMISSION:VIEW (ej. ENC/OPE),
    // las llamadas a /permissions devuelven 403 y no podemos mostrar
    // ni editar la matriz. En ese caso pintamos un mensaje claro en
    // vez del fallback engañoso de "todo apagado".
    let unauthorized = $state(false);

    // Permisos por colaborador (Map<userId, grouped>)
    let initialPermsByUserId = $state({});
    let permsByUserId = $state({});

    let perms = $derived(permsByUserId[userId] || applyPreset("custom"));
    let initialPerms = $derived(
        initialPermsByUserId[userId] || applyPreset("custom"),
    );
    let dirty = $derived(!permsEqual(perms, initialPerms));
    let presetId = $derived(detectPreset(perms));
    let user = $derived(
        colabs.find((c) => String(c.userId) === String(userId)),
    );
    // Nadie (ni siquiera un ADM) puede editar sus propios permisos.
    // Lo enforce el back, pero acá lo bloqueamos en UI para evitar el
    // viaje + 400.
    let isSelf = $derived(String(getUser().id) === String(userId));
    let filtered = $derived.by(() => {
        const q = query.trim().toLowerCase();
        if (!q) return colabs;
        return colabs.filter((c) =>
            `${c.firstName || ""} ${c.lastName || ""} ${c.email || ""}`
                .toLowerCase()
                .includes(q),
        );
    });

    /* ---------- Data loading ---------- */
    async function loadAllColabs() {
        if (!cab.id) return;
        const list = await listColaboradores(cab.id);
        colabs = list.map((u) => ({
            userId: u.userId,
            email: u.email || "",
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            roleId: u.roleId,
            roleCode: u.roleCode,
            roleName: u.roleName,
            color: avatarColor(String(u.userId)),
        }));
    }

    async function loadPermisosFor(uid) {
        if (!uid || !cab.id) return;
        if (permsByUserId[uid]) return;
        try {
            const ids = await getColabPermisos(cab.id, uid);
            const grouped = permsFromBackend(ids, catalog);
            initialPermsByUserId = {
                ...initialPermsByUserId,
                [uid]: grouped,
            };
            permsByUserId = { ...permsByUserId, [uid]: grouped };
        } catch (err) {
            // 403 = no tiene USER_PERMISSION:VIEW en este establishment
            // (típico de ENC/OPE). Marcamos unauthorized en vez de
            // pintar fallback "custom" que confunde al usuario.
            if (err && err.status === 403) {
                unauthorized = true;
                return;
            }
            console.error("loadPermisosFor", err);
            const empty = applyPreset("custom");
            initialPermsByUserId = { ...initialPermsByUserId, [uid]: empty };
            permsByUserId = { ...permsByUserId, [uid]: empty };
        }
    }

    function setPerms(next) {
        permsByUserId = { ...permsByUserId, [userId]: next };
    }

    function setPreset(pid) {
        setPerms(applyPreset(pid));
    }

    /* ---------- Actions ---------- */
    async function selectColab(uid) {
        sidebarOpen = false;
        if (String(uid) === String(userId)) return;
        if (dirty) {
            const result = await Swal.fire({
                title: "Cambios sin guardar",
                text: "Si cambiás de colaborador se perderán los cambios.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Descartar",
                cancelButtonText: "Cancelar",
            });
            if (!result.value) return;
            permsByUserId = {
                ...permsByUserId,
                [userId]: initialPermsByUserId[userId],
            };
        }
        await loadPermisosFor(uid);
        goto(`${pre}/colaboradores/${uid}`, {
            replaceState: false,
            noScroll: true,
        });
    }

    function toggleAction(group, actionId) {
        const checked = perms[group.id] || [];
        const present = checked.includes(actionId);
        let next;
        if (present) {
            if (group.required && actionId === "ver") return;
            next = checked.filter((a) => a !== actionId);
        } else {
            next = [...checked, actionId];
            const hasVer = group.actions.find((a) => a.id === "ver");
            if (hasVer && !next.includes("ver")) next.push("ver");
        }
        setPerms({ ...perms, [group.id]: next });
    }

    function toggleAll(group, on) {
        if (group.required && !on) {
            setPerms({ ...perms, [group.id]: ["ver"] });
            return;
        }
        setPerms({
            ...perms,
            [group.id]: on ? group.actions.map((a) => a.id) : [],
        });
    }

    function discard() {
        permsByUserId = {
            ...permsByUserId,
            [userId]: initialPermsByUserId[userId],
        };
    }

    // Estrategia de save:
    //  - Si los checkboxes coinciden con un preset puro (admin/colab/vet)
    //    Y ese preset implica un rol distinto al actual → assignRole
    //    (reset rapido en el back).
    //  - Si no, diff: permsToBackend(new) vs permsToBackend(old) →
    //    grant/revoke individual.
    async function guardarPermiso() {
        if ((perms.establecimiento || []).length === 0) {
            Swal.fire("Error permisos", getPermisosMessage(0), "error");
            return;
        }
        const uid = parseInt(userId, 10);
        const colab = colabs.find((c) => c.userId === uid);
        if (!colab) {
            Swal.fire("Error", "Colaborador no encontrado.", "error");
            return;
        }

        saving = true;
        try {
            const newGrouped = perms;
            const oldGrouped = initialPermsByUserId[userId] || applyPreset("custom");
            const detected = detectPreset(newGrouped);
            const presetMatch = ROLE_PRESETS.find((r) => r.id === detected);

            if (
                presetMatch &&
                presetMatch.roleCode &&
                presetMatch.roleCode !== colab.roleCode
            ) {
                const role = roles.find((r) => r.code === presetMatch.roleCode);
                if (!role)
                    throw new Error(
                        `Role ${presetMatch.roleCode} no encontrado`,
                    );
                await assignRole(cab.id, uid, role.roleId);
                colab.roleCode = presetMatch.roleCode;
                colab.roleId = role.roleId;
                colab.roleName = role.name;
            } else {
                const newSet = permsToBackend(newGrouped, catalog);
                const oldSet = permsToBackend(oldGrouped, catalog);
                const toGrant = [...newSet].filter((pid) => !oldSet.has(pid));
                const toRevoke = [...oldSet].filter((pid) => !newSet.has(pid));
                for (const pid of toGrant) {
                    await grantPermiso(cab.id, uid, pid);
                }
                for (const pid of toRevoke) {
                    await revokePermiso(cab.id, uid, pid);
                }
            }

            initialPermsByUserId = {
                ...initialPermsByUserId,
                [userId]: newGrouped,
            };
            toast = { kind: "success", msg: "Permisos guardados con éxito" };
        } catch (err) {
            console.error(err);
            toast = {
                kind: "danger",
                msg: "No se pudieron guardar los permisos",
            };
        } finally {
            saving = false;
        }
    }

    /* ---------- Keyboard ---------- */
    function onKeydown(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === "s") {
            e.preventDefault();
            if (dirty && !saving) guardarPermiso();
        }
    }

    let toastTimer;
    $effect(() => {
        if (toast) {
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => (toast = null), 3000);
        }
    });

    onMount(async () => {
        userId = $page.params.id;
        loading = true;
        try {
            const [cat, rls] = await Promise.all([loadCatalog(), getRoles()]);
            catalog = cat;
            roles = rls;
            await loadAllColabs();
            if (userId) await loadPermisosFor(parseInt(userId, 10));
        } catch (err) {
            // Si loadCatalog/getRoles tiran 403 (rol sin
            // PERMISSION:VIEW o ROLE:VIEW) marcamos no-autorizado.
            if (err && err.status === 403) {
                unauthorized = true;
            } else {
                console.error("onMount", err);
            }
        } finally {
            loading = false;
        }
        window.addEventListener("keydown", onKeydown);
    });

    onDestroy(() => {
        if (typeof window !== "undefined")
            window.removeEventListener("keydown", onKeydown);
        clearTimeout(toastTimer);
    });

    $effect(() => {
        const newId = $page.params.id;
        if (newId && newId !== userId) {
            userId = newId;
            loadPermisosFor(parseInt(newId, 10));
        }
    });

    function initials(u) {
        return `${(u.firstName || "?")[0]}${(u.lastName || "?")[0]}`.toUpperCase();
    }

    function groupStatus(group) {
        const checked = perms[group.id] || [];
        const total = group.actions.length;
        if (checked.length === total) return { label: "Completo", tone: "ok" };
        if (checked.length === 0) return { label: "Sin acceso", tone: "off" };
        return { label: `${checked.length} / ${total}`, tone: "partial" };
    }

    function isFullyOn(group) {
        return (perms[group.id] || []).length === group.actions.length;
    }

    function isChecked(group, actionId) {
        return (perms[group.id] || []).includes(actionId);
    }

    function actionLocked(group, actionId) {
        if (isSelf) return true;
        return group.required && actionId === "ver";
    }

    function currentPreset() {
        return ROLE_PRESETS.find((r) => r.id === presetId);
    }
</script>

<svelte:head>
    <title>Roles y permisos · Fertilapp</title>
</svelte:head>

<Navbar2>
    <div class="max-w-[1400px] mx-auto w-full px-3 sm:px-5">
        <!-- Page header -->
        <div class="pt-3 pb-2">
            <div class="flex items-center gap-2 flex-wrap">
                <a
                    href={pre + "/establecimiento"}
                    class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"
                >
                    <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        viewBox="0 0 24 24"
                    >
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Volver
                </a>
                <span class="text-gray-300 dark:text-gray-600">·</span>
                <h1 class="text-lg font-semibold dark:text-gray-100">
                    Roles y permisos
                </h1>
                {#if cab.nombre}
                    <span
                        class="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline"
                    >
                        {cab.nombre}
                    </span>
                {/if}
                <button
                    class="ml-auto lg:hidden inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-700"
                    onclick={() => (sidebarOpen = !sidebarOpen)}
                    aria-label="Abrir lista de colaboradores"
                >
                    <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        viewBox="0 0 24 24"
                    >
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                    Colaboradores
                </button>
            </div>
        </div>

        <!-- Two-pane main area -->
        <div
            class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3 pb-4"
            style="min-height: 560px;"
        >
            <!-- Sidebar: colaborador picker -->
            <aside
                class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden
                {sidebarOpen
                    ? 'fixed inset-x-3 top-16 bottom-3 z-30 lg:relative lg:inset-auto'
                    : 'hidden lg:block'}"
            >
                <div class="flex flex-col h-full">
                    <div
                        class="p-3 border-b border-gray-100 dark:border-gray-800"
                    >
                        <div class="relative">
                            <svg
                                class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                />
                            </svg>
                            <input
                                type="text"
                                bind:value={query}
                                placeholder="Buscar colaborador…"
                                class="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg
                                    bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                                    focus:outline-none focus:border-[#168561] focus:ring-1 focus:ring-[#168561]
                                    placeholder:text-gray-400 dark:text-gray-100"
                            />
                        </div>
                        <div
                            class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
                        >
                            <span>{filtered.length} colaboradores</span>
                            <a
                                href={pre + "/colaboradores/asociar"}
                                class="text-[#115642] dark:text-[#3f9d77] hover:underline font-medium"
                            >
                                + Asociar nuevo
                            </a>
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto scrollbar-thin">
                        {#if filtered.length === 0}
                            <div
                                class="p-8 text-center text-sm text-gray-400"
                            >
                                Sin resultados{query ? ` para "${query}"` : ""}
                            </div>
                        {:else}
                            <ul class="py-1">
                                {#each filtered as u (u.userId)}
                                    {@const active =
                                        String(u.userId) === String(userId)}
                                    <li>
                                        <button
                                            onclick={() => selectColab(u.userId)}
                                            class="w-full text-left flex items-center gap-2.5 px-3 py-2 transition
                                                {active
                                                ? 'bg-[#eef7f3] dark:bg-[#168561]/15 border-l-2 border-[#168561]'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 border-l-2 border-transparent'}"
                                        >
                                            <div
                                                class="relative flex-shrink-0 rounded-full flex items-center justify-center font-semibold text-white"
                                                style="width:32px;height:32px;background-color:{u.color};font-size:12px;{active
                                                    ? 'box-shadow:0 0 0 2px #168561, 0 0 0 4px #fff;'
                                                    : ''}"
                                            >
                                                {initials(u)}
                                            </div>
                                            <div class="min-w-0 flex-1">
                                                <div
                                                    class="text-sm font-medium truncate dark:text-gray-100"
                                                >
                                                    {u.firstName}
                                                    {u.lastName}
                                                </div>
                                                <div
                                                    class="text-[11px] text-gray-400 truncate"
                                                >
                                                    {u.email || ""}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                </div>
            </aside>

            <!-- Main pane: editor -->
            <main
                class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden flex flex-col"
            >
                {#if loading}
                    <div
                        class="flex-1 flex items-center justify-center text-sm text-gray-500"
                    >
                        Cargando…
                    </div>
                {:else if unauthorized}
                    <div
                        class="flex-1 flex flex-col items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 px-6 text-center"
                    >
                        <svg
                            class="w-10 h-10 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            viewBox="0 0 24 24"
                        >
                            <rect x="4" y="11" width="16" height="10" rx="2" />
                            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                        <h3 class="font-semibold text-base dark:text-gray-100">
                            No tenés permiso para gestionar permisos en este
                            establecimiento.
                        </h3>
                        <p class="max-w-sm">
                            Solo los administradores pueden ver y editar los
                            permisos de los colaboradores. Pedile a un
                            administrador del establecimiento que te otorgue
                            los permisos correspondientes.
                        </p>
                    </div>
                {:else if !user}
                    <div
                        class="flex-1 flex items-center justify-center text-sm text-gray-500"
                    >
                        Colaborador no encontrado.
                    </div>
                {:else}
                    <!-- User header -->
                    <div
                        class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3"
                    >
                        <div
                            class="relative flex-shrink-0 rounded-full flex items-center justify-center font-semibold text-white"
                            style="width:36px;height:36px;background-color:{user.color};font-size:14px;"
                        >
                            {initials(user)}
                        </div>
                        <div class="min-w-0 flex-1">
                            <div
                                class="flex items-center gap-2 flex-wrap"
                            >
                                <h2
                                    class="text-base font-semibold truncate dark:text-gray-100"
                                >
                                    {user.lastName}, {user.firstName}
                                </h2>
                                <span
                                    class="text-xs text-gray-400 truncate hidden sm:inline"
                                >
                                    {#if user.email}· {user.email}{/if}
                                </span>
                            </div>
                            {#if user.email}
                                <div
                                    class="text-xs text-gray-500 dark:text-gray-400 sm:hidden truncate"
                                >
                                    {user.email}
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Self-edit banner: nadie modifica sus propios permisos -->
                    {#if isSelf}
                        <div
                            class="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/30 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2"
                        >
                            <svg
                                class="w-3.5 h-3.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <line x1="12" y1="11" x2="12" y2="17" />
                                <circle cx="12" cy="8" r=".6" fill="currentColor" />
                            </svg>
                            No podés modificar tus propios permisos. Pedile a
                            otro administrador del establecimiento que los
                            ajuste.
                        </div>
                    {/if}

                    <!-- Unsaved banner -->
                    {#if dirty}
                        <div
                            class="px-4 py-1.5 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2"
                        >
                            <svg
                                class="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                                />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <circle cx="12" cy="17" r=".7" fill="currentColor" />
                            </svg>
                            Tenés cambios sin guardar.
                            <button
                                onclick={discard}
                                class="ml-auto underline font-medium hover:no-underline"
                            >
                                Descartar
                            </button>
                        </div>
                    {/if}

                    <!-- Body -->
                    <div class="flex-1 overflow-y-auto scrollbar-thin">
                        <div
                            class="px-4 py-4 space-y-4 max-w-4xl"
                        >
                            <!-- Role select -->
                            <div
                                class="flex items-center gap-3 flex-wrap"
                            >
                                <label
                                    for="role-select"
                                    class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                >
                                    Rol
                                </label>
                                <div
                                    class="relative flex-1 min-w-[220px] max-w-sm"
                                >
                                    <select
                                        id="role-select"
                                        value={presetId}
                                        onchange={(e) =>
                                            setPreset(e.currentTarget.value)}
                                        class="w-full appearance-none pl-3 pr-9 py-1.5 text-sm rounded-lg
                                            bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                                            focus:outline-none focus:border-[#168561] focus:ring-1 focus:ring-[#168561]
                                            font-medium dark:text-gray-100"
                                    >
                                        {#each ROLE_PRESETS as r (r.id)}
                                            <option value={r.id}>{r.name}</option>
                                        {/each}
                                        <option value="custom">Personalizado</option>
                                    </select>
                                    <svg
                                        class="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        viewBox="0 0 24 24"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                                {#if currentPreset()?.summary}
                                    <p
                                        class="text-xs text-gray-500 dark:text-gray-400 flex-1 min-w-0 leading-snug"
                                    >
                                        {currentPreset().summary}
                                    </p>
                                {:else if presetId === "custom"}
                                    <p
                                        class="text-xs text-gray-500 dark:text-gray-400 flex-1 min-w-0 leading-snug"
                                    >
                                        Permisos personalizados.
                                    </p>
                                {/if}
                            </div>

                            <!-- Permission list -->
                            <div
                                class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
                            >
                                {#each PERMISSION_GROUPS as group, gi (group.id)}
                                    {@const status = groupStatus(group)}
                                    {@const fullyOn = isFullyOn(group)}
                                    <div
                                        class={gi > 0
                                            ? "border-t border-gray-100 dark:border-gray-800"
                                            : ""}
                                    >
                                        <!-- Group header -->
                                        <div
                                            class="flex items-center gap-2.5 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30"
                                        >
                                            <span
                                                class="w-3.5 h-3.5 text-[#115642] dark:text-[#3f9d77] flex-shrink-0"
                                            >
                                                {#if group.icon === "settings"}
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                                                        <circle cx="12" cy="12" r="3" />
                                                        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
                                                    </svg>
                                                {:else if group.icon === "layers"}
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                                                        <path d="m12 2 10 6-10 6L2 8z" />
                                                        <path d="m2 16 10 6 10-6" />
                                                        <path d="m2 12 10 6 10-6" />
                                                    </svg>
                                                {:else if group.icon === "upload"}
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                {:else if group.icon === "arrows"}
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                                                        <path d="M3 7h13l-3-3" />
                                                        <path d="M21 17H8l3 3" />
                                                    </svg>
                                                {:else if group.icon === "calendar"}
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                {:else if group.icon === "cow"}
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                                                        <path d="M5 9c0-1.5 1.5-3 3-3 1 0 1.7.4 2.2.9M19 9c0-1.5-1.5-3-3-3-1 0-1.7.4-2.2.9" />
                                                        <path d="M4 12c0-3 3.5-5 8-5s8 2 8 5c0 4-3.5 7-8 7s-8-3-8-7Z" />
                                                        <circle cx="9.5" cy="13" r=".7" fill="currentColor" />
                                                        <circle cx="14.5" cy="13" r=".7" fill="currentColor" />
                                                        <path d="M10.5 16.5c.5.4 1 .5 1.5.5s1-.1 1.5-.5" />
                                                    </svg>
                                                {/if}
                                            </span>
                                            <h4
                                                class="font-semibold text-[13px] truncate dark:text-gray-100"
                                            >
                                                {group.title}
                                            </h4>
                                            {#if group.required}
                                                <span
                                                    class="inline-flex items-center gap-1 text-[10px] font-medium px-1 py-0 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                                >
                                                    <svg
                                                        class="w-2.5 h-2.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2.4"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <rect
                                                            x="4"
                                                            y="11"
                                                            width="16"
                                                            height="10"
                                                            rx="2"
                                                        />
                                                        <path
                                                            d="M8 11V7a4 4 0 0 1 8 0v4"
                                                        />
                                                    </svg>
                                                    Requerido
                                                </span>
                                            {/if}
                                            <span
                                                class="text-[11px] font-medium px-1.5 py-0 rounded-full flex-shrink-0
                                                {status.tone === 'ok'
                                                    ? 'bg-[#d6ebe1] text-[#0d4434] dark:bg-[#168561]/20 dark:text-[#74bb9d]'
                                                    : status.tone === 'partial'
                                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}"
                                            >
                                                {status.label}
                                            </span>
                                            <div class="ml-auto">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={fullyOn}
                                                    aria-label="Activar todos los permisos del grupo"
                                                    onclick={() =>
                                                        toggleAll(
                                                            group,
                                                            !fullyOn,
                                                        )}
                                                    class="rp-toggle sm {fullyOn ? 'on' : ''}"
                                                ></button>
                                            </div>
                                        </div>

                                        <!-- Action rows -->
                                        {#each group.actions as a (a.id)}
                                            {@const checked = isChecked(group, a.id)}
                                            {@const locked = actionLocked(group, a.id)}
                                            <label
                                                class="flex items-center justify-between gap-4 pl-9 pr-3 py-1.5 border-t border-gray-100/70 dark:border-gray-800/70
                                                    {locked
                                                    ? 'cursor-not-allowed'
                                                    : 'cursor-pointer hover:bg-gray-50/60 dark:hover:bg-gray-800/40'}"
                                            >
                                                <span
                                                    class="text-[13px] flex items-center gap-2 min-w-0 dark:text-gray-200"
                                                >
                                                    {#if a.id === "ver"}
                                                        <svg
                                                            class="w-3 h-3 text-gray-400 flex-shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                                                            />
                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="3"
                                                            />
                                                        </svg>
                                                    {/if}
                                                    <span class="truncate"
                                                        >{a.label}</span
                                                    >
                                                </span>
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={checked}
                                                    aria-label={a.label}
                                                    disabled={locked}
                                                    onclick={() =>
                                                        toggleAction(
                                                            group,
                                                            a.id,
                                                        )}
                                                    class="rp-toggle sm {checked
                                                        ? 'on'
                                                        : ''} {locked
                                                        ? 'disabled'
                                                        : ''}"
                                                ></button>
                                            </label>
                                        {/each}
                                    </div>
                                {/each}
                            </div>

                            <!-- Plain-language summary -->
                            <div
                                class="rounded-xl border border-[#d6ebe1] dark:border-[#168561]/30 p-4"
                                style="background: linear-gradient(135deg,#eef7f3,#fff);"
                            >
                                <div class="flex items-center gap-2 mb-3">
                                    <svg
                                        class="w-4 h-4 text-[#115642] dark:text-[#3f9d77]"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle cx="12" cy="12" r="9" />
                                        <line x1="12" y1="11" x2="12" y2="17" />
                                        <circle cx="12" cy="8" r=".6" fill="currentColor" />
                                    </svg>
                                    <h4 class="font-semibold text-sm dark:text-gray-100">
                                        Qué puede hacer este colaborador
                                    </h4>
                                </div>
                                <ul class="space-y-2">
                                    {#each summaryFor(perms) as l, i (i)}
                                        <li
                                            class="flex items-start gap-2 text-sm leading-snug"
                                        >
                                            <span
                                                class="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0
                                                {l.tone === 'yes'
                                                    ? 'bg-[#168561]'
                                                    : l.tone === 'warn'
                                                    ? 'bg-[#A94442]'
                                                    : l.tone === 'soft'
                                                    ? 'bg-gray-300'
                                                    : 'bg-gray-200'}"
                                            ></span>
                                            <span
                                                class={l.tone === "no"
                                                    ? "text-gray-400 line-through decoration-gray-300"
                                                    : l.tone === "warn"
                                                    ? "text-[#A94442] dark:text-[#c25b5e]"
                                                    : "text-gray-700 dark:text-gray-200"}
                                            >
                                                {l.text}
                                            </span>
                                        </li>
                                    {/each}
                                </ul>
                            </div>

                            <div class="h-2"></div>
                        </div>
                    </div>

                    <!-- Sticky action bar -->
                    <div
                        class="border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-4 py-2 flex items-center gap-2"
                    >
                        <div class="ml-auto flex items-center gap-2">
                            {#if dirty}
                                <span
                                    class="text-xs text-amber-600 dark:text-amber-400 font-medium hidden sm:inline"
                                >
                                    Sin guardar
                                </span>
                            {:else}
                                <span
                                    class="text-xs text-gray-400 hidden sm:inline"
                                >
                                    Todo guardado
                                </span>
                            {/if}
                            <Success
                                texto={saving ? "Guardando…" : "Guardar permisos"}
                                disabled={!dirty || saving || isSelf}
                                onclick={guardarPermiso}
                            />
                        </div>
                    </div>
                {/if}
            </main>
        </div>
    </div>
</Navbar2>

{#if toast}
    <div
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        style="animation: slideIn 0.22s ease-out;"
    >
        <div
            class="flex items-center gap-3 rounded-full px-5 py-3 shadow-lg text-sm font-medium text-white
            {toast.kind === 'success' ? 'bg-[#168561]' : 'bg-[#A94442]'}"
        >
            {#if toast.kind === "success"}
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    viewBox="0 0 24 24"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            {:else}
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                    />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <circle cx="12" cy="17" r=".7" fill="currentColor" />
                </svg>
            {/if}
            {toast.msg}
        </div>
    </div>
{/if}

<style>
    .rp-toggle {
        appearance: none;
        width: 44px;
        height: 24px;
        background: #cbd5d2;
        border-radius: 999px;
        position: relative;
        cursor: pointer;
        transition: background 0.18s ease;
        flex-shrink: 0;
        border: none;
        padding: 0;
    }
    .rp-toggle::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 999px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
        transition: transform 0.18s ease;
    }
    .rp-toggle.on {
        background: #168561;
    }
    .rp-toggle.on::after {
        transform: translateX(20px);
    }
    .rp-toggle.disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
    :global(.dark) .rp-toggle {
        background: #2a3335;
    }
    :global(.dark) .rp-toggle.on {
        background: #168561;
    }
    .rp-toggle.sm {
        width: 36px;
        height: 20px;
    }
    .rp-toggle.sm::after {
        width: 16px;
        height: 16px;
    }
    .rp-toggle.sm.on::after {
        transform: translateX(16px);
    }
    .scrollbar-thin::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
        background: rgba(120, 130, 130, 0.35);
        border-radius: 999px;
    }
    .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
    }
    @keyframes slideIn {
        from {
            transform: translateY(8px) translateX(-50%);
            opacity: 0;
        }
        to {
            transform: translateY(0) translateX(-50%);
            opacity: 1;
        }
    }
</style>
