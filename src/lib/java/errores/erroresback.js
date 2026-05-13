export async function handleAuthenticatedRequest(url, options) {
    try {
        const response = await fetch(url, options);
        
        if (response.status === 401 || response.status === 403) {
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
export async function handleTransferRequest(url, options) {
    try {
        const response = await fetch(url, options);
        
        if (response.status === 400 ) {
            
            
            throw new Error('transfer');
        }
        if ( response.status === 404) {
            
            
            throw new Error('renspa');
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}