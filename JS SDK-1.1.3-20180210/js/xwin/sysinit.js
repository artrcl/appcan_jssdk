"use strict";

/**
 * 此代码应该在 root 页面优先调用 (优先于 config.js)
 */
appcan.ready(function () {
    appcan.xwin.clearLocStorageAndTempFiles();
    appcan.xwin.initLocStorage();

    appcan.iApp.prepare(); // uexiAppRevisionAndOffice 插件的bug，其它window的回调都调用到了 第一个window的回调去了。
});
