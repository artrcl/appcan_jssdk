"use strict";

/* global uexiAppRevisionAndOffice */
var iApp = appcan.iApp = {

    // expires 2018-9-26
    copyRight: 'SxD/phFsuhBWZSmMVtSjKZmm/c/3zSMrkV2Bbj5tznSkEVZmTwJv0wwMmH/+p6wLiUHbjadYueX9v51H9GgnjUhmNW1xPkB++KQqSv/VKLDsR8V6RvNmv0xyTLOrQoGzAT81iKFYb1SZ/Zera1cjGwQSq79AcI/N/6DgBIfpnlwiEiP2am/4w4+38lfUELaNFry8HbpbpTqV4sqXN1WpeJ7CHHwcDBnMVj8djMthFaapMFm/i6swvGEQ2JoygFU3W8onCO1AgMAD2SkxfJXM/ijYgmFZo8sqFMkNKOgywo7x6aD2yiupr6ji7hzsE6/QVFbnJOcPDznqYpoJ6epdnT4Y1YsZxXwh2w5W4lqa1RyVWEbHWAH22+t7LdPt+jENVuE+uBYut77v64UQW7HW3mj7ISWDgc3YLh0bz4sFvgWSgCNRP4FpYjl8hG/IVrYXl2lZdwXeCcBhFGv3J7Er9+W8fXpxdRHfEuWC1PB9ruQ=',

    init: function () {
        if (this._inited) return;
        this._inited = true;

        uexiAppRevisionAndOffice.setCopyRight(this.copyRight);
        this.prepare();
    }, _inited: false,

    prepare: function () {
        if (this._prepared) return;
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
        appcan.locStorage.setVal("xwin.iApp.wnd", value);
    },
    get wndName() {
        return appcan.locStorage.getVal("xwin.iApp.wnd");
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
        this.wndName = appcan.xwin.current;
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
        this.wndName = appcan.xwin.current;
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
        this.wndName = appcan.xwin.current;
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
    if (appConfig.uex.uexiAppRevisionAndOffice) appcan.iApp.prepare();
});
