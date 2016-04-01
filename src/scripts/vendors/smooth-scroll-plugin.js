import VirtualScroll from 'vendors/virtual-scroll';

Number.prototype.round = function(p) {
  p = p || 10;
  return parseFloat(this.toFixed(p));
};

class SmoothScroll extends VirtualScroll {

  constructor(opt = {}) {

    super(opt);

    this.default = ('default' in opt) ? opt.default : true;

    this.bindAll([
      'addToLoop',
      'removeFromLoop',
      'loop',
      'start',
      'stop',
      'setRatio',
      'setMax',
      'setTransform',
      'createScrollBar',
      'onDraggerMousedown',
      'onDraggerMouseup',
      'onDraggerMousemove',
      'setDraggable',
      'updateScrollBar',
      'scrollTo',
      'getPosition',
      'resize',
      'init'
    ]);

    this.loopMethods = [];

    this.scroll = {
      requestId: undefined,
      isActive: false,
      value: {
        current: 0,
        target: 0,
        relative: 0,
        max: 0
      }
    };

    this.params.content = {
      el: opt.container.children[0],
      width: opt.container.children[0].clientWidth,
      height: opt.container.children[0].clientHeight
    };

    this.params.ratio = this.setRatio();
    this.params.barDrag = opt.barDrag;
    this.isDragging = false;
    this.mouse = {
      x: 0,
      y: 0,
      curr: {
        x: 0,
        y: 0
      },
      ease: 1
    };

    this.scroll.value.max = this.setMax();

    if (opt.bar) {
      this.scroll.bar = {
        size: opt.barSize
      };
      this.scroll.bar.el = this.createScrollBar();
    }

    this.init();

  }

  //============================================================================
  // DEFINE
  //============================================================================

  setRatio(element) {
    let ratio = 1;
    if (this.params.direction === 'x') {
      ratio = this.params.container.width / this.params.content.width;
    } else if (this.params.direction === 'y') {
      ratio = this.params.container.height / this.params.content.height;
    }
    return ratio;
  }

  setMax() {
    let max = 0;

    if (this.params.direction && this.params.direction === 'x') {
      max = (this.params.content.width - this.params.container.width) * -1;
    } else if (this.params.direction && this.params.direction === 'y') {
      max = (this.params.content.height - this.params.container.height) * -1;
    }

    return max;
  }

  setTransform(element, value) {
      let s = element.style;
      let t = '';

      if (this.params.direction === 'x') {
        t = `translateX(${value}px) translateZ(0)`;
      } else if (this.params.direction === 'y') {
        t = `translateY(${value}px) translateZ(0)`;
      }

      s['transform'] = t;
      s['webkitTransform'] = t;
      s['mozTransform'] = t;
      s['msTransform'] = t;
    }
    //============================================================================
    // REQUEST FRAME
    //============================================================================
  addToLoop(f) {
    if (!this.initialized) {
      this.bind();
    }
    this.loopMethods.push(f);
  }

  removeFromLoop(f) {
    this.loopMethods.splice(f, 1);
    if (this.loopMethods.length <= 0) {
      this.unbind();
    }
  }

  loop() {
    if (this.params.container.height < this.params.content.height || this.params.container.width < this.params.content.width) {

      for (let i = 0; i < this.loopMethods.length; i++) {
        this.loopMethods[i].call(this, this.event);
      }

    }
    this.scroll.requestId = window.requestAnimationFrame(this.loop);
  }

  start() {
    if (!this.scroll.requestId) {
      this.loop();
    }
  }

  stop() {
    if (this.scroll.requestId) {
      window.cancelAnimationFrame(this.scroll.requestId);
      this.scroll.requestId = undefined;
    }
  }

  //============================================================================
  // CREATE SCROLL BAR
  //============================================================================
  onDraggerMousedown(event) {
    // let ratio =  this.params.ratio;
    this.isDragging = true;
    this.params.container.el.classList.add('noselect');
    this.mouse.x = event.pageX;
    this.mouse.y = event.pageY;
  }

  onDraggerMousemove(event) {
    if (this.isDragging) {
      let value = this.scroll.value;
      let diff;
      this.mouse.curr.x = event.pageX;
      this.mouse.curr.y = event.pageY;
      diff = this.mouse.y - this.mouse.curr.y;
      value.target = Math.min(value.target + diff / this.params.ratio, 0);
      this.mouse.x = event.pageX;
      this.mouse.y = event.pageY;
    }
  }

  onDraggerMouseup(event) {
    this.isDragging = false;
    this.params.container.el.classList.remove('noselect');
  }

  setDraggable(dragger) {
    var _this = this;
    dragger.addEventListener('mousedown', this.onDraggerMousedown);
    window.addEventListener('mousemove', this.onDraggerMousemove);
    window.addEventListener('mouseup', this.onDraggerMouseup);
    // dragger.addEventListener('mouseleave', this.onDraggerMouseup);
  }

  createScrollBar() {

    let container = this.params.container;
    let content = this.params.content;
    let ratio = this.params.ratio;

    let rail = document.createElement('div');
    let dragger = document.createElement('div');
    let rs = rail.style;
    let ds = dragger.style;

    dragger.classList.add('smooth-scroll-dragger');
    rail.classList.add('smooth-scroll-rail');
    rail.appendChild(dragger);
    this.params.container.el.appendChild(rail);

    switch (this.params.direction) {
      case 'x':
        rs['bottom'] = 0;
        rs['left'] = 0;
        rs['width'] = `${container.width}px`;
        ds['width'] = `${ratio * container.width}px`;
        rs['height'] = `${this.scroll.bar.size}px`;
        ds['height'] = `${this.scroll.bar.size}px`;
        break;
      case 'y':
        rs['top'] = 0;
        rs['right'] = 0;
        rs['height'] = `${container.height}px`;
        ds['height'] = `${ratio * container.height}px`;
        rs['width'] = `${this.scroll.bar.size * 2}px`;
        ds['width'] = `${this.scroll.bar.size}px`;
        ds['marginLeft'] = `${this.scroll.bar.size}px`;
        break;
      default:
        break;
    }

    if (this.params.barDrag) {
      rail.classList.add('draggable');
      this.setDraggable(dragger);
    }

    return {
      rail: rail,
      dragger: dragger
    };
  }

  updateScrollBar() {
    let container = this.params.container;
    let ratio = this.params.ratio;

    let rs = this.scroll.bar.el.rail.style;
    let ds = this.scroll.bar.el.dragger.style;

    switch (this.params.direction) {
      case 'x':
        rs['width'] = `${container.width}px`;
        ds['width'] = `${ratio * container.width}px`;
        break;
      case 'y':
        rs['height'] = `${container.height}px`;
        ds['height'] = `${ratio * container.height}px`;
        break;
      default:
        break;
    }
  }
    //============================================================================
    // SCROLL TO
    //============================================================================
  getPosition(element) {
    var el;
    if(typeof element === 'string'){
      el = document.querySelector(element);
    }else if(typeof element !== 'string' && typeof element !== 'number'){
      el = element;
    }
    var rect = el.getBoundingClientRect(),
      container = this.params.container.el;
    return {
      top: rect.top + container.scrollTop,
      left: rect.left + container.scrollLeft
    };
  }

  scrollTo(value) {
    this.scroll.value.target += -value;
  }
  //============================================================================
  // RESIZE
  //============================================================================

  resize() {
    let container = this.params.container.el;
    let content = this.params.content.el;
    let direction = this.params.direction;

    this.params.container.width = container.clientWidth;
    this.params.container.height = container.clientHeight;
    this.params.content.width = content.clientWidth;
    this.params.content.height = content.clientHeight;

    this.scroll.value.max = this.setMax();
    this.params.ratio = this.setRatio();

    this.updateScrollBar();

  }

  //============================================================================
  // INITIALIZATION
  //============================================================================

  init() {
    let _this = this;
    let delay = 1500;
    let scrollTimeout = null;

    let initialEventHandler = function(event) {
      if (_this.isDragging)
        return;

      let value = this.scroll.value;
      let p = this.params;
      value.target += event.deltaY;
      value.target = Math.max(value.target, value.max);
      value.target = Math.min(value.target, 0);

      if (p.container.height < p.content.height || p.container.width < p.content.width) {

        if (!this.scroll.isActive) {
          this.scroll.isActive = true;
          this.scroll.bar.el.dragger.style['opacity'] = 1;

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(function() {
            _this.scroll.isActive = false;
            _this.scroll.bar.el.dragger.style['opacity'] = 0;
          }, delay);
        }
      }
    };

    let initialLoopHandler = function() {
      let value = this.scroll.value;
      let diff = value.target - value.current;

      let ease = (this.isDragging) ? this.mouse.ease : this.params.ease;

      let updateValue = (diff * ease).round(3);
      let draggerValue;
      let ratio = this.params.ratio;



      value.current = Math.max(value.current + updateValue, value.max);

      draggerValue = Math.max((-value.current * ratio).round(3), value.max * ratio);
      value.relative = (value.current / value.max);

      this.setTransform(this.scroll.bar.el.dragger, draggerValue);
      this.setTransform(this.params.content.el, value.current);
    };

    if (this.default) {
      this.on(initialEventHandler);
      this.addToLoop(initialLoopHandler);
    }

    // if ('DOMSubtreeModified' in document) {
    //   this.params.content.el.addEventListener('DOMSubtreeModified', this.resize);
    // } else {
    //   let config = { attributes: true, childList: true, characterData: true };
    //   let observer = new MutationObserver(function(mutations) {
    //     _this.resize();
    //   });
    //   observer.observe(this.params.content.el, config);
    // }

    window.addEventListener('resize', this.resize);

    this.start();
  }

}

module.exports = SmoothScroll;
