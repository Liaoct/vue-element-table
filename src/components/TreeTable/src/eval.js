'use strict';
import Vue from 'vue';

export default function treeToArray(
    data,
    { expandAll, parent = null, family = [], children, identifier } = {}
) {
    let tmp = [];
    Array.from(data).forEach(function(record) {
        if (record._expanded === undefined) {
            Vue.set(record, '_expanded', expandAll);
        }
        let path = `${record[identifier]}`;
        let curFamily = [...family, record];
        Vue.set(record, '_family', curFamily);
        // 如果有父元素
        if (parent) {
            Vue.set(record, '_parent', parent);
            path = `${parent._path}-${path}`;
        }
        Vue.set(record, '_path', path);
        tmp.push(record);
        if (record[children] && record[children].length > 0) {
            const child = treeToArray(record[children], {
                expandAll,
                parent: record,
                children,
                identifier,
                family: curFamily
            });
            tmp = tmp.concat(child);
        }
    });
    return tmp;
}
