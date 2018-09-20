"use strict";

/** @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: Toast
 * @created: 2018.4.4
 * @update: 2018.4.4
 */
var Toast = appcan.Toast = {
    logging: function () {
        var msg = "正在登录中";
        uexWindow.toast(1, 8, msg, 20000);
    },

    loading: function () {
        var msg = "正在加载中";
        uexWindow.toast(1, 8, msg, 20000);
    },

    saving: function () {
        var msg = "正在提交数据";
        uexWindow.toast(1, 8, msg, 20000);
    },

    hide: function () {
        uexWindow.closeToast();
    },

    show: function (msg) {
        if (!msg) uexWindow.closeToast();
        else uexWindow.toast(0, 8, msg, 4000);
    }
};

