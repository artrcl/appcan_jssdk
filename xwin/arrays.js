"use strict";

var arrays = (function () {

    /**
     * 去重复
     * @param {Array}   arr
     * @return {Array}
     */
    function unique(arr) {
        return arr.filter(function (element, index, array) {
            return array.indexOf(element) === index;
        });
    }

    /**
     * 交集
     * @param {Array}       arr
     * @param {Array...}    another
     * @return {Array}
     */
    function intersect(arr, another) {
        var result = arr.unique();

        for (var i = 0; i < arguments.length; i++) {
            another = arguments[i];
            result = result.filter(function (v) {
                return another.indexOf(v) >= 0
            })
        }

        return result;
    }

    /**
     * 并集
     * @param {Array}       arr
     * @param {Array...}    another
     * @return {Array}
     */
    function union(arr, another) {
        var result = arr.unique();

        for (var i = 0; i < arguments.length; i++) {
            another = arguments[i];
            result = result.concat(another.filter(function (v) {
                return result.indexOf(v) === -1
            }));
        }

        return result;
    }

    /**
     * 差集
     * @param {Array}       arr
     * @param {Array...}    another
     * @return {Array}
     */
    function minus(arr, another) {
        var result = arr.unique();

        for (var i = 0; i < arguments.length; i++) {
            another = arguments[i];
            result = result.filter(function (v) {
                return another.indexOf(v) === -1
            });
        }

        return result;
    }

    return {
        unique: unique,
        intersect: intersect,
        union: union,
        minus: minus
    }
})();
