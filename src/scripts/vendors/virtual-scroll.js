/*
  To do :

  keydown on container

  extend with scroll bar plugin

*/

class VirtualScroll {

  constructor(opt = {}) {

    this.bindAll([
      'notify',
      'onWheel',
      'onMouseWheel',
      'onTouchStart',
      'onTouchMove',
      /* 'onKeyDown', */
      'targetTester',
      'bind',
      'unbind',
      'on',
      'off'
    ]);

    this.initialized = false;

    this.params = {
      container: {
        el: opt.container || document.body,
        width: opt.container.clientWidth,
        height: opt.container.clientHeight
      },
      direction: opt.direction || 'y',
      ease: opt.ease || 0.17,
      multiplier: {
        firefox: (opt.multiplier) ? opt.multiplier.firefox : 60,
        mouse: (opt.multiplier) ? opt.multiplier.mouse : 0.25,
        touch: (opt.multiplier) ? opt.multiplier.touch : 2
          /* key: opt.multiplier.key || 120 */
      }
    };

    this.event = {
      y: 0,
      x: 0,
      deltaX: 0,
      deltaY: 0,
      touchStartX: 0,
      touchStartY: 0,
      initialStartX: 0,
      initialStartY: 0,
      originalEvent: null,
      tester: {
        wheel: 'onwheel' in document,
        mousewheel: 'onmousewheel' in document,
        touch: 'ontouchstart' in document,
        touchWin: navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1,
        pointer: !!window.navigator.msPointerEnabled
          /* keydown: 'onkeydown' in document */
      }
    };

    this.userAgent = {
      firefox: navigator.userAgent.indexOf('Firefox') > -1
    };

    this.bodyTouchAction = null;

    this.listeners = [];

    this.requestId = null;

    this.bind();

  }

  //============================================================================
  // Helper Method
  //============================================================================

  bindAll(array) {
    array.forEach((f) => {
      this[f] = this[f].bind(this);
    });
  }

  //============================================================================
  // Event Callback Handler
  //============================================================================

  notify(e) {
    this.event.originalEvent = e;

    this.event.x += this.event.deltaX;
    this.event.y += this.event.deltaY;

    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i].call(this, this.event);
    }
  }

  onWheel(e) {
    e.stopPropagation();
    let _e = this.event;
    let multiplier = this.params.multiplier;
    let ua = this.userAgent;

    _e.deltaX = e.wheelDeltaX || e.deltaX * -1;
    _e.deltaY = e.wheelDeltaY || e.deltaY * -1;

    if (ua.firefox && e.deltaMode == 1) {
      _e.deltaX *= multiplier.firefox;
      _e.deltaY *= multiplier.firefox;
    }

    _e.deltaX *= multiplier.mouse;
    _e.deltaY *= multiplier.mouse;

    this.notify(e);

  }

  onMouseWheel(e) {
    e.stopPropagation();
    let _e = this.event;

    _e.deltaX = (e.wheelDeltaX) ? e.wheelDeltaX : 0;
    _e.deltaY = (e.wheelDeltaY) ? e.wheelDeltaY : e.wheelDelta;

    this.notify(e);

  }

  onTouchStart(e) {
    e.stopPropagation();
    let _e = this.event;
    let t = (e.targetTouches) ? e.targetTouches[0] : e;
    _e.touchStartX = t.pageX;
    _e.touchStartY = t.pageY;
    _e.initialStartX = t.pageX;
    _e.initialStartY = t.pageY;
  }

  onTouchMove(e) {
    e.stopPropagation();
    let _e = this.event;
    let multiplier = this.params.multiplier;
    let t = (e.targetTouches) ? e.targetTouches[0] : e;

    _e.deltaX = (t.pageX - _e.touchStartX) * multiplier.touch;
    _e.deltaY = (t.pageY - _e.touchStartY) * multiplier.touch;

    _e.touchStartX = t.pageX;
    _e.touchStartY = t.pageY;

    this.notify(e);

  }

  /* onKeyDown(e){

    this.notify(e);

  } */

  //============================================================================
  // Event Attachment
  //============================================================================
  targetTester(event) {
    if (event.path) {
      for (let i = 0; i < event.path.length; i++) {
        if (event.path[i] === this.params.container.el) {
          event.preventDefault();
          return;
        }
      }
    } else {
      let target;
      if (event.target) {
        target = event.target;
      } else if (event.originalTarget) {
        target = event.originalTarget;
      } else if (event.currentTarget) {
        target = event.originalTarget;
      }
      if (target.offsetParent === this.params.content.el || target.offsetParent.offsetParent === this.params.container.el || target.offsetParent.offsetParent === this.params.content.el || target === this.params.content.el || target === this.params.container.el) {
        event.preventDefault();
        return;
      }
    }
  }

  bind() {
    let _this = this;
    let test = this.event.tester;

    if (test.wheel) {
      document.addEventListener('wheel', event => {
        _this.targetTester(event);
      });
      this.params.container.el.addEventListener('wheel', this.onWheel);
    }

    if (test.mousewheel) {
      document.addEventListener('mousewheel', event => {
        _this.targetTester(event);
      });
      this.params.container.el.addEventListener('mousewheel', this.onMouseWheel);
    }

    if (test.touch) {
      document.addEventListener('touchmove', event => {
        _this.targetTester(event);
      });

      this.params.container.el.addEventListener('touchstart', this.onTouchStart);
      this.params.container.el.addEventListener('touchmove', this.onTouchMove);

    }

    if (test.pointer && test.touchWin) {

      this.bodyTouchAction = this.params.container.el.style.msTouchAction;
      this.params.container.el.style.msTouchAction = 'none';

      this.params.container.el.addEventListener('MSPointerDown', this.onTouchStart);
      this.params.container.el.addEventListener('MSPointerMove', this.onTouchMove);

    }

    /* if(test.keydown){
      this.params.container.el.addEventListener('keydown', onTouchMove);
    } */
    this.initialized = true;
  }

  unbind() {

    let test = this.event.tester;

    if (test.wheel) {

      this.params.container.el.removeEventListener('wheel', this.onWheel);

    }

    if (test.mousewheel) {

      this.params.container.el.removeEventListener('wheel', this.onMouseWheel);

    }

    if (test.touch) {
      let touchmove = function(event) {
        let paths = event.path;
        for (let i = 0; i < paths.length; i++) {
          if (paths[i] === this.params.container.el) {
            event.preventDefault();
          }
        }
      };

      document.removeEventListener('touchmove', this.touchmoveDoc);

      this.params.container.el.removeEventListener('touchstart', this.onTouchStart);
      this.params.container.el.removeEventListener('touchmove', this.onTouchMove);

    }

    if (test.pointer && test.touchWin) {

      this.bodyTouchAction = this.params.container.el.style.msTouchAction;
      this.params.container.el.style.msTouchAction = 'none';

      this.params.container.el.removeEventListener('MSPointerDown', this.onTouchStart);
      this.params.container.el.removeEventListener('MSPointerMove', this.onTouchMove);

    }

    /* if(test.keydown){

      this.params.container.removeEventListener('keydown', onTouchMove);

    } */

    this.initialized = false;
  }

  on(f) {
    if (!this.initialized) {
      this.bind();
    }
    this.listeners.push(f);
  }

  off(f) {
    this.listeners.splice(f, 1);
    if (this.listeners.length <= 0) {
      this.unbind();
    }
  }
}

module.exports = VirtualScroll;
