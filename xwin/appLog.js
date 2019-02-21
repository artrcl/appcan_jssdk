"use strict";

var appLog = (function () {

    var logs = [];
    var appcanIsReady = false;

    /**
     * @param   {*...}  s
     */
    function log(s) {
        if (!appcanIsReady || window.uexLog) send("log", Array.prototype.slice.apply(arguments));
    }

    /**
     * @param   {*...}  s
     */
    function warn(s) {
        if (!appcanIsReady || window.uexLog) send("warn", Array.prototype.slice.apply(arguments));
    }

    /**
     * @param   {*...}  s
     */
    function error(s) {
        if (!appcanIsReady || window.uexLog) send("error", Array.prototype.slice.apply(arguments));
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
            if (sa.length === 0) {
                ret = ""
            } else if (sa.length === 1) {
                ret = "\n" + JSON.stringify(sa[0]);
            } else {
                for (var i = 0; i < sa.length; i++) {
                    ret += "\n" + (i + 1) + ") " + JSON.stringify(sa[i]);
                }
            }
        }

        sendlog("[ " + err[1] + " line : " + err[2] + "," + err[3] + " " + t + " ] " + ret + "\n");
    }

    function sendlog(s) {
        if (appcanIsReady) {
            if (window.uexLog) uexLog.sendLog(s);
        } else {
            logs.push(s);
        }
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
        prepare: prepare
    }
})();

appcan.ready(function () {
    appLog.prepare();
});
