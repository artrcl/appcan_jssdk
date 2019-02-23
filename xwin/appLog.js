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
        var k;

        if (sa.length > 0 && sa[0] === '\u0000') {
            k = 1;
            sa.splice(0, 1);
        } else {
            k = 0;
        }

        var stack;

        try {
            if (window.Error) {
                stack = new Error().stack;
            } else {
                var dummy = 1;
                dummy.a.b = 0;
            }
        } catch (e) {
            stack = e.stack;
        }

        var lines = stack.split("\n");
        var err = lines[4 + k].match(/.*[ \/](.+):(\d+):(\d+)/);

        var ret = "";
        var jsonstrigify = false;
        if (sa) {
            var j = 1;
            for (var i = 0; i < sa.length; i++) {
                var s = sa[i];
                if (s === '\u0001') {
                    jsonstrigify = true;
                    continue;
                } else if (s === '\u0002') {
                    jsonstrigify = false;
                    continue;
                }

                if (j === 1 && i === sa.length - 1) { // 第1个也是最后1个
                    ret += "\n";
                } else {
                    ret += "\n" + (j++) + ") ";
                }

                if (jsonstrigify || typeof s !== "string") {
                    if (window.appLogPrettyPrint) { // 美化输出
                        s = JSON.stringify(s, null, (typeof window.appLogPrettyPrint === "number") ? window.appLogPrettyPrint : 4);
                    } else {
                        s = JSON.stringify(s);
                    }
                    if (typeof s === "string") {
                        s = s.replace(/"(\w+)":/g, "$1:");
                    } else {
                        s = "" + s;
                    }
                }

                ret += s.substring(0, 2000); // 限制长度，否则 uexLog.sendLog() 会出错
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
