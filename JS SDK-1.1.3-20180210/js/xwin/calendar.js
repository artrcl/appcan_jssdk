"use strict";

var calendar = {

    /**
     * _intersect    得到 t1, t2 的交集时间
     * @param t1    {{start, end}}
     * @param t2    {{start, end}}
     * @return      {{start, end, weekDay}}
     */
    _intersect: function (t1, t2) {
        var t = {start: 0, end: 0, weekDay: 0};

        t.start = Math.max(t1.start, t2.start);
        t.end = Math.min(t1.end, t2.end);
        if (t.end <= t.start) return null;

        t.weekDay = new Date(t.start).getDay();

        // console.log(new Date(t.start));
        // console.log(new Date(t.end));
        // console.log(t.weekDay);

        return t;
    },

    /**
     * intersects        得到 t2 在 reft 所在周的所有交集时间
     * @param reft      {Number} 距离 1970-1-1 零时 毫秒数, 代表所在周（week）
     * @param t2        {{start, end}}
     * @return          {Array}
     */
    intersects: function (reft, t2) {
        var d = new Date(reft);
        d.setHours(0, 0, 0, 0);
        d = new Date(d.getTime() - d.getDay() * 24 * 3600 * 1000); // 星期日零时

        var t1 = {start: 0, end: 0};
        t1.start = d.getTime();

        var result = [];

        var found = false;
        for (var i = 0; i < 7; i++) {
            t1.end = t1.start + 24 * 3600 * 1000;
            var t = this._intersect(t1, t2);
            if (t) {
                found = true;
                result.push(t);
            } else if (found) {
                break;
            }
            t1.start = t1.end;
        }

        return result;
    },

    /**
     * 输出时间字符串 HH:mm
     * @param t     {Number}
     * @param h24   {boolean}  00:00 是否显示为 24:00
     * @return      {String}
     */
    formatTime: function (t, h24) {
        var s = cxDate('HH:mm', t);
        if (h24 && (s === "00:00")) s = "24:00";
        return s;
    }
};
