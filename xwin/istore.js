"use strict";

var istore = {
    /**
     * 保存值
     * @param   {String}    key
     * @param   {*}         value
     */
    set: function (key, value) {
        try {
            if (window.localStorage) {
                if (Object.prototype.toString.call(value) !== '[object String]') value = JSON.stringify(value);
                window.localStorage.setItem(key, value);
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

                if (arguments.length > 1) {
                    if (s == null) return defaultValue;
                    try {
                        if (Object.prototype.toString.call(defaultValue) !== '[object String]') return JSON.parse(s);
                    } catch (e) {
                    }
                }

                return s;
            }
        } catch (e) {
        }

        return null;
    },

    /**
     * 删除键值
     * @param   {String}    key
     */
    remove: function (key) {
        try {
            if (window.localStorage) {
                window.localStorage.removeItem(key);
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
     * @param   {RegExp}    reg
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
