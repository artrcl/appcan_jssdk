"use strict";

var fontSizeCtrl = (function () {
    var value = [
        15, 17, 19, 20.5, 22, 23.5, 25, 26.5, 28, 30, 32.5,
        35, 37.5, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
        105, 110, 115, 120, 125, 130, 135, 140, 145, 150,
        155, 160, 165, 170, 175, 180, 190, 200
    ];

    var key = 'persist.fontSize';

    var startX = 0;
    var screenWidth = 1;
    var sensibility = 100;
    var effective = false;

    var index = 0;
    var newIndex = -1;

    function touchstart(e) {
        startX = e.touches[0].clientX;
        screenWidth = $(window).width();
        sensibility = screenWidth / 10;
        effective = false;

        var s = istore.get(key, 100);
        index = value.indexOf(s);

        if (index < 0) {
            for (var i = 0; i < value.length; i++) {
                if (value[i] >= s) {
                    index = i;
                    break;
                }
            }

            if (index < 0) index = value.length - 1;
        }

        newIndex = -1;
    }

    function touchmove(e) {
        var delta = e.touches[0].clientX - startX;
        if (!effective) {
            if (delta >= sensibility || (-delta) >= sensibility) effective = true;
            else return;
        }

        var k = index + Math.round(delta / screenWidth * 10);
        if (k >= value.length) k = value.length - 1;
        else if (k <= 0) k = 0;

        if (newIndex !== k) {
            newIndex = k;
            var s = value[k] + '%';
            document.documentElement.style.fontSize = s;
            uexWindow.toast(0, 5, s, 600000);
        }
    }

    function touchend(e) {
        if (effective) {
            uexWindow.toast(0, 5, document.documentElement.style.fontSize, 1000);
            istore.set(key, value[newIndex]);
        }
    }

    return {
        touchstart: touchstart,
        touchmove: touchmove,
        touchend: touchend
    }
})();
