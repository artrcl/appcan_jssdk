"use strict";

var istore = {
    /**
     * 保存值
     * @param   {String}    key
     * @param   {*}         value
     * @param   {String...} keyN
     * @param   {*...}      valueN
     */
    set: function (key, value, keyN, valueN) {
        try {
            if (window.localStorage) {
                window.localStorage.setItem(key, JSON.stringify(value));

                //////////////////////////
                for (var i = 2, len = arguments.length; i + 1 < len; i += 2) {
                    window.localStorage.setItem(arguments[i], JSON.stringify(arguments[i + 1]));
                }
            }
        } catch (e) {
        }

        return this;
    },

    /**
     * 获取值
     * @param   {String}    key
     * @param   {*=}        defaultValue
     * @return  {*}
     */
    get: function (key, defaultValue) {
        try {
            if (window.localStorage) {
                var s = window.localStorage.getItem(key);
                if (arguments.length > 1 && s == null) return defaultValue;
                return JSON.parse(s);
            }
        } catch (e) {
        }

        return null;
    },

    /**
     * 删除键值
     * @param   {String}    key
     * @param   {String...} keyN
     */
    remove: function (key, keyN) {
        try {
            if (window.localStorage) {
                window.localStorage.removeItem(key);

                //////////////////////////
                for (var i = 1, len = arguments.length; i < len; i++) {
                    window.localStorage.removeItem(arguments[i]);
                }
            }
        } catch (e) {
        }

        return this;
    },

    /**
     * 清除所有的key
     */
    clear: function () {
        try {
            if (window.localStorage) {
                window.localStorage.clear();
            }
        } catch (e) {
        }

        return this;
    },

    /**
     * 清除key, 但保留符合 正则表达式 reg 的key
     * @param   {regexp}    reg
     */
    keepAndClear: function (reg) {
        try {
            if (window.localStorage) {
                if (arguments.length === 0) {
                    window.localStorage.clear();
                } else {
                    for (var i = 0, len = window.localStorage.length; i < len; i++) {
                        var key = window.localStorage.key(i);
                        if (!key.match(reg)) window.localStorage.removeItem(key);
                    }
                }
            }
        } catch (e) {
        }

        return this;
    },

    /**
     * 获取所有的key
     * @return  {Array}
     */
    keys: function () {
        var result = [];
        try {
            if (window.localStorage) {
                for (var i = 0, len = window.localStorage.length; i < len; i++) {
                    var key = window.localStorage.key(i);
                    result.push(key);
                }
            }
        } catch (e) {
        }

        return result;
    }
};
