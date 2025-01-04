if (typeof global !== 'undefined' && !global.Event) {
    class Event {
        constructor(type) {
            this.type = type;
            this.timeStamp = Date.now();
        }
    }
    global.Event = Event;
}

export function setMaxListeners(n, emitter) {
    if (emitter && typeof emitter.setMaxListeners === 'function') {
        emitter.setMaxListeners(n);
    }
}
