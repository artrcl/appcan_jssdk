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
        debugTokenId: ''  //  用于appcan编辑调试    {String=}
    },

    // JSESSIONID 方式的话将在 url 附加 JSESSIONID=...,
    // param 方式, 如 "__sid", 将会在 url 的 querystr 附加 __sid=...
    // header 方式, 如 {Auth: "?"}, 就在 http header 里添加 header： "Auth：..."
    _tokenType: "JSESSIONID", // 设置默认值
    // tokenType : '__sid',
    // tokenType : {Auth: "?"},

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
        istore.set("xio.serverIndex", value);
    },
    /**@preserve
     * serverIndex 当前选用的server索引
     * @return  {Integer}
     */
    get serverIndex() {
        var value = istore.get("xio.serverIndex");
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

    /**
     * @preserve
     * absoluteUrl 把相对地址转为绝对地址
     * @param url   {string}
     * @return      {string}
     */
    absoluteUrl: function (url) {
        var query = '';
        var i = url.indexOf('?');
        if (i >= 0) {
            url = url.substring(0, i);
            query = url.substring(i);
        }

        url = url.replace(/(?!:)(?:\/)\/{2,}/g, "/");
        url = url.replace(/\/(\.\/)+/g, "/");

        var s = "";
        while (s !== url) {
            s = url;
            url = url.replace(/(?!\/\.\.\/)\/[^\/]+\/\.\.\//g, "/");
        }

        return url + query;
    },

    /**@preserve
     * httpUrl 转换为一个绝对的地址，并根据需要附带 TOKENID
     * @param url   {String}
     * @return      {String}
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
     * @param callback  {function(data, code)}
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
                if (callback.length <= 1) return;  // callback 有2个或多个参数时，code为 FAILED 也回调
            }
            if ($.type(callback) === "function") callback(result.data, result.code);
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
     * @param callback  {function(data, code)}
     * @param isDebug   {boolean=}
     * @param progressCallback  {function(progress)}
     */
    post2: function (url, data, callback, progressCallback, isDebug) {
        var msg_timeout = "操作超时,请重新登录"; // 会话超时了
        var msg_failed = "请求数据失败了";  // 服务端获取数据出现了问题，没有得到数据
        var msg_error = "请求过程中发生错误了"; // 一般是网络故障或服务端物理故障不能完成请求

        var req = uexXmlHttpMgr.create({
            method: "POST",
            url: this.httpUrl(url)
        });

        if ($.type(data) === "object") {
            for (var key in data) {
                var value = data[key];
                if ($.type(value) === "object" && value.path) {
                    uexXmlHttpMgr.setPostData(req, 1, key, value.path); // binary
                } else {
                    uexXmlHttpMgr.setPostData(req, 0, key, value);
                }
            }
        } else {
            uexXmlHttpMgr.setBody(req, data);
        }

        if ($.type(this.tokenType) === "object") {
            var tokenId = this.tokenId || this.serverConfig.debugTokenId;
            if (tokenId) {
                var headers = {};
                for (var key in this.tokenType) {
                    headers[key] = this.tokenType[key].replace(/\?/g, tokenId);
                }
                uexXmlHttpMgr.setHeaders(req, JSON.stringify(headers))
            }
        }

        uexXmlHttpMgr.send(req, (isDebug) ? 3 : 0,
            function (status, resStr, resCode, resInfo) {
                if (status === 0) return; // -1=error 0=receive 1=finish
                uexXmlHttpMgr.close(req);

                if (status === -1) {
                    uexWindow.toast(0, 8, msg_error, 4000);
                    return;
                }

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
                if ($.type(callback) === "function") callback(result.data, result.code);
            },
            function (progress) {
                if ($.type(progressCallback) === "function") progressCallback(progress);
            }
        );
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
    }

};
