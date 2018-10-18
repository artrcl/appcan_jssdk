"use strict";

// This file should be loaded before config.js
appcan.ready(function () {
    appcan.xwin.initLocStorage();

    if (appConfig.uex.uexiAppRevisionAndOffice && appcan.xwin.isAndroid()) {
        appcan.iApp.prepare(true);
    }
});
