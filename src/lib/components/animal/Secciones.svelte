<script>
    let {
        contactos = $bindable(true),
        coninse = $bindable(true),
        conser = $bindable(true),
        conobser = $bindable(true),
        contrata = $bindable(true),
        conpari = $bindable(true),

        changeCampo = () => {},
    } = $props();
</script>

<div class="grid grid-cols-2 md:grid-cols-3 gap-1">
    <div>
        <label class="label cursor-pointer justify-start gap-2">
            <input
                type="checkbox"
                class={`checkbox checkbox-sm  border-green-500 [--chkbg:theme(colors.green.600)]`}
                onchange={changeCampo}
                bind:checked={coninse}
            />
            <span>Inseminaciones</span>
        </label>
    </div>
    <div>
        <label class="label cursor-pointer justify-start gap-2">
            <input
                type="checkbox"
                class={`checkbox checkbox-sm  border-green-500 [--chkbg:theme(colors.green.600)]`}
                onchange={changeCampo}
                bind:checked={conser}
            />
            <span>Servicios</span>
        </label>
    </div>
    <div>
        <label class="label cursor-pointer justify-start gap-2">
            <input
                type="checkbox"
                class={`checkbox checkbox-sm  border-green-500 [--chkbg:theme(colors.green.600)]`}
                onchange={changeCampo}
                bind:checked={contactos}
            />
            <span>Tactos</span>
        </label>
    </div>
    <div>
        <label class="label cursor-pointer justify-start gap-2">
            <input
                type="checkbox"
                class={`checkbox checkbox-sm  border-green-500 [--chkbg:theme(colors.green.600)]`}
                onchange={changeCampo}
                bind:checked={conobser}
            />
            <span>Observaciones</span>
        </label>
    </div>
    <div>
        <label class="label cursor-pointer justify-start gap-2">
            <input
                type="checkbox"
                class={`checkbox checkbox-sm  border-green-500 [--chkbg:theme(colors.green.600)]`}
                onchange={changeCampo}
                bind:checked={contrata}
            />
            <span>Tratamientos</span>
        </label>
    </div>
    <div>
        <label class="label cursor-pointer justify-start gap-2">
            <input
                type="checkbox"
                class={`checkbox checkbox-sm  border-green-500 [--chkbg:theme(colors.green.600)]`}
                onchange={changeCampo}
                bind:checked={conpari}
            />
            <span>Pariciones</span>
        </label>
    </div>
</div>
