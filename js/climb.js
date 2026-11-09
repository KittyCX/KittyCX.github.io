/* ==========================================================================
   Leo Xu — climbing wall game (the whole site lives on this one page)
   --------------------------------------------------------------------------
   Four holds form a route: About me → Rock Climbing → Projects → Help.
   Tap the correct next hold: it lights up, the hand fades out, re-appears
   at the new hold, fades in — and the hold's popup card opens.
   Tap a wrong hold: the wall shakes, everything falls, and the route resets.
   Progress is kept in localStorage so lit holds stay lit when you come back.
   ========================================================================== */
(function () {
  "use strict";

  var wall = document.getElementById("wall");
  var climber = document.getElementById("climber");
  var holds = Array.prototype.slice.call(document.querySelectorAll(".hold"));

  /* keep the holds in their climb order, whatever the DOM order is */
  holds.sort(function (a, b) {
    return Number(a.dataset.step) - Number(b.dataset.step);
  });

  var STORAGE_KEY = "leoxu.climb.progress";
  var FADE_MS = 380; /* hand fade-out before it re-appears elsewhere */
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

  /* ---------- the hand ---------- */
  function currentHold() {
    return holds[Math.max(0, progress - 1)]; /* grips the highest lit hold */
  }

  /* put the hand at a hold (instant) and swap in the matching colored grip */
  function placeHand(hold) {
    if (!climber || !hold) {
      return;
    }
    climber.style.left = hold.style.getPropertyValue("--x");
    climber.style.top = hold.style.getPropertyValue("--y");
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

  /* fade the hand out, re-appear at the new hold, fade back in */
  function glideHand(hold) {
    if (!climber) {
      return;
    }
    climber.classList.add("is-fading");
    window.setTimeout(function () {
      placeHand(hold);
      /* let the browser register opacity 0 before fading back in */
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          climber.classList.remove("is-fading");
        });
      });
    }, FADE_MS);
  }

  /* ---------- moves ---------- */
  function correctMove(hold) {
    progress = holds.indexOf(hold) + 1;
    hold.classList.add("is-lit");
    save();
    busy = true;
    glideHand(hold);

    /* the card opens as the hand fades back in at its new hold */
    window.setTimeout(function () {
      openModal(hold.dataset.modal, hold);
      busy = false;
    }, FADE_MS + 120);
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
        /* hide the container first so the fallen hand does not snap back */
        climber.classList.add("is-fading");
        climber.classList.remove("is-falling");
        placeHand(currentHold());
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            climber.classList.remove("is-fading");
          });
        });
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
        }, 250);
        return;
      }
      if (i === progress) {
        correctMove(hold);
        return;
      }
      wrongMove(hold);
    });
  });

  /* preload the grip images so swapping never flashes */
  holds.forEach(function (hold) {
    var pre = new Image();
    pre.src = "assets/holds/grip-" + (hold.dataset.color || "red") + ".png";
  });

  /* ---------- start ---------- */
  load();
  holds.forEach(function (hold, i) {
    if (i < progress) {
      hold.classList.add("is-lit");
    }
  });
  placeHand(currentHold());
})();
