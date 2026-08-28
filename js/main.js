/* Lumo — shared site interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- App Store link ----------
     TODO: once the app is live, paste the real App Store URL here —
     every button with class .js-appstore will pick it up automatically. */
  var APPSTORE_URL = "https://apps.apple.com/app/id6792762718";
  if (APPSTORE_URL) {
    document.querySelectorAll(".js-appstore").forEach(function (a) {
      a.setAttribute("href", APPSTORE_URL);
      a.setAttribute("rel", "noopener");
    });
  }

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = nav.querySelector(".nav-burger");
    if (burger) {
      burger.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll(".nav-links a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---------- Scroll-reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Screenshot carousel: buttons + drag ---------- */
  document.querySelectorAll(".carousel-outer").forEach(function (outer) {
    var track = outer.querySelector(".carousel");
    if (!track) return;

    var step = function () {
      var shot = track.querySelector(".shot");
      return shot ? shot.getBoundingClientRect().width + 24 : 300;
    };

    var prev = outer.querySelector("[data-dir='prev']");
    var next = outer.querySelector("[data-dir='next']");
    if (prev) prev.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" });
    });

    /* Pointer drag to scroll */
    var isDown = false, startX = 0, startScroll = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      isDown = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    });
    window.addEventListener("pointerup", function () {
      isDown = false;
      track.classList.remove("dragging");
    });
  });

  /* ---------- Hero phone: subtle mouse tilt ---------- */
  var phone = document.querySelector(".phone");
  var hero = document.querySelector(".hero");
  if (phone && hero && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.animation = "none";
      phone.style.transform =
        "rotateY(" + (-6 + x * 10) + "deg) rotateX(" + (2 - y * 8) + "deg)";
    });
    hero.addEventListener("mouseleave", function () {
      phone.style.transform = "";
      phone.style.animation = "";
    });
  }

  /* ---------- Fireflies canvas (hero) ---------- */
  var canvas = document.getElementById("fireflies");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var flies = [];
    var W, H;

    var resize = function () {
      W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);
    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(canvas);
    }

    var COUNT = Math.min(28, Math.floor(window.innerWidth / 42));
    for (var i = 0; i < COUNT; i++) {
      flies.push({
        x: Math.random(),
        y: Math.random(),
        r: 1 + Math.random() * 2.2,
        sp: 0.00006 + Math.random() * 0.00016,
        ang: Math.random() * Math.PI * 2,
        tw: Math.random() * Math.PI * 2,
        twSp: 0.008 + Math.random() * 0.02
      });
    }

    var lastT = 0;
    var draw = function (t) {
      if (document.hidden) { requestAnimationFrame(draw); return; }
      var dt = Math.min(t - lastT, 50);
      lastT = t;
      ctx.clearRect(0, 0, W, H);
      flies.forEach(function (f) {
        f.ang += (Math.random() - 0.5) * 0.06;
        f.x += Math.cos(f.ang) * f.sp * dt;
        f.y += Math.sin(f.ang) * f.sp * dt * 0.7;
        if (f.x < -0.05) f.x = 1.05;
        if (f.x > 1.05) f.x = -0.05;
        if (f.y < -0.05) f.y = 1.05;
        if (f.y > 1.05) f.y = -0.05;
        f.tw += f.twSp * dt * 0.06;
        var a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(f.tw));
        var px = f.x * W, py = f.y * H;
        var rr = f.r * window.devicePixelRatio;
        var g = ctx.createRadialGradient(px, py, 0, px, py, rr * 5);
        g.addColorStop(0, "rgba(246, 227, 180," + a + ")");
        g.addColorStop(0.4, "rgba(217, 169, 74," + a * 0.4 + ")");
        g.addColorStop(1, "rgba(217, 169, 74, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, rr * 5, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- Language dropdown: close on outside click / Escape ---------- */
  var langMenu = document.querySelector(".lang-menu");
  if (langMenu) {
    document.addEventListener("click", function (e) {
      if (langMenu.hasAttribute("open") && !langMenu.contains(e.target)) {
        langMenu.removeAttribute("open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") langMenu.removeAttribute("open");
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
