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
  var loadMore = true;
  var showTitles = true;
  var paused = false;
  var showingUrls = [];

  ss.children().each(function(_, e) {
    showingUrls.push(e.src);
  });

  $('body').keypress(function(e) {
    if (e.which == 'j'.charCodeAt(0)) {
      transition_next();
    } else if (e.which == 'k'.charCodeAt(0)) {
      transition_prev();
    } else if (e.which == 's'.charCodeAt(0)) {
      if (!paused) clearInterval(interval);
      next = first;
      transition();
      if (!paused) interval = setInterval(transition, showFor);
    } else if (e.which == 'i'.charCodeAt(0)) {
      flash(showing.prevAll().size() + ' / ' + ss.children().size());
    } else if (e.which == 'l'.charCodeAt(0)) {
      loadMore = !loadMore;
      if (loadMore) flash('Infinite.');
      else flash('Looping.');
    } else if (e.which == 't'.charCodeAt(0)) {
      showTitles = !showTitles;
    } else if (e.which == 'p'.charCodeAt(0)) {
      pause();
    }
  });
  $('body').addSwipeEvents()
    .bind('swiperight', transition_prev)
    .bind('swipeleft', transition_next)
    .bind('tap', pause);

  function transition_next() {
    if (!paused) clearInterval(interval);
    transition();
    if (!paused) interval = setInterval(transition, showFor);
  }
  function transition_prev() {
    if (!paused) clearInterval(interval);
    next = showing.prev();
    if (next.length === 0) next = ss.children(':last-child');
    transition();
    if (!paused) interval = setInterval(transition, showFor);
  }
  function pause() {
    paused = !paused;
    if (paused) {
      flash('Paused.');
      clearInterval(interval);
    } else {
      flash('Playing.');
      interval = setInterval(transition, showFor);
    }
  }

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
    if (showTitles)
      flash(showing.attr('alt'));

    if (loadMore && next.next().next().length === 0) {
      jQuery.get($('#after').attr('href'), function(data) {
        $('#after').attr('href', '?after=' + data.next);
        $.each(data.img, function(_, i) {
          if (-1 == showingUrls.indexOf(i.url)) {
            showingUrls.push(i.url);
            ss.append($('<img/>').attr('src', i.url).attr('alt', i.title));
          }
        });
      });
    }
  }

  $('<img/>')
    .load(function() { interval = setInterval(transition, showFor); })
    .error(function() { $('#ss').text('ERROR'); })
    .attr('src', first.attr('src'));

  function flash(text) {
    var e = $('<div/>').text(text).addClass('flash');
    e.hide();
    $('#flashes').append(e);
    e.fadeIn(500);
    window.setTimeout(function() {
      e.fadeOut(500);
      window.setTimeout(function() {
        e.remove();
      }, 700);
    }, 2000);
  }
});
