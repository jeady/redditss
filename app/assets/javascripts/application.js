// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

$(function() {
  var first = $('#ss').children(':first-child');
  var showing = null;
  var nextTimeout = null;
  var showNext = function() {
    $('<img/>')
      .load(function() { show(false, first); })
      .error(function() { $('#ss').text('ERROR'); })
      .attr('src', first.attr('src'));
  };

  $('body').keypress(function(e) {
    if (e.which == 'j'.charCodeAt(0)) {
      clearTimeout(nextTimeout);
      show(showing, showing.next());
    } else if (e.which == 'k'.charCodeAt(0)) {
      clearTimeout(nextTimeout);
      show(showing, showing.prev());
    }
  });

  function show(last, next) {
    var ratio = next.width() / next.height();
    showing = next;

    next.css('position', 'absolute');
    next.width(Math.min(next.width(), $(window).width()));
    next.height(next.width() / ratio);

    next.height(Math.min(next.height(), $(window).height()));
    next.width(ratio * next.height());

    next.css('left', (($(window).width() - next.width()) / 2) + 'px');
    next.css('top', (($(window).height() - next.height()) / 2) + 'px');

    if (last) last.fadeOut(1000);
    next.fadeIn(1000);

    showNext = function() {
      last = next;
      next = next.next();
      if (next.length === 0) {
        //next = first;
        window.location = $('#after').attr('href');
      }
      show(last, next);
    };
    nextTimeout = window.setTimeout(showNext, 5000);
  }

  showNext();
});
