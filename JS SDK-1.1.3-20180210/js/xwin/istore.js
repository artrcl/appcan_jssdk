"use strict";

var istore = {
    /**
     * set  保存值
     * @param key   {String}
     * @param value {*}
     */
    set: function (key, value) {
        try {
            if (window.localStorage) {
                if (Object.prototype.toString.call(value) !== '[object String]') {
                    value = JSON.stringify(value);
                }
                window.localStorage.setItem(key, value);
            } else {

            }
        } catch (e) {

        }

        return this;
    },

    /**
     * get  获取值
     * @param key   {String}
     * @param defaultValue {*=} optional
     * @return  {String}
     */
    get: function (key, defaultValue) {
        var s = null;
        if (key && (Object.prototype.toString.call(key) === '[object String]')) {
            try {
                if (window.localStorage) {
                    s = window.localStorage.getItem(key);
                }
            } catch (e) {

            }
        }

        if (arguments.length > 1) {
            if (s == null) return defaultValue;
            try {
                if (Object.prototype.toString.call(defaultValue) !== '[object String]') return JSON.parse(s);
            } catch (e) {

            }
        }

        return s;
    },

    /**
     * remove 删除键值
     * @param key   {String}
     */
    remove: function (key) {
        try {
            if (window.localStorage && key && (Object.prototype.toString.call(key) === '[object String]')) {
                window.localStorage.removeItem(key);
            }
        } catch (e) {

        }

        return this;
    },

    /**
     * clear 清除所有的key
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
     * keepAndClear 清除key, 但保留符合 正则表达式 reg 的key
     * @param reg   {regexp}
     */
    keepAndClear: function (reg) {
        try {
            if (window.localStorage && arguments.length >= 1) {
                var keys = this.keys();
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];
                    if (!key.match(reg)) window.localStorage.removeItem(key);
                }
            }
        } catch (e) {
        }

        return this;
    },

    /**
     * keys     获取所有的key
     * @return {Array}
     */
    keys: function () {
        var result = [];
        try {
            if (window.localStorage) {
                for (var i = 0, len = window.localStorage.length; i < len; i++) {
                    var key = '';
                    key = window.localStorage.key(i);
                    if (key) {
                        result.push(key);
                    }
                }
            }
        } catch (e) {
        }

        return result;
    }
};
