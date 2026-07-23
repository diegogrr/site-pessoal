/* ============================================================
   core/router.js — Roteador baseado em hash (#/rota)
   Rotas registradas pelas views em app.js.
   Exemplos: #/  |  #/topico/03  |  #/glossario  |  #/sobre
   Namespace global: SD.router
   ============================================================ */

window.SD = window.SD || {};

SD.router = (function () {
  "use strict";

  var routes = [];      // { pattern: RegExp, handler: fn(params) }
  var notFoundHandler = null;

  /**
   * Registra uma rota.
   * @param {string} pattern — ex.: "/topico/:id"
   * @param {function} handler — recebe objeto de parâmetros nomeados
   */
  function register(pattern, handler) {
    var paramNames = [];
    var regexSource = pattern
      .replace(/:[^/]+/g, function (name) {
        paramNames.push(name.slice(1));
        return "([^/]+)";
      });
    routes.push({
      pattern: new RegExp("^" + regexSource + "$"),
      paramNames: paramNames,
      handler: handler
    });
  }

  function setNotFound(handler) {
    notFoundHandler = handler;
  }

  function currentPath() {
    var hash = window.location.hash || "#/";
    return hash.replace(/^#/, "") || "/";
  }

  function resolve() {
    var path = currentPath();
    for (var i = 0; i < routes.length; i++) {
      var match = path.match(routes[i].pattern);
      if (match) {
        var params = {};
        routes[i].paramNames.forEach(function (name, idx) {
          params[name] = decodeURIComponent(match[idx + 1]);
        });
        routes[i].handler(params);
        return;
      }
    }
    if (notFoundHandler) {
      notFoundHandler(path);
    }
  }

  function navigate(path) {
    window.location.hash = "#" + path;
  }

  function start() {
    window.addEventListener("hashchange", resolve);
    resolve(); // resolve a rota inicial
  }

  return {
    register: register,
    setNotFound: setNotFound,
    navigate: navigate,
    currentPath: currentPath,
    start: start
  };
})();
