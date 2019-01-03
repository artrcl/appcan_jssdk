"use strict";

/**
 * @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: 构建appcan downloader 模块
 * @created: 2018.3.22
 * @update: 2018.12.24
 */

/*global uexDownloaderMgr*/
appcan.downloader = {

    /**@preserve
     * download 下载文件
     * @param serverURL   {String}    下载地址
     * @param savePath    {String}    本地保存地址
     * @param mode        {Integer}   是否支持断点续传,0:不支持,1:支持
     * @param headers     {json=}     请求头
     * @param callback    {function(fileSize, percent, status)}  回调函数
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

        // downloader,serverURL,savePath,mode,cb
        uexDownloaderMgr.download(optId, serverURL, savePath, mode, function (fileSize, percent, status) {
            if (status === 1 || status === 2) uexDownloaderMgr.closeDownloader(optId); // 下载完成 或 下载失败
            if (appcan.isFunction(callback)) {
                callback(fileSize, percent, status);
            }
        });
    },

    /**@preserve
     * cancel 取消指定下载地址的下载任务
     * @param serverURL {String}    下载地址
     */
    cancel: function (serverURL) {
        uexDownloaderMgr.cancelDownload(serverURL, 1);
    }

};
