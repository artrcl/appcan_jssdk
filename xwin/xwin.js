"use strict";

/**
 * @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: 构建appcan xwin 模块
 * @created: 2018.3.22
 * @update: 2019.1.3
 */

/*global uexWindow, uexFileMgr, uexWidgetOne, uexWidget*/

var xwin = appcan.xwin = {
    openerWndName: null, // opener窗口名字
    wndName: null, // 当前窗口名字

    wgtPath: null, // wgt:// 对应的地址, 包括最后的 /
    sdcardPath: null, // file:///sdcard/, 包括最后的 /
    tempDir: appcan.file.wgtPath + "temp/dummyTempdir/",

    /**@preserve
     * 返回一个序列值
     * @return  {Integer}
     */
    getUID: function () {
        var maxId = 65536;
        var uid = 0;
        return function () {
            uid = (uid + 1) % maxId;
            return uid;
        };
    }(),

    /**@preserve
     * 返回一个全局的序列值
     * @return  {Integer}
     */
    getGlobalUID: function () {
        var i = istore.get("xwin.global.uid", 1);
        istore.set("xwin.global.uid", i + 1);

        return i;
    },

    /**@preserve
     * 打开一个新窗口
     * @param   {String=}   wnd     - 窗口名字, 使用时只有一个参数、为'_auto_'、空字符串或非字符串 ==> 自动取名
     * @param   {String}    url     - 要加载的地址
     * @param   {object}    param   - 传入参数，以备新开的窗口使用
     * @param   {Integer}   aniId   - 动画效果
     * @param   {Integer}   type    - 窗口的类型
     * @param   {Integer}   animDuration    - 动画时长
     * @param   {function}  callback        - 提供新窗口回调数据的函数
     */
    open: function (wnd, url, param, aniId, type, animDuration, callback) {
        if (arguments.length === 1 && $.type(wnd) === "object") {
            var argObj = wnd;
            wnd = argObj.wnd;
            url = argObj.url;
            param = argObj.param;
            aniId = argObj.aniId;
            type = argObj.type;
            animDuration = argObj.animDuration;
            callback = argObj.callback;
        } else if (arguments.length === 1) {
            url = wnd;
            wnd = "_auto_";
        } else {
            var delta = 0;
            if ($.type(url) !== "string") {
                callback = animDuration;
                animDuration = type;
                type = aniId;
                aniId = param;
                param = url;
                url = wnd;
                wnd = "_auto_";
                delta = 1;
            }

            var len = arguments.length;
            if ($.type(arguments[len - 1]) === "function") {
                callback = arguments[len - 1];
                if (len + delta === 3) param = undefined;
                else if (len + delta === 4) aniId = undefined;
                else if (len + delta === 5) type = undefined;
                else if (len + delta === 6) animDuration = undefined;
            }
        }

        if (wnd === "" || wnd === "_auto_" || $.type(wnd) !== "string") {
            var i = istore.get("xwin.nextVal", 1);
            istore.set("xwin.nextVal", i + 1);
            wnd = "aw" + i;
        }

        istore.set("xwin.opener.wndName", this.wndName);
        istore.set("xwin.current.wndName", wnd);

        var wndList = istore.get("xwin.wndList", []);

        var j = $.inArray(wnd, wndList);
        if (j < 0) {
            wndList.push(wnd);
            istore.set("xwin.wndList", wndList);
        }

        if (param !== undefined) this.param = param;
        if ($.type(callback) === "function") {
            appcan.xwin.nextWndCallbackFunc = callback;
            istore.set("temp." + wnd + ".callBack", "qwe");
        }

        var k = url.indexOf('?');
        if (k >= 0) {
            var query = url.substring(k + 1);
            url = url.substring(0, k);

            istore.set("temp." + wnd + ".query", query);
        }

        appcan.openWinWithUrl(wnd, url, aniId, (type) ? type : 4, animDuration);
    },

    /**@preserve
     * 回调到 Opener 窗口
     */
    callBackToOpener: function () {
        var req = istore.get("temp." + this.wndName + ".callBack");
        if (req === "qwe") {
            var args = ["appcan.xwin.nextWndCallbackFunc()"];
            Array.prototype.push.apply(args, Array.prototype.slice.call(arguments));
            this.evaluate.apply(this, args);
            return true;
        }
        return false;
    },

    /**@preserve
     * 关闭窗口
     * @param   {String}    wnd - 窗口名字
     * 说明:
     * '_current_'  或无wnd参数，就关闭当前窗口，
     * '_opener_'   关闭 opener 窗口
     * '_all_'      关闭所有窗口
     * 其它，       关闭指定名字的窗口
     */
    close: function (wnd) {
        var wndList;

        if (arguments.length === 0 || wnd === "_current_") {
            wnd = this.wndName;
            this.deleteTempFiles();

            // remove the temp settings
            istore.remove("temp." + wnd + ".callBack");

            if (wnd === "root") {
                appcan.window.evaluateScript(wnd, 'location.reload()');
            } else {
                appcan.window.close(-1);
                if (wnd) {
                    wndList = istore.get("xwin.wndList", []);
                    var i = $.inArray(wnd, wndList);
                    if (i >= 0) {
                        wndList.splice(i, 1);
                        istore.set("xwin.wndList", wndList);
                    }
                }
                if (appcan.isFunction(this._internals.onCloseFunc)) {
                    try {
                        this._internals.onCloseFunc();
                    } catch (e) {
                    }
                }
            }
        } else if (wnd === "_opener_") {
            wnd = this.openerWndName;
            appcan.window.evaluateScript(wnd, 'appcan.xwin.close()');
        } else if (wnd === "_all_") {
            wndList = istore.get("xwin.wndList", []);

            for (; wndList.length > 0;) {
                wnd = wndList.pop();
                appcan.window.evaluateScript(wnd, 'appcan.xwin.close()');
            }
        } else {
            appcan.window.evaluateScript(wnd, 'appcan.xwin.close()');
        }
    },

    /**@preserve
     * 关闭 opener 窗口
     */
    closeOpener: function () {
        this.close("_opener_");
    },

    /**@preserve
     * 关闭所有窗口
     */
    closeAll: function () {
        this.close("_all_");
    },

    /**@preserve
     * 设置关闭窗口回调事件
     * @param   {function}  func
     */
    bindClose: function (func) {
        this._internals.onCloseFunc = func;
    },

    /**@preserve
     * param 窗口间传递参数，保存的数据在新窗口才可用
     * @param   {Object}    value
     */
    set param(value) {
        istore.set("xwin.param", JSON.stringify(value));
    },
    /**@preserve
     * param 窗口间传递参数
     * @return  {Object}
     */
    get param() {
        if (this._internals.param === null) this._internals.param = this.originalParam();
        return this._internals.param;
    },
    /**@preserve
     * 返回不可修改的 param
     * @returns  {Object}
     */
    originalParam: function () {
        if (this._internals.paramstr === null) return {};
        else return JSON.parse(this._internals.paramstr);
    },

    /**@preserve
     * 返回打开窗口时 url 附带的 query string，不包括问号
     * @returns  {String}
     */
    get query() {
        return this._internals.query;
    },
    /**@preserve
     * 获取 query string 的键值
     * @param   {String}    name
     * @param   {String=}   defaultValue
     * @returns {String}
     */
    queryValue: function (name, defaultValue) {
        var s = this._internals.query;
        var arr = s.match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)"));
        if (arr != null) return decodeURIComponent(arr[2]);
        if (defaultValue === undefined) return null;
        return defaultValue;
    },

    /**@preserve
     * 执行窗口初始化操作
     */
    prepare: function () {
        var wgtPath = istore.get("xwin.wgtPath");
        var sdcardPath = istore.get("xwin.sdcardPath");
        if (!wgtPath) {
            var s = uexFileMgr.getFileRealPath(appcan.file.wgtPath);
            if (s.length > 0 && s.charAt(s.length - 1) !== "/" && s.charAt(s.length - 1) !== "\\") s += "/";
            istore.set("xwin.wgtPath", s);
            this.wgtPath = s;

            s = uexFileMgr.getFileRealPath("file:///sdcard/");
            if (s.length > 0 && s.charAt(s.length - 1) !== "/" && s.charAt(s.length - 1) !== "\\") s += "/";
            istore.set("xwin.sdcardPath", s);
            this.sdcardPath = s;
        } else {
            this.wgtPath = wgtPath;
            this.sdcardPath = sdcardPath;
        }

        this.openerWndName = istore.get("xwin.opener.wndName");
        this.wndName = istore.get("xwin.current.wndName");

        if (this.openerWndName === null && this.wndName === null) {
            this.openerWndName = "";
            this.wndName = "root";
        }

        this._internals.paramstr = istore.get("xwin.param");
        istore.remove("xwin.param"); // 取出即删除

        var key = "temp." + this.wndName + ".query";
        this._internals.query = istore.get(key, '');
        istore.remove(key);

        var part1;
        try {
            part1 = new Date().getTime().toString(36);
        } catch (e) {
            part1 = '' + (new Date().getTime());
        }

        this.tempDir = appcan.file.wgtPath + "temp/" + part1 + "_" + this.wndName + "/";

        this.deleteTempFiles();

        uexWindow.setReportKey(0, 1);
        uexWindow.onKeyPressed = function (keyCode) {
            if (keyCode === 0 /*back key*/) {
                var thiz = appcan.xwin;
                if (thiz.wndName === "root") {
                    thiz.clearLocStorageAndTempFiles();
                    uexWidgetOne.exit(0);
                } else if (thiz.wndName === "index") {
                    if (window.logoutClickCount && window.logoutClickCount > 0) {
                        appcan.xio.logout();
                    } else {
                        uexWindow.toast(0, 8, '再按一次退出应用', 2000);
                        window.logoutClickCount = 1;
                        setTimeout(function () {
                            window.logoutClickCount = undefined;
                        }, 2000);
                    }
                } else {
                    appcan.xwin.close();
                }
            }
        };

        // backkey / left_btn
        $(".backkey, .left_btn").click(function () {
            appcan.xwin.close();
        });

    },

    /**@preserve
     * 跨窗口执行脚本
     * @param   {String=}   wnd     - 窗口名字，调用时只有一个参数、为'_opener_'、空字符串或非字符串，窗口即为opener窗口，否则使用指定窗口名
     * @param   {String}    script  - 脚本
     * 说明: 还可以附加额外参数
     * 例子:
     * evaluate("hello(1)", 2); 在opener窗口执行 hello(1,2)
     * evaluate("hello()", 1, 2); 在opener窗口执行 hello(1,2)
     * evaluate(null, "hello()", 1, 2); null表示opener窗口，在opener窗口执行 hello(1,2)
     * evaluate("win", "hello()", {name: "jack", age: 28}, 20); 在名为win的窗口执行 hello({name: "jack", age: 28}, 20)
     */
    evaluate: function (wnd, script) {
        if (script === undefined) {
            script = wnd;
            wnd = this.openerWndName;
        } else {
            var len;
            if (wnd && wnd.indexOf("(") >= 0) {
                // 第一个参数包括括号，认为wnd参数忽略了，第一个参数就是script
                script = wnd;
                wnd = this.openerWndName;
                len = 1;
            } else {
                if (wnd === "" || wnd === "_opener_" || $.type(wnd) !== "string") wnd = this.openerWndName;
                len = 2;
            }

            if (arguments.length > len) { // 还有其它参数，认为是脚本函数的参数
                var param = "";
                var i = script.indexOf("(");
                if (i >= 0) {
                    var j = script.lastIndexOf(")");
                    param = script.substring(i + 1, j).trim();
                    script = script.substring(0, j);
                } else {
                    script += "(";
                }

                for (i = len; i < arguments.length; i++) {
                    if (i > len || param) script += ", ";
                    script += JSON.stringify(arguments[i]); // 不用传 function regexp, date 的话，请使用 date.getTime() 代替
                }
                script += ")";
            } else {
                var k = script.indexOf("(");
                if (k < 0) script = script + "()";
            }
        }

        appcan.window.evaluateScript(wnd, script);
    },

    /**@preserve
     * 删除当前窗口的临时文件
     */
    deleteTempFiles: function () {
        uexFileMgr.deleteFileByPath(this.tempDir);
    },

    /**@preserve
     * 获取wgt url的真实路径
     * @param   {String}    wgtUrl  - wgt://格式的 url
     * @return  {String}
     */
    realPath: function (wgtUrl) {
        if (wgtUrl.substr(0, appcan.file.wgtPath.length) === appcan.file.wgtPath) {
            return this.wgtPath + wgtUrl.substring(appcan.file.wgtPath.length);
        } else {
            return wgtUrl;
        }
    },

    /**@preserve
     * 得到对 SDCARD 的相对路径
     * @param   {String}    wgtUrl  - wgt://格式的 url
     * @return  {String}
     */
    fileProviderPath: function (wgtUrl) {
        var s = this.realPath(wgtUrl);
        if (s.substr(0, appcan.xwin.sdcardPath.length) === appcan.xwin.sdcardPath) s = s.substring(appcan.xwin.sdcardPath.length);
        return s;
    },

    /**@preserve
     * 初始化 locStorage, 用于 root 窗口，最开始就调用，应该优先于 config.js 的 appcan.ready():
     */
    initLocStorage: function () {
        this.openerWndName = "";
        this.wndName = "root";

        istore.set("xwin.opener.wndName", this.openerWndName);
        istore.set("xwin.current.wndName", this.wndName);
        istore.set("xwin.nextVal", "1");
        istore.set("xwin.wndList", ["root"]);

        var s = uexFileMgr.getFileRealPath(appcan.file.wgtPath);
        if (s.length > 0 && s.charAt(s.length - 1) !== "/" && s.charAt(s.length - 1) !== "\\") s += "/";
        istore.set("xwin.wgtPath", s);

        s = uexFileMgr.getFileRealPath("file:///sdcard/");
        if (s.length > 0 && s.charAt(s.length - 1) !== "/" && s.charAt(s.length - 1) !== "\\") s += "/";
        istore.set("xwin.sdcardPath", s);
    },

    /**@preserve
     * 清除 locStorage 和临时文件，在 root 页面 和 logout 时调用
     */
    clearLocStorageAndTempFiles: function () {
        uexFileMgr.deleteFileByPath(appcan.file.wgtPath + "temp/");

        var keys = istore.keys();
        if (keys) for (var i = 0; i < keys.length; i++) {
            // 保留 persist.*
            if (!/^persist\..*$/.test(keys[i]))
                istore.remove(keys[i]);
        }
    },

    /**@preserve
     * 获取appVerion
     * @return  {String}
     */
    appVersion: function () {
        var widgetInfo = uexWidgetOne.getCurrentWidgetInfo();
        return widgetInfo.version;
    },

    /**@preserve
     * 获取device OS
     * @return  {String}
     */
    deviceOs: function () {
        var platform = uexWidgetOne.getPlatform();
        if (platform === 0) return "ios";
        else if (platform === 1) return "android";
        else return "ide"; // 2
    },

    /**@preserve
     * 判断是否是 android 系统
     * @return  {Boolean}
     */
    isAndroid: function () {
        if (this._internals.isAndroid === null) {
            this._internals.isAndroid = uexWidgetOne.getPlatform() === 1;
        }
        return this._internals.isAndroid;
    },

    /**@preserve
     * 判断系统是否安装了指定的应用
     * @param   {String}    name    - 应用名
     * @return  {boolean}
     */
    isAppInstalled: function (name) {
        return uexWidget.isAppInstalled(JSON.stringify({appData: name}));
    },

    /**@preserve
     * 返回 url 匹配的文件名 用于下载保存文件时文件名的确定
     * @param   {String}    url
     * @param   {String=}   fileExt   - 可指定扩展名
     * @return  {string}
     * @desc url 如果只包含扩展名，每次获取都得到新文件名
     */
    mapFileName: function (url, fileExt) {
        if (!url) return null;
        var result = this._internals.mapFileName[url];
        if (result !== undefined) {
            return result;
        }

        var i, ext;
        if ($.type(fileExt) === "string") {
            i = 100;
            ext = fileExt;
        } else {
            i = url.lastIndexOf(".");
            ext = (i >= 0) ? url.substring(i) : "";
        }
        if (ext.isImageFile()) result = "iamge" + this._internals.fileGen + ext;
        else result = "doc" + this._internals.fileGen + ext;
        this._internals.fileGen++;

        if (i !== 0) this._internals.mapFileName[url] = result;
        return result;
    },

    _internals: {
        onCloseFunc: null,
        param: null,
        paramstr: null,
        query: null,
        isAndroid: null,
        mapFileName: {},
        fileGen: 1,
    }

};

appcan.ready(function () {
    appcan.xwin.prepare();
});
