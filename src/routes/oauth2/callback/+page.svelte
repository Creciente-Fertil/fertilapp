<script>
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation'
    import { enabled } from '$lib/stores/enabled'
    import { setUser } from '$lib/userstorage/usersotrage'
    import { saveStorageEstablecimiento } from '$lib/java/establecimientos/establecimientostorage'
    import { getMe } from '$lib/java/usuarios/usuariosback'

    let pre = import.meta.env.VITE_PRE

    onMount(async () => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if (!token) {
            goto(pre + '/login')
            return
        }

        try {
            // El OAuth handler nos manda solo el token via URL. Para
            // dejar el front en el mismo estado que tras un login con
            // email/password, llamamos a /api/auth/me y persistimos
            // userId + email + establishments + level + planName.
            const me = await getMe(token)

            setUser({
                useremail: me.email || '',
                token,
                id: me.userId,
                level: me.level ?? null,
                planName: me.planName ?? null,
                establishments: me.establishments || [],
            })

            if (me.establishmentId) {
                saveStorageEstablecimiento({
                    exist: true,
                    id: me.establishmentId,
                    nombre: me.establishmentName,
                })
            } else {
                saveStorageEstablecimiento({
                    exist: false,
                    id: '',
                    nombre: '',
                })
            }

            enabled.set('si')
            // limpiar el token de la URL antes de navegar
            window.history.replaceState({}, '', pre + '/oauth2/callback')
            goto(pre + '/')
        } catch (err) {
            console.error('oauth2/callback: getMe falló', err)
            goto(pre + '/login')
        }
    })
</script>
