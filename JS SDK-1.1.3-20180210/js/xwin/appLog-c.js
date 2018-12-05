"use strict";

var appLog = (function () {

    var logs = [];
    var appcanIsReady = false;
    var enablefunc = true;

    /**
     * log
     * @param s  {*...}
     */
    function log(s) {
        if (isEnabled()) send("log", Array.prototype.slice.apply(arguments));
    }

    /**
     * warn
     * @param s  {*...}
     */
    function warn(s) {
        if (isEnabled()) send("warn", Array.prototype.slice.apply(arguments));
    }

    /**
     * error
     * @param s  {*...}
     */
    function error(s) {
        if (isEnabled()) send("error", Array.prototype.slice.apply(arguments));
    }

    function send(t, sa) {
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
                    if (Object.prototype.toString.call(s) === '[object String]') ret += ", " + s;
                    else ret += ", " + JSON.stringify(s);
                }
            }

            if (ret !== "") ret = ret.substring(2);
        }

        sendlog("[ " + err[1] + " line : " + err[2] + "," + err[3] + " " + t + " ] " + ret);
    }

    function sendlog(s) {
        if (appcanIsReady) {
            if (window.uexLog) uexLog.sendLog(s);
        } else {
            logs.push(s);
        }
    }

    function isEnabled() {
        if ((enablefunc === false) || (appcanIsReady && !window.uexLog)) return false;
        if (enablefunc === true) return true;

        if (Object.prototype.toString.call(enablefunc) === '[object Function]') {
            try {
                return !!enablefunc();
            } catch (e) {
                return false;
            }
        } else {
            return !!enablefunc;
        }
    }

    /**
     * enable
     * @param b   {boolean | function : boolean}, default true
     */
    function enable(b) {
        enablefunc = b;
    }

    /**
     * prepare
     */
    function prepare() {
        appcanIsReady = true;

        if (window.uexLog) {
            for (var i = 0; i < logs.length; i++) {
                uexLog.sendLog(logs[i]);
            }
        }

        logs = [];
    }

    return {
        log: log,
        warn: warn,
        error: error,
        enable: enable,
        prepare: prepare
    }
})();

appcan.ready(function () {
    appLog.prepare();
});
