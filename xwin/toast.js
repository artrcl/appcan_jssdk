"use strict";

/** @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: Toast
 * @created: 2018.4.4
 * @update: 2019.1.26
 */
var Toast = appcan.Toast = {
    /**
     * 隐藏 Toast
     */
    hide: function () {
        uexWindow.closeToast();
    },

    /**
     * 显示Toast
     * @param   {String}    msg     - 显示的文本
     * @param   {Integer=}  timeout - 显示时间长度 默认 4000 毫秒
     */
    show: function (msg, timeout) {
        if (!msg) uexWindow.closeToast();
        else uexWindow.toast(0, 8, msg, timeout || 4000);
    }
};

