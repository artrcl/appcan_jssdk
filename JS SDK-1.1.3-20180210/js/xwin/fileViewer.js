"use strict";

var fileViewer = appcan.fileViewer = {
    _moffice_pro_installed: undefined,

    createFileObj: function () {
        return {
            url: '', // 服务端文件地址
            filePath: '', // 下载后本地的路径
            isOverrideMode: false,  // 下载是否覆盖, 如果不覆盖且存在文件, 就使用原来已有的文件
            isReadonly: true,
            isReviseMode: false,

            fileName: '', // 文件标题
            isDocEditable: false, // 公文当前是否可编辑
            isSharable: false, // 是否可共享或下载

            attachmentType: -1, // 1=正文 0=附件

            changed: false,
            callback: function (fileObj) {
            }
        };
    },


    /**
     * open
     * @param fileObj   {{filePath:String, isReadonly:boolean, isReviseMode:boolean, callback:function(fileObj)}}
     * @param flags     {josn=}
     *
     */
    open: function (fileObj, flags) {
        if (!fileObj.filePath) {
            this.openFromWeb(fileObj);
            return;
        }

        if (flags === undefined) flags = {};

        if (flags.exists === undefined) {
            appcan.file.exists({
                filePath: fileObj.filePath,
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

        if (fileObj.filePath.isImageFile()) {
            uexImage.openBrowser(JSON.stringify({enableGrid: false, data: [{src: fileObj.filePath}]}));
        } else if (appConfig.uex.uexiAppRevisionAndOffice && this._moffice_pro_installed && fileObj.filePath.isWpsFile()) {
            appcan.iApp.openLocalFile(fileObj.filePath, fileObj.isReadonly ? 1 : 0, fileObj.isReviseMode ? 1 : 0, appcan.xwin.userName, function (data) {
                fileObj.changed = data.result;
                if (fileObj.changed && $.type(fileObj.callback) === "function") {
                    fileObj.callback(fileObj);
                }
            });
        } else if (appConfig.uex.uexWps && this._moffice_pro_installed && fileObj.filePath.isWpsFile()) {
            uexWps.onMessage = function (msg, data) {
                if (msg === "saved") {
                    if (!fileObj.isReadonly) fileObj.changed = true;
                } else if (msg === "closed") {
                    if (fileObj.changed && $.type(fileObj.callback) === "function") {
                        fileObj.callback(fileObj);
                    }
                }
            };
            uexWps.open({file: fileObj.filePath, readonly: !!fileObj.isReadonly})
        } else if (fileObj.filePath.isWpsFile()) {
            Toast.show('提示: 对文档的修改都将被忽略');
            window.setTimeout(function () {
                uexDocumentReader.openDocumentReader(fileObj.filePath);
            }, 1500);
        } else if (fileObj.filePath.isTifFile()) {
            uexDocumentReader.openDocumentReader(fileObj.filePath);
        } else { // 其它
            uexDocumentReader.openDocumentReader(fileObj.filePath);
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
            urlObj.filePath = appcan.xwin.tempDir + appcan.xwin.mapFileName(urlObj.url);
        }

        if (flags.exists === undefined && !urlObj.isOverrideMode) {
            appcan.file.exists({
                filePath: urlObj.filePath,
                callback: function (err, data, dataType, optId) {
                    var thiz = appcan.fileViewer;
                    if (err) {
                        //判断文件存在出错了
                        Toast.show("检查文件存在性出错了");
                    } else if (data === 1) { // 文件存在
                        flags.exists = true;
                        thiz.open(urlObj, flags);
                    } else { // 文件不存在
                        flags.exists = false;
                        thiz.openFromWeb(urlObj, flags);
                    }
                }
            });
            return;
        }

        appcan.downloader.download(urlObj.url, urlObj.filePath, 1, null, function (optId, fileSize, percent, status) {
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

