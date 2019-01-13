"use strict";

/**
 * @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: 构建appcan xio 模块
 * @created: 2018.3.22
 * @update: 2019.1.3
 */

/*global uexWindow, uexWidgetOne, uexXmlHttpMgr*/

var xio = appcan.xio = {
    serverConfig: {
        serverUrl: 'http://a.bc.cn/dz/',  //  服务端地址 {String|Array}
        serverIndex: 0, // 默认的服务端地址 index
        downloadUrlTemplate: 'http://a.bc.cn/dz/download?url=$s', // 服务端文件下载地址模板 {String|Array}
        tokenType: 'JSESSIONID',  //  会话维持的方式: JSESSIONID, param 或 header    {String|Object}
        loginUrl: 'login',  //  login url   {String=}
        logoutUrl: 'logout',  //  logout url {String=}
        isDebug: false,  // uexXmlHttpMgr 提交是否打开日志输出
        debugTokenId: ''  //  用于appcan编辑调试    {String=}
    },

    // JSESSIONID 方式的话将在 url 附加 JSESSIONID=...,
    // param 方式, 如 "__sid", 将会在 url 的 querystr 附加 __sid=...
    // header 方式, 如 {Auth: "?"}, 就在 http header 里添加 header： "Auth：..."
    // tokenType : "JSESSIONID",
    // tokenType : '__sid',
    // tokenType : {Auth: "?"},

    /**@preserve
     * 服务端地址
     * @return  {Array}
     */
    get serverUrl() {
        if (!this._internals.serverUrl) {
            var value = (window.serverConfig || this.serverConfig).serverUrl;
            if ($.type(value) === "string") value = [value];
            this._internals.serverUrl = value;
            if (this.serverIndex < 0 || this.serverIndex >= this._internals.serverUrl.length) this.serverIndex = 0;
        }
        return this._internals.serverUrl;
    },

    /**@preserve
     * 服务端文件下载地址模板
     * @return  {Array}
     */
    get downloadUrlTemplate() {
        if (!this._internals.downloadUrlTemplate) {
            var value = (window.serverConfig || this.serverConfig).downloadUrlTemplate;
            if ($.type(value) === "string") value = [value];
            this._internals.downloadUrlTemplate = value;
        }
        return this._internals.downloadUrlTemplate;
    },

    /**@preserve
     * 当前选用的server索引
     * @param   {Integer}   value
     */
    set serverIndex(value) {
        this._internals.serverUrl = null;
        this._internals.downloadUrlTemplate = null;
        istore.set("xio.serverIndex", value);
    },
    /**@preserve
     * 当前选用的server索引
     * @return  {Integer}
     */
    get serverIndex() {
        var value = istore.get("xio.serverIndex");
        if (value == null) {
            value = (window.serverConfig || this.serverConfig).serverIndex;
            value = value ? eval(value) : 0;
            if (value < 0 || value >= this.serverUrl.length) value = 0;
            return value;
        } else {
            return eval(value);
        }
    },

    /**@preserve
     * 会话维持的方式: JSESSIONID, param 或 header
     * @return  {String|Object}
     */
    get tokenType() {
        var tokenType = (window.serverConfig || this.serverConfig).tokenType;
        if (tokenType) return tokenType;
        return 'JSESSIONID';
    },

    /**
     * @preserve
     * 把相对地址转为绝对地址
     * @param   {String}    url
     * @return  {String}
     */
    absoluteUrl: function (url) {
        var query = '';
        var i = url.indexOf('?');
        if (i >= 0) {
            query = url.substring(i);
            url = url.substring(0, i);
        }

        url = url.replace(/(^|[^:])\/{2,}/g, "$1/");
        url = url.replace(/\/(\.\/)+/g, "/");

        var s = "";
        while (s !== url) {
            s = url;
            url = url.replace(/(?!\/\.\.\/)\/[^\/]+\/\.\.\//g, "/");
        }

        return url + query;
    },

    /**@preserve
     * 转换为一个绝对的地址，并根据需要附带 TOKENID
     * @param   {String}    url
     * @return  {String}
     */
    httpUrl: function (url) {
        var serverUrl = this.serverUrl[this.serverIndex];

        if (url.indexOf("://") < 0) {
            url = serverUrl + "/" + url;
            url = this.absoluteUrl(url);
        } else {
            // return url; // 重复调用 httpUrl() !
        }

        if (typeof this.tokenType === "string") {
            var tokenId = this.tokenId || (window.serverConfig || this.serverConfig).debugTokenId;
            if (tokenId) {
                var i = url.indexOf("?");

                if (this.tokenType === "JSESSIONID") {
                    if (i < 0) i = url.indexOf("#");
                    if (i < 0) i = url.length;
                    var j = url.indexOf(";");

                    if (j < 0 || j > i) {
                        url = url.substring(0, i) + ";" + this.tokenType + "=" + tokenId + url.substring(i);
                    } else {
                        url = url.substring(0, j) + ";" + this.tokenType + "=" + tokenId + url.substring(i);
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
     * 转换为一个绝对的文件下载地址，并根据需要附带 TOKENID
     * @param   {String}    url
     * @return  {String}
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
     * 提交请求
     * @param   {String}    url
     * @param   {Object}    data    - 上传文件的话，指定参数值为 object, 如 {path:'/path/file.jpg'}
     * @param   {function(data, code)}  callback
     * @param   {function(progress)}    progressCallback
     */
    post: function (url, data, callback, progressCallback) {
        var msg_timeout = "操作超时,请重新登录"; // 会话超时了
        var msg_failed = "请求数据失败了";  // 服务端获取数据出现了问题，没有得到数据
        var msg_error = "请求过程中发生错误了"; // 一般是网络故障或服务端物理故障不能完成请求

        if ($.type(data) === "function") {
            progressCallback = callback;
            callback = data;
            data = null;
        }

        var options = {};
        options.type = "POST";
        options.url = this.httpUrl(url);
        options.data = data; //
        options.success = function (resStr, status, requestCode, response, xhr) {
            uexWindow.closeToast();
            var result = JSON.parse(resStr);
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
                if (callback.length <= 1) return;  // callback 有2个或多个参数时，code为 FAILED 也回调
            }
            if ($.type(callback) === "function") callback(result.data, result.code, resStr);
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
            var tokenId = this.tokenId || (window.serverConfig || this.serverConfig).debugTokenId;
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
     * 提交请求, 与 post 完成一样的功能
     * @param   {String}    url
     * @param   {Object}    data    - 上传文件的话，指定参数值为 object, 如 {path:'/path/file.jpg'
     * @param   {function(data, code)}  callback
     * @param   {function(progress)}    progressCallback
     */
    post2: function (url, data, callback, progressCallback) {
        var msg_timeout = "操作超时,请重新登录"; // 会话超时了
        var msg_failed = "请求数据失败了";  // 服务端获取数据出现了问题，没有得到数据
        var msg_error = "请求过程中发生错误了"; // 一般是网络故障或服务端物理故障不能完成请求

        if ($.type(data) === "function") {
            progressCallback = callback;
            callback = data;
            data = null;
        }

        var req = uexXmlHttpMgr.create({
            method: "POST",
            url: this.httpUrl(url)
        });

        uexXmlHttpMgr.setAppVerify(req, 1);

        if ($.type(data) === "object") {
            for (var key in data) {
                var value = data[key];
                if ($.type(value) === "object") {
                    if (value.path) {
                        uexXmlHttpMgr.setPostData(req, 1, key, value.path); // binary
                    } else {
                        uexXmlHttpMgr.setPostData(req, 0, key, JSON.stringify(value));
                    }
                } else if (value !== null && value !== undefined) {
                    uexXmlHttpMgr.setPostData(req, 0, key, value);
                }
            }
        } else {
            uexXmlHttpMgr.setBody(req, data);
        }

        if ($.type(this.tokenType) === "object") {
            var tokenId = this.tokenId || (window.serverConfig || this.serverConfig).debugTokenId;
            if (tokenId) {
                var headers = {};
                for (var key in this.tokenType) {
                    headers[key] = this.tokenType[key].replace(/\?/g, tokenId);
                }
                uexXmlHttpMgr.setHeaders(req, JSON.stringify(headers))
            }
        }

        uexXmlHttpMgr.send(req, ((window.serverConfig || this.serverConfig).isDebug) ? 3 : 0,
            function (status, resStr, resCode, resInfo) {
                if (status === 0) return; // -1=error 0=receive 1=finish
                uexXmlHttpMgr.close(req);

                if (status === -1) {
                    uexWindow.toast(0, 8, msg_error, 4000);
                    return;
                }

                uexWindow.closeToast();
                var result = JSON.parse(resStr);
                if ($.type(result) === "string") { // 竟然还是 string
                    resStr = result;
                    result = JSON.parse(resStr);
                }
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
                    if (callback.length <= 1) return;  // callback 有2个或多个参数时，code为 FAILED 也回调
                }
                if ($.type(callback) === "function") callback(result.data, result.code, resStr);
            },
            function (progress) {
                if ($.type(progressCallback) === "function") progressCallback(progress);
            }
        );
    },

    /**@preserve
     * logout
     * @param   {String=}   url - logout url
     */
    logout: function (url) {
        xio.post(url || (window.serverConfig || this.serverConfig).logoutUrl || "logout");
        appcan.xwin.clearLocStorageAndTempFiles();
        uexWidgetOne.exit(0);
    },

    /**@preserve
     * tokenId
     * @param   {String}    value
     */
    set tokenId(value) {
        istore.set("xio.tokenId", value);
    },
    /**@preserve
     * tokenId
     * @return  {String}
     */
    get tokenId() {
        return istore.get("xio.tokenId", "");
    },

    /**@preserve
     * loginName
     * @param   {String}    value
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
     * @param   {String}    value
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
     * @param   {String}    value
     */
    set userId(value) {
        istore.set("sys.userId", value);
    },
    /**@preserve
     * userId
     * @return  {String}
     */
    get userId() {
        return istore.get("sys.userId", "");
    },

    _internals: {
        serverUrl: null,
        downloadUrlTemplate: null,
    }

};
