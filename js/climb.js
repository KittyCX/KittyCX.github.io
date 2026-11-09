/* ==========================================================================
   Leo Xu — climbing wall game (homepage)
   --------------------------------------------------------------------------
   Four holds form a route: About me → Rock Climbing → Projects → Help.
   Tap the correct next hold: it lights up, the route line draws to it,
   the climber moves up, and its page opens.
   Tap a wrong hold: the wall shakes, everything falls, and the route resets.
   Progress is kept in localStorage so lit holds stay lit when you come back.
   ========================================================================== */
(function () {
  "use strict";

  var wall = document.getElementById("wall");
  var status = document.getElementById("climbStatus");
  var climber = document.getElementById("climber");
  var holds = Array.prototype.slice.call(document.querySelectorAll(".hold"));
  var segments = Array.prototype.slice.call(document.querySelectorAll(".route-seg"));

  /* keep the holds in their climb order, whatever the DOM order is */
  holds.sort(function (a, b) {
    return Number(a.dataset.step) - Number(b.dataset.step);
  });

  var STORAGE_KEY = "leoxu.climb.progress";
  var MOVE_MS = 550; /* climber step duration — keep in sync with CSS */
  var OPEN_MS = 950; /* pause so the lit hold is visible before navigating */
  var FALL_MS = 850; /* falling animation duration */

  var progress = 0;
  var busy = false;

  /* ---------- progress persistence ---------- */
  function load() {
    try {
      var v = parseInt(window.localStorage.getItem(STORAGE_KEY), 10);
      if (v >= 0 && v <= holds.length) {
        progress = v;
      }
    } catch (err) {
      /* localStorage blocked — play without saving */
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(progress));
    } catch (err) {
      /* ignore */
    }
  }

  /* ---------- visuals ---------- */
  function paintRoute() {
    /* segment i joins hold i and hold i+1 — show it once both ends are lit */
    segments.forEach(function (seg, i) {
      seg.classList.toggle("is-on", progress >= i + 2);
    });
  }

  function holdX(hold) {
    return hold.style.getPropertyValue("--x");
  }

  function holdY(hold) {
    return hold.style.getPropertyValue("--y");
  }

  function moveClimber() {
    if (!climber) {
      return;
    }
    var idx = Math.max(0, progress - 1); /* stands on the highest lit hold */
    var hold = holds[idx];
    if (!hold) {
      return;
    }
    climber.style.left = holdX(hold);
    climber.style.top = holdY(hold);
  }

  function say(message, isBad) {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.classList.toggle("is-bad", Boolean(isBad));
    status.classList.add("is-on");
  }

  /* ---------- moves ---------- */
  function correctMove(hold, i) {
    progress = i + 1;
    hold.classList.add("is-lit");
    save();
    paintRoute();
    moveClimber();

    if (progress === holds.length) {
      say("Summit! Every hold is lit — opening the last page.");
    } else {
      say("Nice move — opening " + hold.dataset.name + "…");
    }

    busy = true;
    window.setTimeout(function () {
      window.location.href = hold.dataset.href;
    }, OPEN_MS);
  }

  function wrongMove(hold) {
    busy = true;
    hold.classList.add("is-wrong");
    wall.classList.add("is-shake");
    say("Wrong hold — you fell! Climb again.", true);

    /* let the wrong hold flash first, then the whole route falls */
    window.setTimeout(function () {
      hold.classList.remove("is-wrong");
      wall.classList.remove("is-shake");
      climber.classList.add("is-falling");
      holds.forEach(function (h, i) {
        h.style.setProperty("--fall-delay", i * 70 + "ms");
        h.classList.add("is-falling");
      });

      window.setTimeout(function () {
        progress = 0;
        save();
        holds.forEach(function (h) {
          h.classList.remove("is-falling", "is-lit");
        });
        climber.classList.remove("is-falling");
        paintRoute();
        moveClimber();
        say("Back to the ground — start again!");
        busy = false;
      }, FALL_MS);
    }, 420);
  }

  /* ---------- wire up ---------- */
  holds.forEach(function (hold, i) {
    hold.addEventListener("click", function () {
      if (busy) {
        return;
      }
      if (i < progress) {
        /* already climbed — the page stays open for a revisit */
        say("Revisiting " + hold.dataset.name + "…");
        busy = true;
        window.setTimeout(function () {
          window.location.href = hold.dataset.href;
        }, 400);
        return;
      }
      if (i === progress) {
        correctMove(hold, i);
        return;
      }
      wrongMove(hold);
    });
  });

  /* ---------- start ---------- */
  load();
  holds.forEach(function (hold, i) {
    if (i < progress) {
      hold.classList.add("is-lit");
    }
  });
  paintRoute();
  moveClimber();
  /* enable the climb transition only after the first position is set */
  window.requestAnimationFrame(function () {
    if (climber) {
      climber.classList.add("is-ready");
    }
  });
})();
