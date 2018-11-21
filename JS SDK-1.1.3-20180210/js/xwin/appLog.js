"use strict";

var appLog = {
    /**
     * log
     * @param s     String...
     */
    log: function (s) {
        if (!this._enabled) return;
        this._output("log", Array.prototype.slice.apply(arguments));
    },

    /**
     * warn
     * @param s     String...
     */
    warn: function (s) {
        if (!this._enabled) return;
        this._output("warn", Array.prototype.slice.apply(arguments));
    },

    /**
     * error
     * @param s     String...
     */
    error: function (s) {
        if (!this._enabled) return;
        this._output("error", Array.prototype.slice.apply(arguments));
    },

    _output: function (t, sa) {
        if (!this._enabled) return;
        var err;
        try {
            eval("KuwGRowI8;")
        } catch (e) {
            var stack = e.stack.split("\n");
            var line = stack[4];
            err = line.match(/.*[ \/](.+):(\d+):(\d+)/);
        }

        var ret = "";
        if (sa) {
            for (var i = 0; i < sa.length; i++) {
                var s = sa[i];
                if (s !== undefined) {
                    if ($.type(s) === "string") ret += ", " + s;
                    else ret += ", " + JSON.stringify(s);
                }
            }

            if (ret !== "") ret = ret.substring(2);
        }

        appcan.logs("[ " + err[1] + " line : " + err[2] + "," + err[3] + " " + t + " ] " + ret);
    },

    get _enabled() {
        return window.appConfig.appLogEnabled;
    }
};