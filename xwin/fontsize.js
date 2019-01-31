"use strict";

(function () {
    function apply() {
        try {
            if (window.localStorage) {
                var key = "persist.fontSize";
                var value = window.localStorage.getItem(key);

                if (value == null) {
                    value = '100';
                    window.localStorage.setItem(key, value);
                } else if (window._root_sysinit === 100) { // 是 root 页面
                    var v = value;
                    try {
                        value = eval(value);
                    } catch (e) {
                        value = 100;
                    }
                    if (value <= 2) value = value * 100;
                    if (value > 200) value = 200;
                    else if (value < 15) value = 15;

                    if (v !== '' + value) window.localStorage.setItem(key, '' + value);
                }

                if (value !== '100') document.documentElement.style.fontSize = value + "%";
                return true;
            }
        } catch (e) {
        }

        return false;
    }

    if (!apply()) {
        appcan.ready(apply);
    }
})();
