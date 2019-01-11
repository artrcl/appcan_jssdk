"use strict";

var istore = {
    /**
     * set  保存值
     * @param key    {String}
     * @param value  {*}
     * @param keyN   {String}
     * @param valueN {*}
     */
    set: function (key, value, keyN, valueN) {
        try {
            if (window.localStorage) {
                if (value == null) {
                    window.localStorage.removeItem(key);
                } else {
                    if (Object.prototype.toString.call(value) !== '[object String]') {
                        value = JSON.stringify(value);
                    }
                    window.localStorage.setItem(key, value);
                }

                //////////////////////////
                for (var i = 2, len = arguments.length; i + 1 < len; i += 2) {
                    key = arguments[i];
                    value = arguments[i + 1];

                    if (value == null) {
                        window.localStorage.removeItem(key);
                    } else {
                        if (Object.prototype.toString.call(value) !== '[object String]') {
                            value = JSON.stringify(value);
                        }
                        window.localStorage.setItem(key, value);
                    }
                }
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

        try {
            if (window.localStorage) {
                if (key && (Object.prototype.toString.call(key) === '[object String]')) {
                    s = window.localStorage.getItem(key);
                }
            }
        } catch (e) {

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
     * @param keyN  {String}
     */
    remove: function (key, keyN) {
        try {
            if (window.localStorage) {
                if (key && (Object.prototype.toString.call(key) === '[object String]')) {
                    window.localStorage.removeItem(key);
                }

                //////////////////////////
                for (var i = 1, len = arguments.length; i < len; i++) {
                    key = arguments[i];

                    if (key && (Object.prototype.toString.call(key) === '[object String]')) {
                        window.localStorage.removeItem(key);
                    }
                }
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
            if (window.localStorage) {
                if (arguments.length === 0) {
                    window.localStorage.clear();
                } else {
                    for (var i = 0, len = window.localStorage.length; i < len; i++) {
                        var key = '';
                        key = window.localStorage.key(i);
                        if (key && !key.match(reg)) window.localStorage.removeItem(key);
                    }
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
