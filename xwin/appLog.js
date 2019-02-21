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
        var k;

        if (sa.length > 0 && sa[0] === '\u0000') {
            k = 1;
            sa.splice(0, 1);
        } else {
            k = 0;
        }

        try {
            eval("KuwGRowI8;")
        } catch (e) {
            var stack = e.stack.split("\n");
            var line = stack[4 + k];
            err = line.match(/.*[ \/](.+):(\d+):(\d+)/);
        }

        var ret = "";
        var jsonstrigify = false;
        if (sa) {
            if (sa.length === 0) {
                ret = ""
            } else if (sa.length === 1) {
                ret = "\n" + JSON.stringify(sa[0]);
            } else {
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

                    if (!jsonstrigify && Object.prototype.toString.call(s) === '[object String]') {
                        ret += s;
                    } else {
                        if (window.appLogPrettyPrint) { // 美化输出
                            ret += JSON.stringify(s, null, 4).replace(/"(\w+)":/g, "$1:");
                        } else {
                            ret += JSON.stringify(s).replace(/"(\w+)":/g, "$1:");
                        }
                    }
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
