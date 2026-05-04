export async function handleAuthenticatedRequest(url, options) {
    try {
        const response = await fetch(url, options);
        
        if (response.status === 401) {
            // Limpiar localStorage
            //localStorage.removeItem('user');
            // Disparar un evento personalizado
            window.dispatchEvent(new CustomEvent('session-expired', {
                detail: { message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }
            }));
            
            throw new Error('SESIÓN_EXPIRADA');
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}