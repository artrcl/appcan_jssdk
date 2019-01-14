"use strict";

var fileViewer = appcan.fileViewer = {

    /**
     * 创建一个文件对象
     * @param   {String=}   url         - 文件下载地址 全路径地址
     * @param   {String=}   fileExt     - url 可能不好判断文件类型，fileExt 直接指定
     * @param   {String=}   savePath    - 本地保存路径
     * @param   {boolean=}  isOverrideMode  - 下载是否覆盖, 如果不覆盖且存在文件, 就使用原来已有的文件
     * @return  {{url: string, savePath: string, isOverrideMode: boolean}}
     */
    createFileObj: function (url, fileExt, savePath, isOverrideMode) {
        return {
            url: url || '',
            fileExt: fileExt,
            savePath: savePath || '',

            // 下载控制
            isOverrideMode: !!isOverrideMode
        };
    },

    /**
     * 打开
     * @param {{savePath:String}}   fileObj
     * @param {Object=}             flags
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
     * 从服务端得到文件并打开
     * @param {{url:String, fileExt:String, isOverrideMode:boolean}}    fileObj
     * @param {Object=}     flags
     *
     */
    openFromWeb: function (fileObj, flags) {
        if (!fileObj.url) return;

        if (flags === undefined) {
            if ((($.type(fileObj.fileExt) === "string") ? fileObj.fileExt : fileObj.url).isImageFile()) {
                uexImage.openBrowser(JSON.stringify({enableGrid: false, data: [{src: fileObj.url}]}));
                return;
            }

            flags = {};
            fileObj.savePath = appcan.xwin.tempDir + appcan.xwin.mapFileName(fileObj.url, fileObj.fileExt);
        }

        flags.exists = uexFileMgr.isFileExistByPath(fileObj.savePath);

        if (flags.exists) { // 文件存在
            if (fileObj.isOverrideMode) {
                uexFileMgr.deleteFileByPath(fileObj.savePath); // 下载覆盖文件会出错，删除原来的文件
                flags.exists = false;
            } else {
                this.open(fileObj, flags);
                return;
            }
        }

        appcan.downloader.download(fileObj.url, fileObj.savePath, 1, null, function (fileSize, percent, status) {
            switch (status) {
                case 0: // 下载中
                    Toast.show(percent + '%');
                    break;
                case 1: // 下载完成
                    Toast.hide();
                    var thiz = appcan.fileViewer;
                    flags.exists = true;
                    thiz.open(fileObj, flags);
                    break;
                case 2: // 下载失败
                    Toast.show('文件下载失败');
                    break;
            }
        })
    }
};

