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
  var showing = null;
  var interval = null;
  var showFor = 5000;
  var fade = false;
  var transitionFor = 1000;
  var loadMore = true;
  var showTitles = true;
  var paused = false;
  var fetchWhen = 5;
  var preload = 2;
  var loadMax = 100;
  var showingUrls = [];
  var allImg = [];
  var toShow = [];
  var showed = [];

  ss.children().each(function(_, e) {
    showingUrls.push(e.src);
  });

  $('body').keypress(function(e) {
    if (e.which == 'j'.charCodeAt(0)) {
      transition_next_now();
    } else if (e.which == 'k'.charCodeAt(0)) {
      transition_prev_now();
    } else if (e.which == 's'.charCodeAt(0)) {
      if (!paused) clearInterval(interval);
      var i;
      toShow = [];
      for (i = 0; i < allImg.length; i++)
        toShow.push(allImg[i]);
      for (i = 0; i <= preload; i++)
        transition_next();
      for (i = 0; i < allImg.length; i++)
        showed.push(allImg[i]);
      if (!paused) interval = setInterval(transition_next, showFor);
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
    .bind('swiperight', transition_prev_now)
    .bind('swipeleft', transition_next_now)
    .bind('tap', pause);

  function transition_next_now() {
    if (!paused) clearInterval(interval);
    transition_next();
    if (!paused) interval = setInterval(transition_next, showFor);
  }
  function transition_next() {
    center(next);

    if (showing) hide(showing);
    show(next);

    showing = next;
    next = showing.next();
    if (showTitles)
      flash(showing.attr('alt'));

    prepareNext();
  }
  function transition_prev_now() {
    if (!paused) clearInterval(interval);
    next = showing.prev();
    if (next.length === 0) flash('ERROR');

    center(next);

    if (showing) hide(showing);
    show(next);

    showing = next;
    next = showing.next();
    if (showTitles)
      flash(showing.attr('alt'));

    preparePrev();
    if (!paused) interval = setInterval(transition_next, showFor);
  }
  function pause() {
    paused = !paused;
    if (paused) {
      flash('Paused.');
      clearInterval(interval);
    } else {
      flash('Playing.');
      interval = setInterval(transition_next, showFor);
    }
  }
  function show(img) {
    if (fade)
      img.fadeIn(transitionFor);
    else
      img.show();
  }
  function hide(img) {
    if (fade)
      img.fadeOut(transitionFor);
    else
      img.hide();
  }

  function center(img) {
    var ratio = img.width() / img.height();

    img.css('position', 'absolute');
    img.width(Math.min(img.width(), $(window).width()));
    img.height(img.width() / ratio);

    img.height(Math.min(img.height(), $(window).height()));
    img.width(ratio * img.height());

    img.css('left', (($(window).width() - img.width()) / 2) + 'px');
    img.css('top', (($(window).height() - img.height()) / 2) + 'px');
  }

  function prepareNext() {
    var next = toShow.shift();
    ss.append($('<img/>').attr('src', next.url).attr('alt', next.alt));
    var last = ss.children(':first-child');
    showed.push({url: last.attr('src'), alt: last.attr('alt')});
    last.remove();

    if (toShow.length == fetchWhen) {
      if (allImg.length < loadMax && loadMore) {
        fetch_more();
      } else {
        toShow = toShow.concat(allImg);
      }
    }

    if (showed.length == 2 * fetchWhen + allImg.length)
      showed = showed.slice(showed.length - allImg.length);
  }

  function preparePrev() {
    var next = showed.pop();
    ss.prepend($('<img/>').attr('src', next.url).attr('alt', next.alt));
    var last = ss.children(':last-child');
    toShow.unshift({url: last.attr('src'), alt: last.attr('alt')});
    last.remove();

    if (showed.length == fetchWhen) {
      showed = allImg.concat(showed);
    }
  }

  function fetch_more(cb) {
    if (typeof(cb) == 'undefined')
      cb = function() {};
    jQuery.get($('#after').attr('href'), function(data) {
      $('#after').attr('href', '/fetch/after/' + data.next);
      $.each(data.img, function(_, i) {
        if (allImg.length < loadMax && -1 == showingUrls.indexOf(i.url)) {
          showingUrls.push(i.url);
          allImg.push({url: i.url, alt: i.title});
          toShow.push({url: i.url, alt: i.title});
        }
      });
      cb();
    });
  }

  function flash(text) {
    var e = $('<div/>').text(text).addClass('flash');
    e.hide();
    $('#flashes').append(e);
    show(e);
    window.setTimeout(function() {
      hide(e);
      window.setTimeout(function() {
        e.remove();
      }, 700);
    }, showFor);
  }

  // Begin.
  fetch_more(function() {
    var i;
    for (i = 0; i < allImg.length; i++)
      showed.push(allImg[i]);
    for (i = 0; i < preload; i++)
      toShow.unshift(allImg[allImg.length - 1 - i]);
    for (i = 0; i < preload * 2 + 1; i++) {
      var e = toShow.shift();
      var img = $('<img/>').attr('src', e.url).attr('alt', e.alt);
      ss.append(img);
      if (i == preload) {
        showing = img;
      } else if (i == preload + 1) {
        next = img;
      }
    }

    center(showing);
    showing
     .load(function() {
       showing.show();
       interval = setInterval(transition_next, showFor); })
     .error(function() { $('#ss').text('ERROR'); });
  });
});
