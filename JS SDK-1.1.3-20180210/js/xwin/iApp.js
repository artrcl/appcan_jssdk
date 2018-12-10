"use strict";

/* global uexiAppRevisionAndOffice */
var iApp = appcan.iApp = {
    persisted: false,
    copyRight: '',

    init: function () {
        if (this._inited) return;
        this._inited = true;

        uexiAppRevisionAndOffice.setCopyRight(this.copyRight);
        this.prepare();
    }, _inited: false,

    prepare: function (persisted) {
        if (persisted) this.persisted = persisted;

        if (this._prepared) return;
        if (!window.uexiAppRevisionAndOffice) return;

        this._prepared = true;

        uexiAppRevisionAndOffice.saveFileCallback = function (data) {
            var thiz = appcan.iApp;
            if (typeof data === "string") data = JSON.parse(data);
            appcan.xwin.execute(thiz.wndName, 'appcan.iApp.callsaveFileCallback()', data);
        };

        uexiAppRevisionAndOffice.cbDoRevision = function (data) {
            var thiz = appcan.iApp;
            if (typeof data === "string") data = JSON.parse(data);
            appcan.xwin.execute(thiz.wndName, 'appcan.iApp.callcbDoRevision()', data);
        };
    }, _prepared: false,

    set wndName(value) {
        istore.set("iApp.wnd", value);
    },
    get wndName() {
        return istore.get("iApp.wnd", "");
    },

    callsaveFileCallback: function () {
        if ($.type(this._saveFileCallback) === "function") {
            this._saveFileCallback.apply(null, arguments);
        }
    }, _saveFileCallback: undefined,

    callcbDoRevision: function () {
        if ($.type(this._cbDoRevision) === "function") {
            this._cbDoRevision.apply(null, arguments);
        }
    }, _cbDoRevision: undefined,

    /**@preserve
     * openLocalFile
     * @param filePath      {String}
     * @param isReadOnly    {boolean}
     * @param isReviseMode  {boolean}
     * @param username      {String}
     * @param callback      {function(data:{reeult:boolean,errorMsg:String})}
     */
    openLocalFile: function (filePath, isReadOnly, isReviseMode, username, callback) {
        this._saveFileCallback = callback;
        this.wndName = appcan.xwin.wndName;
        this.init();

        uexiAppRevisionAndOffice.openLocalFile(appcan.xwin.fileProviderPath(filePath), isReadOnly ? 1 : 0, isReviseMode ? 1 : 0, username, 1 /*isShowReviseWin*/);
    },

    /**@preserve
     * doRevision 手写
     * @param userName  {String}
     * @param callback  {function(data:{result:String,message:base64Encoded})} result='success'
     */
    doRevision: function (userName, callback) {
        this._cbDoRevision = callback;
        this.wndName = appcan.xwin.wndName;
        this.init();

        uexiAppRevisionAndOffice.doRevision(userName);
    },

    /**@preserve
     * doIntersectedRevision 九宫格手写
     * @param userName      {String}
     * @param wordPerRow    {Number=}
     * @param picWidth      {Number=}
     * @param callback      {function(data:{result:String,message:base64Encoded})} result='success'
     */
    doIntersectedRevision: function (userName, wordPerRow, picWidth, callback) {
        if (arguments.length === 2) {
            callback = wordPerRow;
            wordPerRow = 26;
            picWidth = 800;
        }
        this._cbDoRevision = callback;
        this.wndName = appcan.xwin.wndName;
        this.init();

        uexiAppRevisionAndOffice.doIntersectedRevision(userName, wordPerRow, picWidth);
    },

    /**@preserve
     * saveToFile
     * @param filePath  {String}
     * @param data      {base64Encoded}
     * @param callback  {function(filePath)}
     * @param extra     {Number|String}
     */
    saveToFile: function (filePath, data, callback, extra) {
        var file = uexFileMgr.open({path: filePath, mode: 2 + 4}); // 2=write 4=create if not found
        uexFileMgr.writeFile(file, 2, data, function (error) { // 2=Base64Decode
            try {
                uexFileMgr.closeFile(file);
            } catch (e) {
            }

            if (error === 0) { // success
                if ($.type(callback) === "function") {
                    callback(filePath, extra);
                }
            } else { // error
                uexWindow.toast(0, 8, '保存文件失败', 4000);
            }
        });
    }
};

appcan.ready(function () {
    var license;
    if (window.uexiAppRevisionAndOffice) {
        license = istore.get("sys.iApp.license", "");
        if (license === "") {
            if (!iApp.persisted) window.uexiAppRevisionAndOffice = undefined;
        } else {
            appcan.iApp.copyRight = license;
        }
    }
});
