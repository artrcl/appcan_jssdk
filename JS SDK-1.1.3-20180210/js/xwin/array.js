"use strict";

/**
 * unique 去重复
 * @return {*[]}
 */
Array.prototype.unique = function () {
    return this.filter(function (element, index, array) {
        return array.indexOf(element) === index;
    });
};

/**
 * intersect 交集
 * @param arr  {[]...}
 * @return {*[]}
 */
Array.prototype.intersect = function (arr) {
    var result = this.unique();

    for (var i = 0; i < arguments.length; i++) {
        arr = arguments[i];
        result = result.filter(function (v) {
            return arr.indexOf(v) >= 0
        })
    }

    return result;
};

/**
 * union 并集
 * @param arr  {[]...}
 * @return {*[]}
 */
Array.prototype.union = function (arr) {
    var result = this.unique();

    for (var i = 0; i < arguments.length; i++) {
        arr = arguments[i];
        result = result.concat(arr.filter(function (v) {
            return result.indexOf(v) === -1
        }));
    }

    return result;
};

/**
 * minus 差集
 * @param arr  {[]...}
 * @return {*[]}
 */
Array.prototype.minus = function (arr) {
    var result = this.unique();

    for (var i = 0; i < arguments.length; i++) {
        arr = arguments[i];
        result = result.filter(function (v) {
            return arr.indexOf(v) === -1
        });
    }

    return result;
};
