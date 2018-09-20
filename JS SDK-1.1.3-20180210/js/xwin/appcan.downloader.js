"use strict";

/**
 * @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: 构建appcan downloader 模块
 * @created: 2018.3.22
 * @update: 2018.3.26
 */

/*global uexDownloaderMgr*/
appcan.downloader = {
    downloadQueue: {}, //下载队列

    /**
     * 下载状态回调 仅限于内部调用
     * @param optId     {Number}    下载对象的唯一标识符id
     * @param fileSize  {Number}    文件大小
     * @param percent   {Number}    下载文件的百分比
     * @param status    {Number}    下载的状态, 0-下载中 1-下载完成 2-下载失败
     */
    processDownloadCall: function (optId, fileSize, percent, status) {
        var thiz = appcan.downloader;
        var callback = null;
        var serverURL = null;
        var savePath = null;
        var mode = null;

        if (thiz.downloadQueue['download_call_' + optId]) {
            var qdata = thiz.downloadQueue['download_call_' + optId];
            callback = qdata.cb;
            serverURL = qdata.url;
            savePath = qdata.savePath;
            mode = qdata.mode;
        }

        if (appcan.isFunction(callback)) {
            switch (status) {
                case 0: // 下载中
                    break;
                case 1: // 下载完成
                    uexDownloaderMgr.closeDownloader(optId);
                    delete thiz.downloadQueue['download_call_' + optId];
                    break;
                case 2: // 下载失败
                    uexDownloaderMgr.cancelDownload(serverURL, 1);
                    delete thiz.downloadQueue['download_call_' + optId];
                    break;
            }
            callback(optId, fileSize, percent, status, serverURL, savePath, mode);
        }
    },

    /**@preserve
     * download 下载文件
     * @param serverURL   {String}    下载地址
     * @param savePath    {String}    本地保存地址
     * @param mode        {Integer}   是否支持断点续传,0:不支持,1:支持
     * @param headers     {json=}      请求头
     * @param callback    {function(optId, fileSize, percent, status, serverURL, savePath, mode)}  回调函数
     */
    download: function (serverURL, savePath, mode, headers, callback) {
        if (arguments.length === 1 && appcan.isPlainObject(serverURL)) {
            var argObj = serverURL;
            serverURL = argObj.serverURL;
            savePath = argObj.savePath;
            mode = argObj.mode;
            headers = argObj.headers;
            callback = argObj.callback;
        }

        var optId = uexDownloaderMgr.create();
        if (headers) uexDownloaderMgr.setHeaders(optId, headers);

        if (appcan.isFunction(callback)) {
            this.downloadQueue['download_call_' + optId] = {
                cb: callback,
                url: serverURL,
                savePath: savePath,
                mode: mode
            };

            if (!this._initialized) {
                uexDownloaderMgr.onStatus = function (optId, fileSize, percent, status) {
                    appcan.downloader.processDownloadCall.apply(null, arguments);
                };
                this._initialized = true;
            }
        }

        uexDownloaderMgr.download(optId, serverURL, savePath, mode);
        return optId;
    }, _initialized: false,

    /**@preserve
     * cancel 取消指定下载地址的下载任务
     * @param serverURL {String}    下载地址
     */
    cancel: function (serverURL) {
        if (arguments.length === 1 && appcan.isPlainObject(serverURL)) {
            serverURL = serverURL.serverURL;
        }
        if (!serverURL) {
            return;
        }
        uexDownloaderMgr.cancelDownload(serverURL, 1);

        for (var key in this.downloadQueue) {
            if (this.downloadQueue[key].url === serverURL) delete this.downloadQueue[key];
        }
    },

    /**@preserve
     * cancelAll 取消所有未完成的下载任务
     */
    cancelAll: function () {
        for (var key in this.downloadQueue) {
            uexDownloaderMgr.cancelDownload(this.downloadQueue[key].url, 1);
            delete this.downloadQueue[key];
        }
    }
};
