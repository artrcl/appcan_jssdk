"use strict";

/**
 * @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: 构建appcan xwin 模块
 * @created: 2018.3.22
 * @update: 2018.3.26
 */

/*global uexWindow, uexFileMgr, uexWidgetOne, uexXmlHttpMgr*/

var xwin = appcan.xwin = {
    serverConfig: {
        serverUrl: 'http://a.bc.cn/dz',  //  服务端地址 {String|Array}
        serverIndex: 0, // 默认的服务端地址 index
        downloadUrlTemplate: 'http://a.bc.cn/dz/download?url=$s', // 服务端文件下载地址模板 {String|Array}
        tokenType: 'JSESSIONID',  //  会话维持的方式: JSESSIONID, param 或 header    {String|Object}
        loginUrl: 'login',  //  login url   {String=}
        logoutUrl: 'logout',  //  logout url {String=}
        debugTokenId: ''  //  用于appcan编辑调试    {String=}
    },

    openerWndName: null, // opener窗口名字
    wndName: null, // 当前窗口名字

    // JSESSIONID 方式的话将在 url 附加 JSESSIONID=...,
    // param 方式, 如 "__sid", 将会在 url 的 querystr 附加 __sid=...
    // header 方式, 如 {Auth: "?"}, 就在 http header 里添加 header： "Auth：..."
    _tokenType: "JSESSIONID", // 设置默认值
    // tokenType : '__sid',
    // tokenType : {Auth: "?"},

    onClose: null, // {function} close 窗口事件
    wgtPath: null, // wgt:// 对应的地址
    sdcardPath: null, // file:///sdcard/
    tempDir: appcan.file.wgtPath + "temp/dummyTempdir/",

    /**@preserve
     * 返回一个序列值
     * @return  {int}
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
     * @return  {int}
     */
    getGlobalUID: function () {
        var i = istore.get("xwin.global.uid", 1);
        istore.set("xwin.global.uid", i + 1);

        return i;
    },

    /**@preserve
     * open 打开一个新窗口
     * @param wnd       {String=}  窗口名字, 使用时只有一个参数、为'_auto_'、空字符串或非字符串 ==> 自动取名
     * @param url       {String}  要加载的地址
     * @param param     {json}    传入参数，以备新开的窗口使用
     * @param aniId     {Integer} 动画效果
     * @param type      {Integer} 窗口的类型
     * @param animDuration {Integer} 动画时长
     */
    open: function (wnd, url, param, aniId, type, animDuration) {
        if (arguments.length === 1 && $.tppe(wnd) === "object") {
            var argObj = wnd;
            wnd = argObj.wnd;
            url = argObj.url;
            param = argObj.param;
            aniId = argObj.aniId;
            type = argObj.type;
            animDuration = argObj.animDuration;
        } else if (arguments.length === 1) {
            url = wnd;
            wnd = "_auto_";
        } else if ($.type(url) === "object") {
            animDuration = type;
            type = aniId;
            aniId = param;
            param = url;
            url = wnd;
            wnd = "_auto_";
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
        appcan.openWinWithUrl(wnd, url, aniId, (type) ? type : 4, animDuration);
    },

    /**@preserve
     * close 关闭窗口
     * @param wnd  {String}  窗口名字
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
            this._deleteTempFiles();
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
                if (appcan.isFunction(this.onClose)) {
                    try {
                        this.onClose();
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
     * closeOpener  关闭 opener 窗口
     */
    closeOpener: function () {
        this.close("_opener_");
    },

    /**@preserve
     * closeAll     关闭所有窗口
     */
    closeAll: function () {
        this.close("_all_");
    },

    /**@preserve
     * serverUrl    服务端地址
     * @return  {array}
     */
    get serverUrl() {
        if (!this._serverUrl) {
            var value = this.serverConfig.serverUrl;
            if ($.type(value) === "string") value = [value];
            this._serverUrl = value;
            if (this.serverIndex < 0 || this.serverIndex >= this._serverUrl.length) this.serverIndex = 0;
        }
        return this._serverUrl;
    }, _serverUrl: null,

    /**@preserve
     * downloadUrlTemplate  服务端文件下载地址模板
     * @return  {array}
     */
    get downloadUrlTemplate() {
        if (!this._downloadUrlTemplate) {
            var value = this.serverConfig.downloadUrlTemplate;
            if ($.type(value) === "string") value = [value];
            this._downloadUrlTemplate = value;
        }
        return this._downloadUrlTemplate;
    }, _downloadUrlTemplate: null,

    /**@preserve
     * serverIndex 当前选用的server索引
     * @param value {Integer}
     */
    set serverIndex(value) {
        istore.set("xwin.serverIndex", value);
    },
    /**@preserve
     * serverIndex 当前选用的server索引
     * @return  {Integer}
     */
    get serverIndex() {
        var value = istore.get("xwin.serverIndex");
        if (value == null) {
            value = this.serverConfig.serverIndex;
            value = value ? eval(value) : 0;
            if (value < 0 || value >= this._serverUrl.length) value = 0;
            return value;
        } else {
            return eval(value);
        }
    },

    /**@preserve
     * tokenType 会话维持的方式: JSESSIONID, param 或 header
     * @return  {String|Object}
     */
    get tokenType() {
        var tokenType = this.serverConfig.tokenType;
        if (tokenType) return tokenType;
        return this._tokenType;
    },

    /**@preserve
     * param 窗口间传递参数，保存的数据在新窗口才可用
     * @param value {json}
     */
    set param(value) {
        istore.set("xwin.param", value);
    },
    /**@preserve
     * param 窗口间传递参数
     * @return  {json}
     */
    get param() {
        return this._param;
    }, _param: {},

    /**@preserve
     * prepare 执行窗口初始化操作
     */
    prepare: function () {
        var wgtPath = istore.get("xwin.wgtPath");
        var sdcardPath = istore.get("xwin.sdcardPath");
        if (!wgtPath) {
            var s = uexFileMgr.getFileRealPath(appcan.file.wgtPath);
            if (s.length > 0 && s.charAt(s.length - 1) !== "/") s += "/";
            istore.set("xwin.wgtPath", s);
            this.wgtPath = s;

            s = uexFileMgr.getFileRealPath("file:///sdcard/");
            if (s.length > 0 && s.charAt(s.length - 1) !== "/") s += "/";
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

        this._param = istore.get("xwin.param", {});
        istore.remove("xwin.param"); // 取出即删除

        this.tempDir = appcan.file.wgtPath + "temp/" + this.wndName + "/";

        this._deleteTempFiles();

        uexWindow.setReportKey(0, 1);
        uexWindow.onKeyPressed = function (keyCode) {
            if (keyCode === 0 /*back key*/) {
                var thiz = appcan.xwin;
                if (thiz.wndName === "root") {
                    thiz.clearLocStorageAndTempFiles();
                    uexWidgetOne.exit(0);
                } else if (thiz.wndName === "index") {
                    if (window.logoutClickCount && window.logoutClickCount > 0) {
                        thiz.logout();
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
     * httpUrl 转换为一个绝对的地址，并根据需要附带 TOKENID
     * @param url   {String}
     * @return      {String}
     */
    httpUrl: function (url) {
        var serverUrl = this.serverUrl[this.serverIndex];
        if (serverUrl.charAt(serverUrl.length - 1) !== "/") serverUrl += "/";
        if (url.length > 0 && url.charAt(0) === "/") url = url.substring(1);

        if (url.indexOf("://") < 0) {
            url = serverUrl + url;
        } else {
            // return url; // 重复调用 httpUrl() !
        }

        if (typeof this.tokenType === "string") {
            var tokenId = this.tokenId || this.serverConfig.debugTokenId;
            if (tokenId) {
                var i = url.indexOf("?");

                if (this.tokenType === "JSESSIONID") {
                    if (i < 0) i = url.indexOf("#");
                    if (i < 0) i = url.length;
                    var j = url.indexOf(";");

                    if (j < 0 || j > i) {
                        url = url.substring(0, i) + ";" + hiz.tokenType + "=" + tokenId + url.substring(i);
                    } else {
                        url = url.substring(0, j) + ";" + hiz.tokenType + "=" + tokenId + url.substring(i);
                    }
                } else {
                    if (i >= 0) {
                        url = url.substring(0, i + 1) + this.tokenType + "=" + tokenId + "&" + url.substring(i + 1);
                    } else {
                        var k = url.indexOf("#");
                        if (k < 0) url = url + "?" + this.tokenType + "=" + tokenId;
                        else url = url.substring(0, k) + "?" + this.tokenType + "=" + tokenId + url.substring(k);
                    }
                }
            }
        }
        return url;
    },

    /**@preserve
     * downloadUrl 转换为一个绝对的文件下载地址，并根据需要附带 TOKENID
     * @param url   {String}
     * @return      {String}
     */
    downloadUrl: function (url) {
        var template = this.downloadUrlTemplate[this.serverIndex];
        var s;
        if (template.indexOf('?') >= 0) {
            s = template.replace(/\$s/g, $.param({a: url}).substring(2));
        } else {
            s = template.replace(/\$s/g, url);
        }
        return this.httpUrl(s);
    },

    /**@preserve
     * POST 提交请求
     * @param url       {String}
     * @param data      {json}  上传文件的话，指定参数值为 object, 如 {path:'/path/file.jpg'}
     * @param callback  {function(data)}
     * @param progressCallback  {function(progress)}
     */
    post: function (url, data, callback, progressCallback) {
        var msg_timeout = "操作超时,请重新登录"; // 会话超时了
        var msg_failed = "请求数据失败了";  // 服务端获取数据出现了问题，没有得到数据
        var msg_error = "请求过程中发生错误了"; // 一般是网络故障或服务端物理故障不能完成请求

        var options = {};
        options.type = "POST";
        options.url = this.httpUrl(url);
        options.data = data; //
        options.success = function (data, status, requestCode, response, xhr) {
            uexWindow.closeToast();
            var result = JSON.parse(data);
            if (result.code === Result.TIMEOUT) {
                uexWindow.toast(0, 8, msg_timeout, 4000);
                window.setTimeout(function () {
                    appcan.xwin.closeAll(); // 关闭所有窗口
                }, 1500);
                return;
            } else if (result.code === Result.FAILED) {
                var msg = result.msg;
                if (!msg || msg.toLowerCase().indexOf("failed") >= 0) msg = msg_failed;
                uexWindow.toast(0, 8, msg, 4000);
                return;
            }
            callback(result.data)
        };
        options.error = function (xhr, errorType, error, msg) {
            uexWindow.toast(0, 8, msg_error, 4000);
        };
        if ($.type(progressCallback) === "function") {
            options.progress = function (progress, xhr) {
                progressCallback(progress);
            }
        }

        if ($.type(this.tokenType) === "object") {
            var tokenId = this.tokenId || this.serverConfig.debugTokenId;
            if (tokenId) {
                options.headers = {};
                for (var key in this.tokenType) {
                    options.headers[key] = this.tokenType[key].replace(/\?/g, tokenId);
                }
            }
        }

        appcan.ajax(options);
    },

    /**@preserve
     * post2 提交请求, 与 post 完成一样的功能
     * @param url       {String}
     * @param data      {json}  上传文件的话，指定参数值为 object, 如 {path:'/path/file.jpg'}
     * @param callback  {function(data)}
     * @param progressCallback  {function(progress)}
     */
    post2: function (url, data, callback, progressCallback) {
        var msg_timeout = "操作超时,请重新登录"; // 会话超时了
        var msg_failed = "请求数据失败了";  // 服务端获取数据出现了问题，没有得到数据
        var msg_error = "请求过程中发生错误了"; // 一般是网络故障或服务端物理故障不能完成请求

        if ($.type(callback) === "function") {
            uexXmlHttpMgr.onData = function (reqId, status, result) {
                uexXmlHttpMgr.close(reqId);

                if (status === -1) { // -1=error 0=receive 1=finish
                    uexWindow.toast(0, 8, msg_error, 4000);
                    return;
                }

                uexWindow.closeToast();

                result = JSON.parse(result);
                if (result.code === Result.TIMEOUT) {
                    uexWindow.toast(0, 8, msg_timeout, 4000);
                    window.setTimeout(function () {
                        appcan.xwin.closeAll(); // 关闭所有窗口
                    }, 1500);
                    return;
                } else if (result.code === Result.FAILED) {
                    var msg = result.msg;
                    if (!msg || msg.toLowerCase().indexOf("failed") >= 0) msg = msg_failed;
                    uexWindow.toast(0, 8, msg, 4000);
                    return;
                }

                callback(result.data);
            };
        } else {
            uexXmlHttpMgr.onData = null;
        }

        if ($.type(progressCallback) === "function") {
            uexXmlHttpMgr.onPostProgress = function (reqId, progress) {
                progressCallback(progress);
            }
        } else {
            uexXmlHttpMgr.onPostProgress = null;
        }

        var reqId = this.getUID();
        uexXmlHttpMgr.open(reqId, 'POST', this.httpUrl(url), '');

        if ($.type(data) === "object") {
            for (var key in data) {
                headers[key] = this.tokenType[key].replace(/\?/g, tokenId);
                var value = data[key];
                if ($.type(value) === "object" && value.path) {
                    uexXmlHttpMgr.setPostData(reqId, 1, key, value.path); // binary
                } else {
                    uexXmlHttpMgr.setPostData(reqId, 0, key, value);
                }
            }
        } else {
            uexXmlHttpMgr.setBody(reqId, data);
        }

        if ($.type(this.tokenType) === "object") {
            var tokenId = this.tokenId || this.serverConfig.debugTokenId;
            if (tokenId) {
                var headers = {};
                for (var key in this.tokenType) {
                    headers[key] = this.tokenType[key].replace(/\?/g, tokenId);
                }
                uexXmlHttpMgr.setHeaders(reqId, JSON.stringify(headers))
            }
        }

        uexXmlHttpMgr.send(reqId);
    },

    /**@preserve
     * logout
     * @param url   {String=} optional logout url
     */
    logout: function (url) {
        appcan.request.ajax({
            url: this.httpUrl(url || this.serverConfig.logoutUrl || "logout"),
            type: 'POST',
            success: function (data, status, requestCode, response, xhr) {
                //alert('success');
            },
            error: function (xhr, errorType, error, msg) {
                //alert('error');
            },
            complete: function (xhr, status) {
                //alert('complete');
                appcan.xwin.clearLocStorageAndTempFiles();
                uexWidgetOne.exit(0);
            }
        });
    },

    /**@preserve
     * tokenId
     * @param value {String}
     */
    set tokenId(value) {
        istore.set("xwin.tokenId", value);
    },
    /**@preserve
     * tokenId
     * @return  {String}
     */
    get tokenId() {
        return istore.get("xwin.tokenId", "");
    },

    /**@preserve
     * loginName
     * @param value {String}
     */
    set loginName(value) {
        istore.set("persist.loginName", value);
    },
    /**@preserve
     * loginName
     * @return  {String}
     */
    get loginName() {
        return istore.get("persist.loginName", "");
    },

    /**@preserve
     * userName
     * @param value {String}
     */
    set userName(value) {
        istore.set("sys.userName", value);
    },
    /**@preserve
     * userName
     * @return  {String}
     */
    get userName() {
        return istore.get("sys.userName", "");
    },

    /**@preserve
     * userId
     * @param value {String}
     */
    set userId(value) {
        istore.set("sys.userId", value);
    },
    /**@preserve
     * userId
     * @return {String}
     */
    get userId() {
        return istore.get("sys.userId", "");
    },

    /**@preserve
     * execute 跨窗口执行脚本
     * @param wnd     {String=}    窗口名字，调用时只有一个参数、为'_opener_'、空字符串或非字符串，窗口即为opener窗口，否则使用指定窗口名
     * @param script  {String}     脚本
     * 说明: 还可以附加额外参数
     * 例子:
     * execute("hello(1)", 2); 在opener窗口执行 hello(1,2)
     * execute("hello()", 1, 2); 在opener窗口执行 hello(1,2)
     * execute(null, "hello()", 1, 2); null表示opener窗口，在opener窗口执行 hello(1,2)
     * execute("win", "hello()", {name: "jack", age: 28}, 20); 在名为win的窗口执行 hello({name: "jack", age: 28}, 20)
     */
    execute: function (wnd, script) {
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
     * deleteTempFiles 删除当前窗口的临时文件
     */
    _deleteTempFiles: function () {
        uexFileMgr.deleteFileByPath(this.tempDir);
    },

    /**@preserve
     * realPath 获取wgt url的真实路径
     * @param wgtUrl    {String} wgt://格式的 url
     * @return          {String}
     */
    realPath: function (wgtUrl) {
        if (wgtUrl.substr(0, appcan.file.wgtPath.length) === appcan.file.wgtPath) {
            return this.wgtPath + wgtUrl.substring(appcan.file.wgtPath.length);
        } else {
            return wgtUrl;
        }
    },

    /**@preserve
     * getFileProviderPath 得到对 SDCARD 的相对路径
     * @param wgtUrl    {String}    wgt://temp/doc1.doc
     * @return          {String}
     */
    fileProviderPath: function (wgtUrl) {
        var s = this.realPath(wgtUrl);
        if (s.substr(0, appcan.xwin.sdcardPath.length) === appcan.xwin.sdcardPath) s = s.substring(appcan.xwin.sdcardPath.length);
        return s;
    },

    /**@preserve
     * initLocStorage 初始化 locStorage, 用于 root 窗口，最开始就调用，应该优先于 config.js 的 appcan.ready():
     */
    initLocStorage: function () {
        this.openerWndName = "";
        this.wndName = "root";

        istore.set("xwin.opener.wndName", this.openerWndName);
        istore.set("xwin.current.wndName", this.wndName);
        istore.set("xwin.nextVal", "1");
        istore.set("xwin.wndList", ["root"]);

        var widgetInfo = uexWidgetOne.getCurrentWidgetInfo(); // {appId: 123456, version: "00.00.0000", name: "xxx", icon: "icon.png"}
        var version = widgetInfo.version;
        istore.set("sys.appVersion", version);

        var platform = uexWidgetOne.getPlatform();
        if (platform === 0) istore.set("persist.deviceOs", "ios");
        else if (platform === 1) istore.set("persist.deviceOs", "android");
        else istore.set("persist.deviceOs", "ide"); // 2

        var s = uexFileMgr.getFileRealPath(appcan.file.wgtPath);
        istore.set("xwin.wgtPath", s);

        s = uexFileMgr.getFileRealPath("file:///sdcard/");
        istore.set("xwin.sdcardPath", s);
    },

    /**@preserve
     * clearLocStorageAndTempFiles 清除 locStorage 和临时文件，在 root 页面 和 logout 时调用
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
     * appVersion 获取appVerion
     * @return  {String}
     */
    get appVersion() {
        var widgetInfo = uexWidgetOne.getCurrentWidgetInfo();
        return widgetInfo.version;
    },

    /**@preserve
     * deviceOs 获取device OS
     * @return  {String}
     */
    get deviceOs() {
        var platform = uexWidgetOne.getPlatform();
        if (platform === 0) return "ios";
        else if (platform === 1) return "android";
        else return "ide"; // 2
    },

    /**@preserve
     * isAndroid 判断是否是 android 系统
     * @return  {boolean}
     */
    isAndroid: function () {
        if (this._isAndroid === null) {
            this._isAndroid = uexWidgetOne.getPlatform() === 1;
        }
        return this._isAndroid;
    }, _isAndroid: null,

    /**@preserve
     * isAppInstalled 判断系统是否安装了指定的应用
     * @param name  {String} 应用名
     * @return      {boolean}
     */
    isAppInstalled: function (name) {
        return uexWidget.isAppInstalled(JSON.stringify({appData: name}));
    },

    /**@preserve
     * mapFileName 返回 url 匹配的文件名 用于下载保存文件时文件名的确定
     * @param url   {String}
     * @return      {string}
     * @desc url 如果只包含扩展名，每次获取都得到新文件名
     */
    mapFileName: function (url) {
        if (!url) return null;
        var result = this._mapFileName[url];
        if (result !== undefined) {
            return result;
        }

        var i = url.lastIndexOf(".");
        var ext = (i >= 0) ? url.substring(i) : "";
        if (ext.isImageFile()) result = "iamge" + this.getUID() + ext;
        else result = "doc" + this.getUID() + ext;

        if (i !== 0) this._mapFileName[url] = result;
        return result;
    }, _mapFileName: {}

};

appcan.ready(function () {
    appcan.xwin.prepare();
});
