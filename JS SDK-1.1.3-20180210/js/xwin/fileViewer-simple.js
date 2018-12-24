"use strict";

var fileViewer = appcan.fileViewer = {

    /**
     * createFileObj
     * @param url               {String=}
     * @param savePath          {String=}
     * @param isOverrideMode    {boolean=}
     * @return {{url: string, savePath: string, isOverrideMode: boolean}}
     */
    createFileObj: function (url, savePath, isOverrideMode) {
        return {
            url: url || '', // 文件下载地址 全路径地址
            savePath: savePath || '', // 本地保存路径

            // 下载控制
            isOverrideMode: !!isOverrideMode  // 下载是否覆盖, 如果不覆盖且存在文件, 就使用原来已有的文件
        };
    },

    /**
     * open
     * @param fileObj   {{savePath:String}}
     * @param flags     {josn=}
     *
     */
    open: function (fileObj, flags) {
        if (!fileObj.savePath) {
            this.openFromWeb(fileObj);
            return;
        }

        if (flags === undefined) flags = {};

        if (flags.exists === undefined) {
            flags.exists = uexFileMgr.isFileExistByPath(fileObj.savePath);
        }

        if (!flags.exists) {
            Toast.show("文件不存在");
            return;
        }

        if (fileObj.savePath.isImageFile()) {
            uexImage.openBrowser(JSON.stringify({enableGrid: false, data: [{src: fileObj.savePath}]}));
        } else if (fileObj.savePath.isWpsFile()) {
            Toast.show('提示: 对文档的修改都将被忽略');
            window.setTimeout(function () {
                uexDocumentReader.openDocumentReader(fileObj.savePath);
            }, 1500);
        } else if (fileObj.savePath.isTifFile()) {
            uexDocumentReader.openDocumentReader(fileObj.savePath);
        } else { // 其它
            uexDocumentReader.openDocumentReader(fileObj.savePath);
        }
    },

    /**
     * openFromWeb
     * @param urlObj   {{url:String, isOverrideMode:boolean}}
     * @param flags   {josn=}
     *
     */
    openFromWeb: function (urlObj, flags) {
        if (!urlObj.url) return;

        if (flags === undefined) {
            if (urlObj.url.isImageFile()) {
                uexImage.openBrowser(JSON.stringify({enableGrid: false, data: [{src: urlObj.url}]}));
                return;
            }

            flags = {};
            urlObj.savePath = appcan.xwin.tempDir + appcan.xwin.mapFileName(urlObj.url);
        }

        if (flags.exists === undefined) {
            flags.exists = uexFileMgr.isFileExistByPath(urlObj.savePath);
        }

        if (flags.exists) { // 文件存在
            if (urlObj.isOverrideMode) {
                uexFileMgr.deleteFileByPath(urlObj.savePath); // 下载覆盖文件会出错，删除原来的文件
                flags.exists = false;
            } else {
                this.open(urlObj, flags);
                return;
            }
        }

        appcan.downloader.download(urlObj.url, urlObj.savePath, 1, null, function (fileSize, percent, status) {
            switch (status) {
                case 0: // 下载中
                    Toast.show(percent + '%');
                    break;
                case 1: // 下载完成
                    Toast.hide();
                    var thiz = appcan.fileViewer;
                    flags.exists = true;
                    thiz.open(urlObj, flags);
                    break;
                case 2: // 下载失败
                    Toast.show('文件下载失败');
                    break;
            }
        })
    }
};

