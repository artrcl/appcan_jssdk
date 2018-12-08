"use strict";

(function () {
    function apply() {
        var key = "persist.fontSize";
        var value = null;

        try {
            if (window.localStorage) {
                value = window.localStorage.getItem(key);
                if (value == null) {
                    value = "1";
                    window.localStorage.setItem(key, value);
                }
            }
        } catch (e) {
        }

        if (value == null) return false; // window.localStorage 不可用
        value = eval(value);
        if (value !== 1) document.documentElement.style.fontSize = (value * 100) + "%";
        return true;
    }

    if (!apply()) {
        appcan.ready(apply);
    }
})();
