"use strict";

window.appConfig = {
    // xwin
    serverUrl: 'http://a.bc.cn/dz',  //  服务端地址 {String|Array}
    serverIndex: 0, // 默认的服务端地址 index
    downloadUrlTemplate: 'http://a.bc.cn/dz/download?url=$s', // 服务端文件下载地址模板 {String|Array}
    tokenType: '',  //  会话维持的方式: JSESSIONID, param 或 header    {String|Object}
    loginUrl: '',  //  login url   {String=}
    logoutUrl: '',  //  logout url {String=}
    debugTokenId: '',  //  用于appcan编辑调试    {String=}

    ///////////////////////////
    js: ['fontsize.js', 'istore.js', 'appLog.js', 'extend.js', 'array.js', 'laytpl.js',
        'cxdate.js', 'appcan.downloader.js', 'appcan.xwin.js', 'toast.js',
        'iApp.js', 'iGDCA.js', 'fileViewer.js', 'appcan.fileMgr.js',
        'calendar.js'],
    css: [],
    fontSizeList: {
        f1: {value: 0.90, label: "小"},
        f2: {value: 1.00, label: "普通"},
        f3: {value: 1.15, label: "大"},
        f4: {value: 1.30, label: "特大"},
        f5: {value: 1.50, label: "超大"},
        defvalue: "f2"
    },
    appLogEnabled: true
};

appcan.ready(function () {
    if (window.uexiAppRevisionAndOffice) {
        var license = istore.get("sys.iAppLicense", "");
        if (license === "") {
            window.uexiAppRevisionAndOffice = undefined;
        } else {
            appcan.iApp.copyRight = license;
        }
    }
});

var reqJS = {
    absUrl: function (baseUrl, url) {
        if (/^\//.test(url)) return url;
        if (/:\/\//.test(url)) return url;

        url = baseUrl + "abc/../" + url;
        var s = '';
        while (s !== url) {
            s = url;
            url = url.replace(/\/((?![^/]*(\.\.))[^/]*)\/\.\.\//g, '/')
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

reqJS.batchInclude(reqJS.baseUrlFromJs(), window.appConfig.js, window.appConfig.css);
