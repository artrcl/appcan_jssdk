"use strict";

var moduleCtrl = (function () {
    var modules = {value: []};

    function validatePerms() {
        var perms = istore.get("sys.perms", []);
        modules.value.forEach(function (m, i) {
            if (m.isShow && (perms.indexOf(m.name) < 0)) {
                m.isShow = false;
            }
        });
    }

    function validateHidden(loginName, setChecked) {
        var hiddens = istore.get("persist.modules.hide." + loginName, []);
        modules.value.forEach(function (m, i) {
            if (m.isShow && (hiddens.indexOf(m.name) >= 0)) {
                if (setChecked) m.notChecked = true;
                else m.isShow = false;
            }
        });
    }

    var funcList = {init: false};

    function initFuncList() {
        if (funcList.init === false) {
            delete funcList.init;
            modules.value.forEach(function (value, index) {
                if (value.getCountFunc) {
                    var ss = funcList[value.getCountFunc];
                    if (ss) {
                        if (value.isShow && !ss.visible) ss.visible = true;
                        ss.mi.push(index);
                        if (ss.funcMiIndex) ss.funcMiIndex.push(value.funcMiIndex || 0);
                        else if (value.funcMiIndex !== undefined) {
                            ss.funcMiIndex = [];
                            for (var i = 0, len = ss.mi.length; i < len - 1; i++) {
                                ss.funcMiIndex.push(i);
                            }
                            ss.funcMiIndex.push(value.funcMiIndex || 0);
                        }
                    } else {
                        ss = funcList[value.getCountFunc] = {visible: value.isShow, mi: [index]};
                        if (value.funcMiIndex !== undefined) ss.funcMiIndex = [value.funcMiIndex || 0];
                    }
                }
            });

            for (var key in funcList) {
                var ss = funcList[key];
                if (ss.visible && ss.funcMiIndex) {
                    var oldmi = ss.mi;
                    ss.mi = [];
                    for (var i = 0, len = oldmi.length; i < len; i++) {
                        ss.mi.push(oldmi[i]);
                    }
                    ss.funcMiIndex.forEach(function (value, index) {
                        ss.mi[value] = oldmi[index];
                    });
                    delete ss.funcMiIndex;
                }
            }
        }
    }

    function getCount() {
        initFuncList();
        for (var key in funcList) {
            if (funcList[key].visible) {
                try {
                    var func = eval(key);
                    func();
                } catch (e) {
                    appLog.error("run " + key + "(): " + e.toString());
                }
            }
        }
    }

    function moduleClick(thiz) {
        var i = eval($(thiz).attr("data-index"));
        var m = modules.value[i];
        xwin.open(m.wnd, m.url);
    }

    function moduleCheck(thiz) {
        thiz = $(thiz);
        var name = thiz.val();
        var checked = thiz.prop("checked");

        var hiddens = istore.get("persist.modules.hide." + xio.loginName, []);

        var i;
        if (checked) {
            i = hiddens.indexOf(name);
            if (i >= 0) hiddens.splice(i, 1);
        } else {
            i = hiddens.indexOf(name);
            if (i < 0) hiddens.push(name);
        }

        istore.set("persist.modules.hide." + xio.loginName, hiddens);
    }

    return {
        modules: modules,
        funcList: funcList,
        validatePerms: validatePerms,
        validateHidden: validateHidden,
        initFuncList: initFuncList,
        getCount: getCount,
        moduleClick: moduleClick,
        moduleCheck: moduleCheck
    }
})();
