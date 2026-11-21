/* Injecte footer.html dans <footer id="site-footer"> sur chaque page. */
(function () {
  var el = document.getElementById("site-footer");
  if (!el) return;
  fetch("footer.html")
    .then(function (r) { return r.ok ? r.text() : ""; })
    .then(function (html) { el.innerHTML = html; })
    .catch(function () {});
})();
