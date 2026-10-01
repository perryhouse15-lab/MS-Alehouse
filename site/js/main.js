/* Mississippi Ale House — interactions */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    var setNav = function (open) {
      mainNav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      // the panel covers the page, so stop the page behind it from scrolling
      document.documentElement.classList.toggle("no-scroll", open);
    };
    var navIsOpen = function () { return mainNav.classList.contains("is-open"); };

    navToggle.addEventListener("click", function () { setNav(!navIsOpen()); });

    mainNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (e) {
      if (!navIsOpen()) return;

      if (e.key === "Escape") {
        setNav(false);
        navToggle.focus();
        return;
      }

      /* keep Tab inside the open panel. Source order matters: the toggle button
         follows the nav in the DOM, so it is the last stop, not the first. */
      if (e.key !== "Tab") return;
      var focusable = Array.prototype.slice
        .call(mainNav.querySelectorAll("a[href]"))
        .concat([navToggle]);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* a resize past the mobile breakpoint leaves the panel irrelevant — reset it.
       addEventListener on a MediaQueryList is missing on older Safari, and an
       uncaught throw here would take the rest of this file down with it. */
    var desktopMQ = window.matchMedia("(min-width: 768px)");
    var onBreakpoint = function (e) { if (e.matches && navIsOpen()) setNav(false); };
    if (desktopMQ.addEventListener) desktopMQ.addEventListener("change", onBreakpoint);
    else if (desktopMQ.addListener) desktopMQ.addListener(onBreakpoint);
  }

  /* ---------- ticker: duplicate track for seamless loop ---------- */
  var ticker = document.getElementById("ticker");
  var tickerTrack = ticker && ticker.querySelector(".ticker-track");
  if (tickerTrack && !prefersReducedMotion) {
    // every clone is decorative — only the original set should reach a screen reader
    var addClones = function (source) {
      source.forEach(function (el) {
        var dup = el.cloneNode(true);
        dup.setAttribute("aria-hidden", "true");
        tickerTrack.appendChild(dup);
      });
    };
    // clone items until the track is at least 2x viewport, then double for the -50% loop
    var items = Array.prototype.slice.call(tickerTrack.children);
    var safety = 0;
    while (tickerTrack.scrollWidth < window.innerWidth * 2 && safety < 6) {
      addClones(items);
      safety++;
    }
    addClones(Array.prototype.slice.call(tickerTrack.children));
  }

  /* ---------- motion controls (WCAG 2.2.2: anything moving >5s needs a pause) ----------
     aria-pressed is the state: "false" = running, "true" = paused. The button is
     revealed only once there is actually motion to stop. */
  function wireMotionToggle(btn, label, pause, play) {
    if (!btn) return null;
    var text = btn.querySelector(".motion-toggle-text");
    var paused = false;
    var render = function () {
      btn.setAttribute("aria-pressed", String(paused));
      if (text) text.textContent = (paused ? "Play " : "Pause ") + label;
    };
    btn.addEventListener("click", function () {
      paused = !paused;
      (paused ? pause : play)();
      render();
    });
    render();
    btn.hidden = false;
    return btn;
  }

  /* ---------- hero video ---------- */
  var heroVideo = document.getElementById("heroVideo");
  var heroMotionToggle = document.getElementById("heroMotionToggle");
  if (heroVideo && !prefersReducedMotion) {
    // markup carries no `autoplay`, so reduced-motion visitors never fetch the file.
    // The control is revealed on the play *attempt*, not on the promise settling:
    // play() can stay pending while the video is already moving, and motion without
    // a pause control is the exact thing this is here to prevent.
    var heroToggle = wireMotionToggle(
      heroMotionToggle,
      "background video",
      function () { heroVideo.pause(); },
      function () { heroVideo.play(); }
    );
    var started = heroVideo.play();
    if (started && typeof started.catch === "function") {
      started.catch(function (err) {
        // Only a refusal means nothing will ever move. An AbortError just means the
        // pending play was interrupted — which is what happens when someone hits
        // pause before playback begins, and the control is still needed then.
        if (err && err.name === "NotAllowedError" && heroToggle) heroToggle.hidden = true;
      });
    }
  }

  /* ---------- ticker pause control ---------- */
  if (tickerTrack && !prefersReducedMotion) {
    wireMotionToggle(
      document.getElementById("tickerMotionToggle"),
      "scrolling highlights",
      function () { tickerTrack.classList.add("is-paused"); },
      function () { tickerTrack.classList.remove("is-paused"); }
    );
  }

  /* ---------- preloader ---------- */
  var preloader = document.getElementById("preloader");
  if (preloader && (!window.gsap || prefersReducedMotion)) {
    // no animation available: never block the page
    preloader.remove();
    preloader = null;
  }

  /* ---------- GSAP animations ---------- */
  if (window.gsap && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    var heroIntroVars = {
      y: 42,
      opacity: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.09
    };

    if (preloader) {
      /* bottle fill + live counter, then arc curtain reveal */
      document.documentElement.classList.add("no-scroll");
      window.scrollTo(0, 0);
      gsap.set(".anim-hero", { y: heroIntroVars.y, opacity: 0 });

      var preCount = document.getElementById("preCount");
      var liquidG = document.getElementById("liquidG");
      var progress = { v: 0 };

      var tl = gsap.timeline();
      tl.to(progress, {
        v: 100,
        duration: 2.4,
        ease: "power1.inOut",
        onUpdate: function () {
          var v = Math.round(progress.v);
          preCount.textContent = String(v);
          /* liquid top: y=266 (empty) -> y=40 (full neck) */
          liquidG.setAttribute("transform", "translate(0 " + (266 - v * 2.26) + ")");
        }
      });
      /* curtain rises; the arc svg trails below so the boundary stays curved */
      tl.to(preloader, {
        yPercent: -120,
        duration: 1.05,
        ease: "expo.inOut",
        onComplete: function () {
          preloader.remove();
          document.documentElement.classList.remove("no-scroll");
        }
      }, "+=0.3");
      tl.to(".anim-hero", {
        y: 0,
        opacity: 1,
        duration: heroIntroVars.duration,
        ease: heroIntroVars.ease,
        stagger: heroIntroVars.stagger
      }, "<0.45");
    } else {
      /* hero entrance without preloader */
      gsap.from(".anim-hero", Object.assign({ delay: 0.15 }, heroIntroVars));
    }

    /* section reveals */
    gsap.utils.toArray(".section-head, .about-copy > *, .visit-info > *").forEach(function (el) {
      gsap.from(el, {
        y: 34,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    /* card grid stagger */
    gsap.from(".xcard", {
      y: 46,
      opacity: 0,
      duration: 0.75,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".card-grid", start: "top 82%" }
    });

    /* lineup rows */
    gsap.from(".lineup-row", {
      x: -30,
      opacity: 0,
      duration: 0.6,
      ease: "expo.out",
      stagger: 0.07,
      scrollTrigger: { trigger: ".lineup", start: "top 85%" }
    });

    /* about photo parallax-lite */
    gsap.from(".about-media", {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".about-grid", start: "top 80%" }
    });

    /* stat count-up */
    gsap.utils.toArray(".stat-num[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: function () { el.textContent = Math.round(obj.val); }
      });
    });
  }
})();
