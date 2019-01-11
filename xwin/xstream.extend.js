"use strict";
var xs = xstream.default;

xstream.default.fromEvent = function (obj, event) {
    var producer = {
        start: function (listener) {
			if (!obj) return;
            var objs;
            if (typeof obj === "string") {
                objs = document.querySelectorAll(obj);
            } else {
                var t = Object.prototype.toString.call(obj);
                if (t === "[object Array]" || t === "[object Object]" && obj.hasOwnProperty('length')) {
                    objs = obj;
                } else {
                    objs = [obj];
                }
            }

            try {
                for (var i = 0; i < objs.length; i++) {
                    objs[i].addEventListener(event, function (e) {
                        listener.next(e)
                    });
                }
            } catch (e) {
                listener.error(e);
            }
        },
        stop: function () {
        }
    };

    return xstream.default.create(producer)
};

xstream.default.bindCallback = function (func) {
    return function () {
        var args = arguments;

        var producer = {
            start: function (listener) {
                try {
                    args[args.length++] = function () {
                        listener.next(arguments);
                    };
                    func.apply(null, args);
                } catch (e) {
                    listener.error(e);
                }
            },
            stop: function () {
            }
        };

        return xstream.default.create(producer)
    };
};
