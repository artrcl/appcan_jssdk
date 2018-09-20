"use strict";

var iGDCA = appcan.iGDCA = {
    busId: "mIivcWVVIJvzVsqE", // 渠道码
    license: "j413lfzSz9KRk7NB7Ygz20DpmhahY10AiIIoJteeHpM0Svezdn69FPAsoP9SFR9K",

    init: function () {
        if (this._inited) return;
        this._inited = true;

        uexGDCA.init(this.busId, this.license);

        uexGDCA.onResult = function (type, result, msg) {
            var thiz = appcan.iGDCA;
            switch (type) {
                case 1:
                    break;
                case 2: /* bind */
                    if ($.type(thiz._bindCallback) === "function") {
                        if (result === 1 /* succeed */) {
                            thiz._bindCallback(true);
                        } else {
                            if ($.type(msg) === "object") {
                                msg = msg.status.statusMessage;
                            }
                            thiz._bindCallback(false, msg);
                        }
                    }
                    break;
                case 3: /* login */
                    if ($.type(thiz._loginCallback) === "function") {
                        if (result === 1 /* succeed */) {
                            var loginId = msg.id;
                            thiz._loginCallback(true, loginId);
                        } else {
                            if ($.type(msg) === "object") {
                                msg = msg.status.statusMessage;
                            }
                            thiz._loginCallback(false, msg);
                        }
                    }
                    break;
                default:
            }
        }
    }, _inited: false,

    _bindCallback: null,
    _loginCallback: null,

    /**
     * caBind
     * @param bindTaskUrl   {String}
     * @param token         {String}
     * @param callback      {function(result: Boolean, nsg: String)}
     */
    caBind: function (bindTaskUrl, token, callback) {
        this.init();
        if (!this._bindCallback && callback) this._bindCallback = callback;

        uexGDCA.requestBind(bindTaskUrl, token);
    },

    /**
     * caLogin
     * @param loginTaskUrl  {String}
     * @param callback      {function(result: Boolean, loginId: String)}
     */
    caLogin: function (loginTaskUrl, callback) {
        this.init();
        if (!this._loginCallback && callback) this._loginCallback = callback;

        uexGDCA.requestLogin(loginTaskUrl);
    }
};
