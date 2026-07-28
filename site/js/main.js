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
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mainNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------- ticker: duplicate track for seamless loop ---------- */
  var ticker = document.getElementById("ticker");
  if (ticker) {
    var track = ticker.querySelector(".ticker-track");
    if (track && !prefersReducedMotion) {
      // clone items until track is at least 2x viewport, then double for the -50% loop
      var items = Array.prototype.slice.call(track.children);
      var safety = 0;
      while (track.scrollWidth < window.innerWidth * 2 && safety < 6) {
        items.forEach(function (el) { track.appendChild(el.cloneNode(true)); });
        safety++;
      }
      var clone = Array.prototype.slice.call(track.children);
      clone.forEach(function (el) {
        var dup = el.cloneNode(true);
        dup.setAttribute("aria-hidden", "true");
        track.appendChild(dup);
      });
    }
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
