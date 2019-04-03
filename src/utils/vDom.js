import { isFunction } from 'lodash';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
}

/* eslint-disable import/prefer-default-export, no-unused-vars */
export const delegate = function(dom, properties) {
    properties.forEach(p => {
        if (!hasOwn(dom, p)) return;
        if (!dom[p]) return;
        if (this[p]) return;
        if (isFunction(dom[p])) {
            this[p] = function(...arg) {
                dom[p](...arg);
            };
        } else {
            this[p] = dom[p];
        }
    });
};
