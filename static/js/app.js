// Auto-dismiss success alerts.
(function () {
  document.querySelectorAll(".alert.alert-success").forEach(function (el) {
    setTimeout(function () {
      if (window.bootstrap) { bootstrap.Alert.getOrCreateInstance(el).close(); }
    }, 4000);
  });
})();

// Light / dark theme toggle (remembered in the browser).
(function () {
  var root = document.documentElement;
  var btn = document.querySelector("[data-theme-toggle]");
  if (!btn) { return; }
  var label = function () {
    btn.textContent = root.getAttribute("data-bs-theme") === "dark" ? "Light mode" : "Dark mode";
  };
  label();
  btn.addEventListener("click", function () {
    var next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-bs-theme", next);
    try { localStorage.setItem("hr-theme", next); } catch (e) {}
    label();
  });
})();

// Monthly / Yearly filter: show only the month box or the year box for the chosen mode.
document.querySelectorAll("[data-period-form]").forEach(function (form) {
  var sync = function () {
    var checked = form.querySelector('input[name="period"]:checked');
    var mode = checked ? checked.value : "month";
    form.querySelectorAll("[data-show]").forEach(function (el) {
      el.hidden = el.getAttribute("data-show") !== mode;
    });
  };
  form.querySelectorAll('input[name="period"]').forEach(function (r) { r.addEventListener("change", sync); });
  sync();
});

// Date pickers: always show 12-Oct-2026 (d-M-Y); the form still submits Y-m-d.
(function () {
  if (!window.flatpickr) { return; }
  document.querySelectorAll("input[data-date]").forEach(function (el) {
    flatpickr(el, { altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d", allowInput: false, disableMobile: true });
  });
})();

// Live clock in the same d-M-Y format.
(function () {
  var clock = document.querySelector("[data-live-clock]");
  if (!clock) { return; }
  var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var p = function (n) { return String(n).padStart(2, "0"); };
  var tick = function () {
    var d = new Date();
    var h = d.getHours() % 12 || 12;
    clock.textContent = "Now: " + p(d.getDate()) + "-" + M[d.getMonth()] + "-" + d.getFullYear() + " " +
      p(h) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds()) + (d.getHours() >= 12 ? " PM" : " AM");
  };
  tick();
  setInterval(tick, 1000);
})();
