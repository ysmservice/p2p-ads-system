class CustomEvent extends Event {
    constructor(type, options = {}) {
        super(type);
        this.detail = options.detail || null;
    }
}

if (typeof global !== 'undefined' && !global.CustomEvent) {
    global.CustomEvent = CustomEvent;
}

export default CustomEvent;
