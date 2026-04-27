<!-- Toast.svelte -->
<script>
  export let message = "";
  export let type = "info"; // info, success, error, warning
  export let duration = 3000;
  export let position = "center"; // center, top, bottom
  export let customClass = "";

  let visible = true;

  const icons = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ"
  };

  const close = () => {
    visible = false;
  };

  setTimeout(() => {
    visible = false;
  }, duration);
</script>

{#if visible}
  <div class="toast-container toast-{position} {customClass}">
    <div class="toast toast-{type}">
      <div class="toast-icon">{icons[type]}</div>
      <div class="toast-message">{message}</div>
      <button class="toast-close" on:click={close}>×</button>
    </div>
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
  }

  /* Posiciones */
  .toast-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .toast-top {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .toast-bottom {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Estilo base */
  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    min-width: 200px;
    max-width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    border-left: 4px solid;
    font-family: system-ui, -apple-system, sans-serif;
  }

  /* Animación */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Variantes de color */
  .toast-info {
    border-left-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    color: #1e3a8a;
  }

  .toast-success {
    border-left-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
    color: #065f46;
  }

  .toast-error {
    border-left-color: #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    color: #991b1b;
  }

  .toast-warning {
    border-left-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    color: #92400e;
  }

  /* Icono */
  .toast-icon {
    font-size: 20px;
    font-weight: bold;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
  }

  /* Mensaje */
  .toast-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 500;
  }

  /* Botón cerrar */
  .toast-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .toast-close:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
  }
</style>