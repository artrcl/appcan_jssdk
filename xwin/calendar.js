"use strict";

var calendar = (function () {

    /**
     * 得到 t1, t2 的交集时间
     * @param   {{start, end}}  t1  - 时间点1
     * @param   {{start, end}}  t2  - 时间点2
     * @return  {{start, end, weekDay}}
     */
    function intersect(t1, t2) {
        var t = {start: 0, end: 0, weekDay: 0};

        t.start = Math.max(t1.start, t2.start);
        t.end = Math.min(t1.end, t2.end);
        if (t.end <= t.start) return null;

        t.weekDay = new Date(t.start).getDay();

        // console.log(new Date(t.start));
        // console.log(new Date(t.end));
        // console.log(t.weekDay);

        return t;
    }

    /**
     * 得到 t2 在参考时间 reft 所在周的所有交集时间
     * @param   {Number}        reft    - 参考时间，距离 1970-1-1 零时 毫秒数, 代表所在周（week）
     * @param   {{start, end}}  t2      - 时间点
     * @return  {Array}
     */
    function intersects(reft, t2) {
        var d = new Date(reft);
        d.setHours(0, 0, 0, 0);
        d = new Date(d.getTime() - d.getDay() * 24 * 3600 * 1000); // 星期日零时

        var t1 = {start: 0, end: 0};
        t1.start = d.getTime();

        var result = [];

        var found = false;
        for (var i = 0; i < 7; i++) {
            t1.end = t1.start + 24 * 3600 * 1000;
            var t = intersect(t1, t2);
            if (t) {
                found = true;
                result.push(t);
            } else if (found) {
                break;
            }
            t1.start = t1.end;
        }

        return result;
    }

    /**
     * 输出时间字符串 HH:mm
     * @param   {Number}    t   - 时间点
     * @param   {boolean}   h24 - 00:00 是否显示为 24:00
     * @return  {String}
     */
    function formatTime(t, h24) {
        var s = cxDate('HH:mm', t);
        if (h24 && (s === "00:00")) s = "24:00";
        return s;
    }

    return {
        intersects: intersects,
        formatTime: formatTime
    }
})();
