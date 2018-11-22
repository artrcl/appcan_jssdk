"use strict";

var appLog = {
    /**
     * log
     * @param s     String...
     */
    log: function (s) {
        if (!this._enabled) return;
        this._send("log", Array.prototype.slice.apply(arguments));
    },

    /**
     * warn
     * @param s     String...
     */
    warn: function (s) {
        if (!this._enabled) return;
        this._send("warn", Array.prototype.slice.apply(arguments));
    },

    /**
     * error
     * @param s     String...
     */
    error: function (s) {
        if (!this._enabled) return;
        this._send("error", Array.prototype.slice.apply(arguments));
    },

    _send: function (t, sa) {
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

        this._sendlog("[ " + err[1] + " line : " + err[2] + "," + err[3] + " " + t + " ] " + ret);
    },

    _sendlog: function (s) {
        try {
            if (window.uexLog) {
                uexLog.sendLog(s);
            } else {
                if (this._logs.length === 0) {
                    appcan.ready(function () {
                        var thiz = appLog;
                        for (var i = 0; i < thiz._logs.length; i++) {
                            uexLog.sendLog(thiz._logs[i]);
                        }
                        thiz._logs = [];
                    });
                }
                this._logs.push(s);
            }
        } catch (e) {
            //return e;
        }
    }, _logs: [],

    get _enabled() {
        return window.appConfig.appLogEnabled;
    }
};