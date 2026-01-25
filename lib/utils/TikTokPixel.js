import { useEffect } from "react";

const loadTikTokPixel = () => {
  window.TiktokAnalyticsObject = "ttq";
  var ttq = (window["ttq"] = window["ttq"] || []);

  ttq.methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
    "holdConsent",
    "revokeConsent",
    "grantConsent",
  ];
  ttq.setAndDefer = function (t, e) {
    t[e] = function () {
      t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };

  for (var i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }

  ttq.load = function (e) {
    var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = r;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date();

    var n = document.createElement("script");
    n.type = "text/javascript";
    n.async = true;
    n.src = r + "?sdkid=" + e + "&lib=ttq";
    var firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(n, firstScript);
  };

  ttq.load("CM9FFB3C77UDQH67IE00");
  ttq.page();
};

const TikTokPixel = () => {
  useEffect(() => {
    loadTikTokPixel();
  }, []);

  return null; // This component does not render anything
};

export default TikTokPixel;
