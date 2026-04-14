<script>
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation'
    import { usuario } from '$lib/stores/usuario'
    import { enabled } from '$lib/stores/enabled'

    let pre = import.meta.env.VITE_PRE

    onMount(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        console.log(token)
        if (token) {
            usuario.set(token)
            enabled.set('si')
            // limpiar el token de la URL antes de navegar
            window.history.replaceState({}, '', pre + '/oauth2/callback')
            goto(pre + '/')
        } else {
            goto(pre + '/login')
        }
    })
</script>
