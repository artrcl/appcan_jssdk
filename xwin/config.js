"use strict";

window.serverConfig = {
    serverUrl: 'http://a.bc.cn/dz/',  //  服务端地址 {String|Array}
    serverIndex: 0, // 默认的服务端地址 index
    downloadUrlTemplate: 'http://a.bc.cn/dz/download?url=%s', // 服务端文件下载地址模板 {String|Array}
    tokenType: '__sid',  //  会话维持的方式: JSESSIONID, param 或 header    {String|Object}
    loginUrl: 'login',  //  login url   {String=}
    logoutUrl: 'logout',  //  logout url {String=}
    isDebug: false,  // uexXmlHttpMgr 提交是否打开日志输出
    debugTokenId: ''  //  用于appcan编辑调试    {String=}
};

var reqJS = {
    absUrl: function (baseUrl, url) {
        if (/^\//.test(url)) return url;
        if (/:\/\//.test(url)) return url;

        url = baseUrl + "abc/../" + url;
        var s = '';
        while (s !== url) {
            s = url;
            url = url.replace(/(?!\/\.\.\/)\/[^\/]+\/\.\.\//g, "/");
        }
        return url;
    },

    include: function (baseUrl, url, type) {
        if (type && type === "css") {
            document.write("<link rel='stylesheet' href='" + this.absUrl(baseUrl, url) + "'>");
        } else {
            document.write("<script src='" + this.absUrl(baseUrl, url) + "'></script>");
        }
    },

    batchInclude: function (baseUrl, js, css) {
        if (!baseUrl) baseUrl = this.baseUrlFromJs();

        if (!js) js = []; else if (typeof js === "string") js = [js];
        if (!css) css = []; else if (typeof css === "string") css = [css];

        var i;
        for (i = 0; i < css.length; i++) {
            this.include(baseUrl, css[i], 'css');
        }

        for (i = 0; i < js.length; i++) {
            this.include(baseUrl, js[i]);
        }
    },

    baseUrlFromJs: function () {
        var scripts = document.getElementsByTagName("script");
        var lastScript = scripts[scripts.length - 1];
        return $(lastScript).attr('src');
    }
};

(function () {
    var js = [
        'fontsize.js', 'istore.js', 'appLog.js', 'extend.js', 'arrays.js',
        'laytpl.js', 'cxdate.js', 'downloader.js', 'xwin.js', 'xio.js',
        'toast.js', 'iApp.js', 'fileViewer.js', 'calendar.js'
    ];

    var css = [];

    reqJS.batchInclude('', js, css);
})();

/**
 * @important
 * The javascript loaded by reqJS.batchInclude() may be not effective at this time.
 * You can run your code with callback function if necessary.
 */
