"use strict";

/**
 * 此代码应该在 root 页面优先调用 (优先于 config.js)
 */
appcan.ready(function () {
    appcan.xwin.clearLocStorageAndTempFiles();
    appcan.xwin.initLocStorage();

    appcan.iApp.prepare(true); // uexiAppRevisionAndOffice 插件的bug，其它window的回调都调用 第一个window的回调
});
