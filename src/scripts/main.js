import SmoothScroll from 'vendors/smooth-scroll-plugin';

(() => {
  'use strict';

  var onComplete = function() {
    return () => {
      if (document.readyState === 'complete') {
        var container = document.querySelector('.smooth-scroll');
        var content = [].slice.call(document.querySelectorAll('.content'));
        var link = [].slice.call(document.querySelectorAll('.scrollTo'));

        var scroller = new SmoothScroll({
          container: container,
          bar: true,
          barSize: 10,
          barDrag: true
        });

        link.forEach(function(el, i) {
          el.onclick = function(event) {
            var index = this.getAttribute('data-index');
            event.preventDefault();
            var position = scroller.getPosition('#test');
            scroller.scrollTo(position.top);
          };
        });
      }
    };
  };
  document.onreadystatechange = onComplete();
})();
