"use strict";

/**
 * @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: 构建appcan fileMgr 模块
 * @created: 2018.7.13
 */

/*global uexFileMgr*/
appcan.fileMgr = {
    explorerQueue: {}, //浏览队列

    /**
     * 浏览文件回调 仅限于内部调用
     * @param optId     {Number}    浏览对象的唯一标识符id
     * @param dataType  {Number}
     * @param data      {String | json}      选择的结果
     */
    processExplorerCall: function (optId, dataType, data) {
        var thiz = appcan.fileMgr;
        var callback = null;

        var qdata = thiz.explorerQueue['explorer_call'];
        if (qdata) {
            callback = qdata.cb;
        }

        if (appcan.isFunction(callback)) {
            data = $.trim(data);
            if (!data) {
                data = {}
            } else if (data.substring(0, 1) !== "{") { // 单选，uexFileMgr with click to select only one file
                data = {"0": data}
            } else {
                data = JSON.parse(data);
            }

            callback(data);
        }
    },

    /**@preserve
     * explorer 浏览单选文件
     * @param path      {String}    根路径
     * @param callback  {function(data:json)}  回调函数
     */
    explorer: function (path, callback) {
        if (arguments.length === 1 && appcan.isPlainObject(path)) {
            var argObj = path;
            path = argObj.path;
            callback = argObj.callback;
        }

        if (appcan.isFunction(callback)) {
            this.explorerQueue['explorer_call'] = {
                cb: callback
            };

            if (!this._initialized) {
                uexFileMgr.cbExplorer = uexFileMgr.cbMultiExplorer = function (optId, dataType, data) {
                    appcan.fileMgr.processExplorerCall.apply(null, arguments);
                };
                this._initialized = true;
            }
        } else {
            this.explorerQueue['explorer_call'] = {
                cb: null
            };
        }

        uexFileMgr.explorer(path);
    },

    /**@preserve
     * multiExplorer 浏览多选文件
     * @param path      {String}    根路径
     * @param callback  {function(data:json)}  回调函数
     */
    multiExplorer: function (path, callback) {
        if (arguments.length === 1 && appcan.isPlainObject(path)) {
            var argObj = path;
            path = argObj.path;
            callback = argObj.callback;
        }

        if (appcan.isFunction(callback)) {
            this.explorerQueue['explorer_call'] = {
                cb: callback
            };

            if (!this._initialized) {
                uexFileMgr.cbExplorer = uexFileMgr.cbMultiExplorer = function (optId, dataType, data) {
                    appcan.fileMgr.processExplorerCall.apply(null, arguments);
                };
                this._initialized = true;
            }
        } else {
            this.explorerQueue['explorer_call'] = {
                cb: null
            };
        }

        uexFileMgr.multiExplorer(path);
    }, _initialized: false

};
