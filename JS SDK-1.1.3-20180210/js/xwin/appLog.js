"use strict";

var appLog = {
    /**
     * log
     * @param s     String...
     */
    log: function (s) {
        if (!this._enabled || (this._isReady && !window.uexLog)) return;
        this._send("log", Array.prototype.slice.apply(arguments));
    },

    /**
     * warn
     * @param s     String...
     */
    warn: function (s) {
        if (!this._enabled || (this._isReady && !window.uexLog)) return;
        this._send("warn", Array.prototype.slice.apply(arguments));
    },

    /**
     * error
     * @param s     String...
     */
    error: function (s) {
        if (!this._enabled || (this._isReady && !window.uexLog)) return;
        this._send("error", Array.prototype.slice.apply(arguments));
    },

    _send: function (t, sa) {
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
            if (!this._isReady && window.uexLog) this._isReady = true;

            if (this._isReady) {
                try {
                    if (window.uexLog) uexLog.sendLog(s); // uexLog 可用才处理
                } catch (e) {
                    //
                }
            } else {
                if (this._logs.length === 0) {
                    appcan.ready(function () {
                        var thiz = appLog;
                        thiz._isReady = true;

                        try {
                            if (window.uexLog) { // uexLog 是否可用?
                                for (var i = 0; i < thiz._logs.length; i++) {
                                    uexLog.sendLog(thiz._logs[i]);
                                }
                            }
                        } catch (e) {
                            //
                        }

                        thiz._logs = [];
                    });
                }
                this._logs.push(s);
            }
        } catch (ex) {
            //return ex;
        }
    }, _logs: [], _isReady: false,

    get _enabled() {
        return window.appConfig.appLogEnabled;
    }
};