export class Looper {
  constructor() {
    this.bindAll([
      'loop',
      'start',
      'stop',
      'addCallback',
      'removeCallback'
    ]);

    this.id = undefined;
    this.callback = [];
    this.callbackLength = 0;
  }

  bindAll(array) {
    array.forEach((f) => {
      this[f] = this[f].bind(this);
    });
  }

  addCallback(f) {
    if (typeof f === 'function') {
      this.callback.push(f);
      this.callbackLength = this.callback.length;
    }
  }

  removeCallback(f) {
    if (typeof f === 'function') {
      this.callback.splice(f, 1);
      this.callbackLength = this.callback.length;
    }
  }

  loop() {
    for(let i = 0; i < this.callbackLength; i++){
      if(typeof this.callback[i] === 'function'){
        this.callback[i]();
      }
    }
    window.requestAnimationFrame(this.loop);
  }

  start() {
    if (!this.id) {
      this.loop();
    }
  }

  stop() {
    if (this.id) {
      window.cancelAnimationFrame(this.id);
      this.id = undefined;
    }
  }
}
