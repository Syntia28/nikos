type Listener = (...args: any[]) => void;

class EventBus {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, cb: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
    return () => this.off(event, cb);
  }

  off(event: string, cb?: Listener) {
    if (!this.listeners[event]) return;
    if (!cb) {
      delete this.listeners[event];
      return;
    }
    this.listeners[event] = this.listeners[event].filter((l) => l !== cb);
  }

  emit(event: string, ...args: any[]) {
    const list = this.listeners[event] || [];
    list.forEach((cb) => {
      try {
        cb(...args);
      } catch (e) {
        console.error('EventBus handler error', e);
      }
    });
  }
}

const bus = new EventBus();
export default bus;
