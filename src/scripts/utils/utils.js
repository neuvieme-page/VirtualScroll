var Utils = (() => {

  // WINDOW SIZE
  // ===========================================================================
  window._SIZE = (function() {
    var obj = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    window.addEventListener('resize', function() {
      this._SIZE.width = window.innerWidth;
      this._SIZE.height = window.innerHeight;
    });
    return obj;
  })();
  // REQUESTANIMATIONFRAME MODULE W/ START STOP ENGINE
  // ===========================================================================
  // window._raf = (function() {
  //   var _loop = function(requestId, callback) {
  //     if (callback && typeof callback === 'function') {
  //       callback();
  //       requestId = requestAnimationFrame(_loop.bind(this));
  //     }
  //   };
  //
  //   var _stop = function(requestId) {
  //     if (requestId) {
  //       window.cancelAnimationFrame(requestId);
  //       requestId = undefined;
  //     }
  //   };
  //
  //   var _start = function(requestId) {
  //     if (!requestId) {
  //       _loop();
  //     }
  //   };
  //
  //   return {
  //     create: function(params){
  //       var obj = Object.create();
  //       obj.vars = {
  //         requestId: params.id,
  //         callback: params.callback
  //       };
  //
  //       obj.loop = _loop.bind(this, this.vars.)
  //       obj.start = _start.bind(this, this.vars.requestId);
  //       obj.stop = _stop.bind(this, this.vars.requestId);
  //       return obj;
  //     }
  //   };
  // })();

  // CUSTOM EVENT HANDLER
  // ===========================================================================

  window.handleEvent = function(eventName, {
    element,
    callback,
    useCapture = false
  } = {}, thisArg) {

    const el = element || document.documentElement;

    function handler(event) {
      if (typeof callback === 'function') {
        callback.call(thisArg, event);
      }
    }

    handler.destroy = function() {
      return el.removeEventListener(eventName, handler, useCapture);
    };

    el.addEventListener(eventName, handler, useCapture);
    return handler;
  };

  // MUTATION OBSERVER @todo improve conditional arguments
  // ===========================================================================

  const observeConfig = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true
  };

  window.initExtension = function(rootElement, targetSelector, subTargetSelector) {
    var rootObserver = new MutationObserver(function(mutations) {
      console.log("Inside root observer");
      var targetElement = rootElement.querySelector(targetSelector);
      if (targetElement) {
        rootObserver.disconnect();

        var elementObserver = new MutationObserver(function(mutations) {
          console.log("Inside element observer");
          var subTargetElement = targetElement.querySelector(subTargetSelector);
          if (subTargetElement) {
            elementObserver.disconnect();
            console.log("subTargetElement found!");
          }
        });

        elementObserver.observe(targetElement, observeConfig);
      }
    });
    rootObserver.observe(rootElement, observeConfig);
  };

})();

module.exports = Utils;
