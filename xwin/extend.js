"use strict";

/**
 * @preserve
 * @author: lsd
 * @email: lai3122@qq.com
 * @description: 扩展常用的函数
 * @created: 2018.3.26
 * @update: 2018.3.26
 */

/**@preserve
 * 返回结果的 code
 */
var Result = {
    SUCCEED: 1,     // 成功
    FAILED: 2,      // 失败
    TIMEOUT: 100,   // 空闲超时
    PENDING: 101    // 结果待定
};

/**@preserve
 * 获取文件的全文件名 fileName.fileExt
 * @return {string}
 */
String.prototype.fullFileName = function () {
    var i = this.lastIndexOf("/");
    if (i >= 0) return this.substring(i + 1);
    else return this;
};

/**@preserve
 * 获取文件的文件名，不包括扩展名部分 fileName
 * @return {string}
 */
String.prototype.fileName = function () {
    var i = this.lastIndexOf("/");
    var s;
    if (i >= 0) s = this.substring(i + 1);
    else s = this;

    i = s.lastIndexOf(".");
    if (i >= 0) return s.substring(0, i);
    return s;
};

/**@preserve
 * 获取文件的扩展名，包括小数点 .fileExt
 * @return {string}
 */
String.prototype.fileExt = function () {
    var i = this.lastIndexOf("/");
    var s;
    if (i >= 0) s = this.substring(i + 1);
    else s = this;

    i = s.lastIndexOf(".");
    if (i >= 0) return s.substring(i);
    return "";
};

/**@preserve
 * 分析 url，得到其 path, fullName, name, ext, 其中 ext 包括小数点
 * @param   {String}    url
 * @param   {int=}      part    - 需要得到哪个部分: 0=path, 1=fullName 2=name 3=ext 其它=object of {path, fullName, name, ext}
 * @return {String|object<path, fullName, name, ext>}
 */
function parseFilePart(url, part) {
    var path, fullName, name, ext;
    var i = url.lastIndexOf("/");
    if (i >= 0) {
        path = url.substring(0, i + 1);
        fullName = url.substring(i + 1);
    } else {
        path = "";
        fullName = url;
    }

    if (part === 0) return path;
    if (part === 1) return fullName;

    i = fullName.lastIndexOf(".");
    if (i >= 0) {
        name = fullName.substring(0, i);
        ext = fullName.substring(i);
    } else {
        name = fullName;
        ext = "";
    }

    if (part === 2) return name;
    if (part === 3) return ext;

    return {path: path, fullName: fullName, name: name, ext: ext};
}

/**@preserve
 * 判断是否是已其中一个指定的其中一个值
 * @param   {String...|array}   value
 * @return  {boolean}
 * 可以任意个参数，只要字符串与任意一个相等，就返回 true
 * value 可以是字符串数组，是数组时，只判断这个数组里的元素，并忽略其它参数
 */
String.prototype.isValueOf = function (value) {
    if (Object.prototype.toString.call(value) !== '[object Array]') value = Array.prototype.slice.apply(arguments);

    for (var i = 0, len = value.length; i < len; i++) {
        if (this.valueOf() === value[i]) return true;
    }
    return false;
};

/**@preserve
 * 判断是否是已其中一个指定的后缀结尾
 * @param   {String...|array}   suffix
 * @return  {boolean}
 * 可以任意个参数，只要字符串已任意一个结尾，就返回 true
 * suffix 可以是字符串数组，是数组时，只判断这个数组里的元素，并忽略其它参数
 */
String.prototype.endsWith = function (suffix) {
    if (Object.prototype.toString.call(suffix) !== '[object Array]') suffix = Array.prototype.slice.apply(arguments);

    for (var i = 0, len = suffix.length; i < len; i++) {
        if (this.length >= suffix[i].length && this.indexOf(suffix[i], this.length - suffix[i].length) >= 0) return true;
    }
    return false;
};

/**@preserve
 * 判断是否是图形文件
 * @return  {boolean}
 */
String.prototype.isImageFile = function () {
    return this.toLowerCase().endsWith([".bmp", ".png", ".jpg", ".jpeg", ".gif"]);
};

/**@preserve
 * 判断是否是 Wps 可查看的文件
 * @return  {boolean}
 */
String.prototype.isWpsFile = function () {
    return this.toLowerCase().endsWith([
        ".ppt", ".pot", ".pps", ".dps", ".dpss", ".dpt",
        ".pptx", ".potx", ".ppsx", ".pptm", ".potm", ".ppsm",
        ".doc", ".dot", ".wps", ".wpss", ".wpt", ".docx", ".dotx", ".docm", ".dotm",
        ".xls", ".xlt", ".et", ".ets", ".ett", ".xlsx", ".xltx", ".xlsb", ".xlsm", ".xltm",
        ".csv", ".rtf", ".txt", ".pdf"
    ]);
};

/**@preserve
 * 判断是否是 Tif 文件
 * @return  {boolean}
 */
String.prototype.isTifFile = function () {
    return this.toLowerCase().endsWith([".tif", ".tiff"]);
};

/**@preserve
 * 判断是否是指定类型的文件
 * @param suffix    {String...|array}
 * @return          {boolean}
 */
String.prototype.isFileType = function (suffix) {
    if (Object.prototype.toString.call(suffix) !== '[object Array]') suffix = Array.prototype.slice.apply(arguments);

    var value = this.toLowerCase();
    for (var i = 0, len = suffix.length; i < len; i++) {
        var s = suffix[i].toLowerCase();
        if (value.length >= s.length && value.indexOf(s, value.length - s.length) >= 0) return true;
    }
    return false;
};

/**@preserve
 * 根据值匹配返回结果
 * @param   {*}     value
 * @param   {*...}  valueN
 * @param   {*...}  returnN
 * @param   {*}     defaultValue
 * @return  {*}
 * ifThen 可任意个参数
 * 如果 value 等于
 *      value1 返回 return1
 *      value2 返回 return2
 *      ...
 *      valueN 返回 returnN
 * 上述都不相等，返回 defaultValue
 * 不存在defaultValue，返回空字符串
 */
function ifThen(value, valueN, returnN, defaultValue) {
    var len = arguments.length;
    var i = 1;
    for (i = 1; i + 1 < len; i += 2) {
        if (value === arguments[i]) return arguments[i + 1];
    }
    if (i < len) return arguments[i];
    return "";
}

/**@preserve
 * 返回组合的数值
 * @param   {String|Array}  title
 * @param   {Object}        value
 * @returns {String}
 */
function conjunct(title, value) {
    if (typeof title === "string") title = [title, ""];
    else if (title.length === 1) title.push("");
    if (value) return title[0] + value;
    else return title[1];
}

/**@preserve
 * 显示数量，大于99显示...
 * @param   {Integer}   value
 * @returns {String}
 */
function shortenNumber(value) {
    value = eval(value);
    if (value > 99) return '...';
    if (value > 0) return '' + value;
    return '';
}
