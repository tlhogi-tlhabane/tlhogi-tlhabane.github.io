
(function () {
  "use strict";
  var box = document.getElementById("quote");
  if (!box) return;
  var panel = box.querySelector(".qp-panel");
  var form = box.querySelector("form");
  var note = box.querySelector(".qp-status");
  var root = document.documentElement;
  var OPENERS = 'a[href="#contact"], a[data-book], .dock-btn';
  var cal = document.getElementById("qpCal");

  var calStarted = false;
  var startCal = function () {
    if (calStarted || !cal) return;
    calStarted = true;
    (function (C, A, L) {
      var p = function (a, ar) { a.q.push(ar); }; var d = C.document;
      C.Cal = C.Cal || function () {
        var c = C.Cal, ar = arguments;
        if (!c.loaded) { c.ns = {}; c.q = c.q || []; d.head.appendChild(d.createElement("script")).src = A; c.loaded = true; }
        if (ar[0] === L) {
          var api = function () { p(api, arguments); }; var ns = ar[1]; api.q = api.q || [];
          if (typeof ns === "string") { c.ns[ns] = c.ns[ns] || api; p(c.ns[ns], ar); p(c, ["initNamespace", ns]); }
          else p(c, ar);
          return;
        }
        p(c, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");
    var Cal = window.Cal;
    Cal("init", "audit", { origin: "https://app.cal.com" });
    var api = Cal.ns.audit;
    api("inline", { elementOrSelector: "#qpCal", calLink: cal.getAttribute("data-cal-link"),
      config: { layout: "month_view", useSlotsViewOnSmallScreen: "true" } });

    api("ui", { theme: "light", layout: "month_view", hideEventTypeDetails: true,
      showTimezoneWhenEventDetailsHidden: true,
      cssVarsPerTheme: { light: { "cal-brand": "#000000", "cal-brand-text": "#ffffff" } } });
    var failT = setTimeout(function () { cal.classList.add("is-failed"); }, 15000);
    api("on", { action: "linkReady", callback: function () {
      clearTimeout(failT); cal.classList.remove("is-failed"); cal.classList.add("is-ready");
    } });
    api("on", { action: "linkFailed", callback: function () { clearTimeout(failT); cal.classList.add("is-failed"); } });
  };
  if (cal) {
    var warm = function (e) { if (e.target.closest && e.target.closest("a[data-book]")) startCal(); };
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("focusin", warm);
  }
  var outside = "header, main, footer, .nav-sheet, .bnav, .dock";
  var last = null, open = false;

  var lenis = function () { return window.TLM && window.TLM.lenis; };

  var ready = function () { box.removeAttribute("hidden"); };
  if (window.requestIdleCallback) requestIdleCallback(ready, { timeout: 2500 }); else setTimeout(ready, 1200);

  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var timer = 0;

  var settle = function () {
    if (!open) return;
    root.classList.add("qp-lock");
    Array.prototype.forEach.call(document.querySelectorAll(outside), function (el) {
      el.setAttribute("inert", ""); el.setAttribute("data-qp-inert", "");
    });

    var first = box.getAttribute("data-mode") !== "book" && form.querySelector("input");
    if (fine && first) first.focus({ preventScroll: true }); else panel.focus({ preventScroll: true });
  };

  var show = function (from) {
    if (open) return;
    open = true; last = from || document.activeElement;
    var book = !!(cal && from && from.hasAttribute && from.hasAttribute("data-book"));
    box.setAttribute("data-mode", book ? "book" : "form");
    if (book) { startCal(); panel.scrollTop = 0; }

    var sheet = document.getElementById("navSheet"), tog = document.getElementById("navToggle");
    if (sheet && sheet.getAttribute("data-open") === "true" && tog) tog.click();
    ready();
    if (lenis()) lenis().stop();
    clearTimeout(timer);

    requestAnimationFrame(function () { requestAnimationFrame(function () {
      if (!open) return;
      box.classList.add("is-open");
      timer = setTimeout(settle, 720);
    }); });
  };

  var hide = function () {
    if (!open) return;
    open = false;
    clearTimeout(timer);
    box.classList.remove("is-open");
    root.classList.remove("qp-lock");
    if (lenis()) lenis().start();
    if (last && last.focus) last.focus({ preventScroll: true });
    timer = setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-qp-inert]"), function (el) {
        el.removeAttribute("inert"); el.removeAttribute("data-qp-inert");
      });
    }, 720);
  };

  window.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(OPENERS);
    if (!a || box.contains(a)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); e.stopImmediatePropagation();
    show(a);
  }, true);

  box.addEventListener("click", function (e) {
    if (e.target.closest("[data-qp-close]")) hide();
  });
  document.addEventListener("keydown", function (e) {
    if (open && e.key === "Escape") { e.preventDefault(); hide(); }
  });

  box.addEventListener("wheel", function (e) {
    var inPanel = panel.contains(e.target);
    if (!inPanel || panel.scrollHeight <= panel.clientHeight) e.preventDefault();
  }, { passive: false });
  box.querySelector(".qp-scrim").addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var v = function (n) { return (form.elements[n].value || "").trim(); };
    var lines = ["Hi Tlhogi, I'd like my free audit.", "",
      "Name: " + v("name"), "Email: " + v("email"), "Business: " + v("business")];
    if (v("message")) lines.push("", v("message"));
    window.open("https://wa.me/27760825924?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    note.hidden = false;
  });
})();
