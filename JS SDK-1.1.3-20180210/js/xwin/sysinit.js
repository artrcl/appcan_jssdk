"use strict";

/**
 * 此代码应该在 root 页面优先调用 (优先于 config.js)
 */
appcan.ready(function () {
    appcan.xwin.clearLocStorageAndTempFiles();
    appcan.xwin.initLocStorage();

    if (appConfig.uex.uexiAppRevisionAndOffice && (uexWidgetOne.getPlatform() === 1)) {
        appcan.iApp.prepare(true);
    }
});
