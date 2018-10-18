"use strict";

var fileViewer = appcan.fileViewer = {
    _moffice_pro_installed: undefined,

    createFileObj: function () {
        return {
            url: '', // 文件下载地址 全路径地址
            savePath: '', // 本地保存路径

            // 编辑控制
            isOverrideMode: false,  // 下载是否覆盖, 如果不覆盖且存在文件, 就使用原来已有的文件
            isReadonly: true,
            isReviseMode: false,

            // 文件属性
            filePath: '', // 服务端保存地址
            fileName: '', // 文件名
            isDocEditable: false, // 公文当前是否可编辑
            isSharable: false, // 是否可共享或下载
            attachmentType: -1, // 1=正文 0=附件

            // 回调
            changed: false,
            callback: function (fileObj) {
            }
        };
    },


    /**
     * open
     * @param fileObj   {{savePath:String, isReadonly:boolean, isReviseMode:boolean, callback:function(fileObj)}}
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
            appcan.file.exists({
                filePath: fileObj.savePath,
                callback: function (err, data, dataType, optId) {
                    var thiz = appcan.fileViewer;
                    if (err) {
                        //判断文件存在出错了
                        Toast.show("检查文件存在性出错了");
                    } else if (data === 1) { // 文件存在
                        flags.exists = true;
                        thiz.open(fileObj, flags);
                    } else { // 文件不存在
                        Toast.show("文件不存在");
                    }
                }
            });
            return;
        }

        if (!flags.exists) {
            Toast.show("文件不存在");
            return;
        }

        if (this._moffice_pro_installed === undefined) {
            this._moffice_pro_installed = appcan.xwin.isAppInstalled('com.kingsoft.moffice_pro');
        }

        if (fileObj.savePath.isImageFile()) {
            uexImage.openBrowser(JSON.stringify({enableGrid: false, data: [{src: fileObj.savePath}]}));
        } else if (appConfig.uex.uexiAppRevisionAndOffice && this._moffice_pro_installed && fileObj.savePath.isWpsFile()) {
            appcan.iApp.openLocalFile(fileObj.savePath, fileObj.isReadonly ? 1 : 0, fileObj.isReviseMode ? 1 : 0, appcan.xwin.userName, function (data) {
                fileObj.changed = data.result;
                if (fileObj.changed && $.type(fileObj.callback) === "function") {
                    fileObj.callback(fileObj);
                }
            });
        } else if (appConfig.uex.uexWps && this._moffice_pro_installed && fileObj.savePath.isWpsFile()) {
            uexWps.onMessage = function (msg, data) {
                if (msg === "saved") {
                    if (!fileObj.isReadonly) fileObj.changed = true;
                } else if (msg === "closed") {
                    if (fileObj.changed && $.type(fileObj.callback) === "function") {
                        fileObj.callback(fileObj);
                    }
                }
            };
            uexWps.open({filePath: fileObj.savePath, isReadonly: !!fileObj.isReadonly, isReviseMode: !!fileObj.isReviseMode, userName: appcan.xwin.userName})
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
     * @param urlObj   {{url:String, isOverrideMode:boolean, isReadonly:boolean, isReviseMode:boolean, callback:function(fileObj)}}
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
            appcan.file.exists({
                filePath: urlObj.savePath,
                callback: function (err, data, dataType, optId) {
                    var thiz = appcan.fileViewer;
                    if (err) {
                        //判断文件存在出错了
                        Toast.show("检查文件存在性出错了");
                    } else if (data === 1) { // 文件存在
                        if (urlObj.isOverrideMode) {
                            uexFileMgr.deleteFileByPath(urlObj.savePath); // 下载覆盖文件会出错，删除原来的文件
                            flags.exists = false;
                            thiz.openFromWeb(urlObj, flags);
                        } else {
                            flags.exists = true;
                            thiz.open(urlObj, flags);
                        }
                    } else { // 文件不存在
                        flags.exists = false;
                        thiz.openFromWeb(urlObj, flags);
                    }
                }
            });
            return;
        }

        appcan.downloader.download(urlObj.url, urlObj.savePath, 1, null, function (optId, fileSize, percent, status) {
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

