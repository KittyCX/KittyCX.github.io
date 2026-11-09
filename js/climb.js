/* ==========================================================================
   Leo Xu — climbing wall game (the whole site lives on this one page)
   --------------------------------------------------------------------------
   Four holds form a route: About me → Rock Climbing → Projects → Help.
   Tap the correct next hold: it lights up, the route line draws to it,
   the chalk hand moves up, and the hold's popup card opens.
   Tap a wrong hold: the wall shakes, everything falls, and the route resets.
   Progress is kept in localStorage so lit holds stay lit when you come back.
   ========================================================================== */
(function () {
  "use strict";

  var wall = document.getElementById("wall");
  var climber = document.getElementById("climber");
  var holds = Array.prototype.slice.call(document.querySelectorAll(".hold"));
  var segments = Array.prototype.slice.call(document.querySelectorAll(".route-seg"));

  /* keep the holds in their climb order, whatever the DOM order is */
  holds.sort(function (a, b) {
    return Number(a.dataset.step) - Number(b.dataset.step);
  });

  var STORAGE_KEY = "leoxu.climb.progress";
  var OPEN_MS = 550; /* pause so the lit hold is visible before the card opens */
  var FALL_MS = 850; /* falling animation duration */

  var progress = 0;
  var busy = false;
  var lastTrigger = null; /* hold that opened the current card */

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

  /* ---------- popup cards ---------- */
  function openModal(id, trigger) {
    var modal = document.getElementById(id);
    if (!modal) {
      return;
    }
    lastTrigger = trigger || null;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-modal");
    var closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeModal() {
    var open = document.querySelector(".modal.is-open");
    if (!open) {
      return;
    }
    open.classList.remove("is-open");
    open.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-modal");
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  /* close on the × button or the backdrop */
  document.addEventListener("click", function (e) {
    var closer = e.target.closest ? e.target.closest("[data-close]") : null;
    if (closer) {
      closeModal();
    }
  });

  /* close on Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
      closeModal();
    }
  });

  /* ---------- visuals ---------- */
  function paintRoute() {
    /* segment i joins hold i and hold i+1 — show it once both ends are lit */
    segments.forEach(function (seg, i) {
      seg.classList.toggle("is-on", progress >= i + 2);
    });
  }

  function moveClimber() {
    if (!climber) {
      return;
    }
    var idx = Math.max(0, progress - 1); /* grips the highest lit hold */
    var hold = holds[idx];
    if (!hold) {
      return;
    }
    climber.style.left = hold.style.getPropertyValue("--x");
    climber.style.top = hold.style.getPropertyValue("--y");

    /* swap in the matching colored grip and hide the wall hold beneath */
    var img = climber.querySelector("img");
    if (img) {
      var want = "assets/holds/grip-" + (hold.dataset.color || "red") + ".png";
      if (img.getAttribute("src") !== want) {
        img.setAttribute("src", want);
      }
    }
    holds.forEach(function (h) {
      h.classList.toggle("is-gripped", h === hold);
    });
  }

  /* preload the grip images so swapping never flashes */
  holds.forEach(function (hold) {
    var pre = new Image();
    pre.src = "assets/holds/grip-" + (hold.dataset.color || "red") + ".png";
  });

  /* ---------- moves ---------- */
  function correctMove(hold, i) {
    progress = i + 1;
    hold.classList.add("is-lit");
    save();
    paintRoute();
    moveClimber();

    busy = true;
    window.setTimeout(function () {
      openModal(hold.dataset.modal, hold);
      busy = false;
    }, OPEN_MS);
  }

  function wrongMove(hold) {
    busy = true;
    hold.classList.add("is-wrong");
    wall.classList.add("is-shake");

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
        /* already climbed — the card stays available for a revisit */
        busy = true;
        window.setTimeout(function () {
          openModal(hold.dataset.modal, hold);
          busy = false;
        }, 300);
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
