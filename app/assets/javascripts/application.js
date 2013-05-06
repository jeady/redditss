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
  var ss = $('#ss');
  var first = ss.children(':first-child');
  var showing = null;
  var interval = null;
  var next = first;
  var showFor = 5000;
  var transitionFor = 1000;

  $('body').keypress(function(e) {
    if (e.which == 'j'.charCodeAt(0)) {
      clearInterval(interval);
      transition();
      interval = setInterval(transition, showFor);
    } else if (e.which == 'k'.charCodeAt(0)) {
      clearInterval(interval);
      next = showing.prev();
      if (next.length === 0) next = ss.children(':last-child');
      transition();
      interval = setInterval(transition, showFor);
    } else if (e.which == 's'.charCodeAt(0)) {
      clearInterval(interval);
      next = first;
      transition();
      interval = setInterval(transition, showFor);
    }
  });

  function transition() {
    var ratio = next.width() / next.height();

    next.css('position', 'absolute');
    next.width(Math.min(next.width(), $(window).width()));
    next.height(next.width() / ratio);

    next.height(Math.min(next.height(), $(window).height()));
    next.width(ratio * next.height());

    next.css('left', (($(window).width() - next.width()) / 2) + 'px');
    next.css('top', (($(window).height() - next.height()) / 2) + 'px');

    if (showing) showing.fadeOut(transitionFor);
    next.fadeIn(transitionFor);

    showing = next;
    next = showing.next();
    if (next.length === 0)
      next = first;

    if (next.next().next().length === 0) {
      jQuery.get($('#after').attr('href'), function(data) {
        $('#after').attr('href', '?after=' + data.next);
        $.each(data.img, function(_, i) {
          ss.append($('<img/>').attr('src', i.url).attr('alt', i.title));
        });
      });
    }
  }

  $('<img/>')
    .load(function() { interval = setInterval(transition, showFor); })
    .error(function() { $('#ss').text('ERROR'); })
    .attr('src', first.attr('src'));
});
