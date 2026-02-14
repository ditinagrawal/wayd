(function () {
  "use strict";

  var script = document.currentScript;
  var siteId = script && script.getAttribute("data-site-id");
  if (!siteId) return;

  var apiUrl = script.src.replace("/tracker.js", "/api/collect");

  // Generate a simple visitor ID (fingerprint-like, persisted in localStorage)
  function getVisitorId() {
    var key = "_wayd_vid";
    var id = null;
    try {
      id = localStorage.getItem(key);
    } catch (e) {}
    if (!id) {
      id = generateId();
      try {
        localStorage.setItem(key, id);
      } catch (e) {}
    }
    return id;
  }

  // Generate a session ID (persisted in sessionStorage)
  function getSessionId() {
    var key = "_wayd_sid";
    var id = null;
    try {
      id = sessionStorage.getItem(key);
    } catch (e) {}
    if (!id) {
      id = generateId();
      try {
        sessionStorage.setItem(key, id);
      } catch (e) {}
    }
    return id;
  }

  function generateId() {
    return (
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10)
    );
  }

  // Parse UTM parameters from URL
  function getUtmParams() {
    var params = {};
    try {
      var search = new URLSearchParams(window.location.search);
      var source = search.get("utm_source");
      var medium = search.get("utm_medium");
      var campaign = search.get("utm_campaign");
      if (source) params.source = source;
      if (medium) params.medium = medium;
      if (campaign) params.campaign = campaign;
    } catch (e) {}
    return params;
  }

  // Get referrer domain
  function getReferrerSource() {
    try {
      if (!document.referrer) return null;
      var url = new URL(document.referrer);
      // Don't count same-domain as referrer source
      if (url.hostname === window.location.hostname) return null;
      return url.hostname.replace("www.", "");
    } catch (e) {
      return null;
    }
  }

  var pageEntryTime = Date.now();
  var visitorId = getVisitorId();
  var sessionId = getSessionId();

  function sendPageView() {
    var utmParams = getUtmParams();
    var referrerSource = getReferrerSource();

    var data = {
      siteId: siteId,
      pathname: window.location.pathname,
      referrer: document.referrer || null,
      visitorId: visitorId,
      sessionId: sessionId,
      screenWidth: window.screen.width,
      language: navigator.language,
      source: utmParams.source || referrerSource || null,
      medium: utmParams.medium || null,
      campaign: utmParams.campaign || null,
    };

    // Use sendBeacon if available for reliability, else fetch
    var payload = JSON.stringify(data);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl, payload);
    } else {
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(function () {});
    }
  }

  // Send duration update on page unload
  function sendDuration() {
    var duration = Math.round((Date.now() - pageEntryTime) / 1000);
    if (duration < 1) return;

    var data = {
      siteId: siteId,
      type: "duration",
      visitorId: visitorId,
      sessionId: sessionId,
      pathname: window.location.pathname,
      duration: duration,
    };

    var payload = JSON.stringify(data);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl, payload);
    } else {
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(function () {});
    }
  }

  // Track page view on load
  sendPageView();

  // Track duration on unload
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      sendDuration();
    }
  });

  // Handle SPA navigation (pushState / popState)
  var originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(history, arguments);
    sendDuration();
    pageEntryTime = Date.now();
    sendPageView();
  };

  window.addEventListener("popstate", function () {
    sendDuration();
    pageEntryTime = Date.now();
    sendPageView();
  });
})();
