"use strict";

/*
(function () {
    var arr = location.href.match(/.*\/app(f[0-9])\//);
    if (arr != null) {
        var fi = arr[1];
        document.documentElement.style.fontSize = (window.appConfig.fontSizeList[fi].value * 100) + "%";
        window.appConfig.fontSizeIsSet = true;
    }
})();
*/

(function () {
    var scale = null;

    try {
        if (window.localStorage) {
            scale = window.localStorage.getItem("persist.fontSize");
        }
    } catch (e) {
    }

    if (scale == null) return;
    window.appConfig.fontSizeIsSet = true;

    scale = eval(scale);
    if (scale !== 1.00) document.documentElement.style.fontSize = (scale * 100) + "%";
})();

appcan.ready(function () {
    if (!window.appConfig.fontSizeIsSet) {
        var scale = null;

        try {
            if (window.localStorage) {
                scale = window.localStorage.getItem("persist.fontSize");
                if (scale == null) window.localStorage.setItem("persist.fontSize", '1.00');
            }
        } catch (e) {
        }

        window.appConfig.fontSizeIsSet = true;
        if (scale == null) return;

        scale = eval(scale);
        if (scale !== 1.00) document.documentElement.style.fontSize = (scale * 100) + "%";
    }
});
