import { AnyFunction, AnyObject } from "./types";

function compareToString(v: unknown, str: string):boolean;
function compareToString<T>(v: unknown, str: string): v is T;
function compareToString(v: unknown, str: string) {
    return Object.prototype.toString.call(v) === str;
};

export const isNumber = (v: unknown): v is number => compareToString(v, '[object Number]');
export const isString = (v: unknown): v is string => compareToString(v, '[object String]');
export const isBoolean = (v: unknown): v is boolean => compareToString(v, '[object Boolean]');
export const isUndefined = (v: unknown): v is undefined => v === undefined;
export const isNull = (v: unknown): v is null => v === null;
export const isNaN = (v: unknown) => Number.isNaN(v);
export const isRegExp = (v: unknown): v is RegExp => compareToString(v, '[object RegExp]');

export const isArray = <T = any[]>(v: unknown): v is T => Array.isArray(v);
export const isFunction = (v: unknown): v is AnyFunction => compareToString(v, '[object Function]');
export const isPlainObject = (v: unknown): v is AnyObject => compareToString(v, '[object Object]');
export const isPromise = <T>(v: unknown): v is Promise<T> => compareToString(v, '[object Promise]');
export const isError = (v: unknown): v is Error => compareToString(v, '[object Error]');

export const isEmptyObject = (v: unknown) => {
    let p;
    if (!isPlainObject(v)){
        return false;
    }
    for (p in v) {
        // eslint-disable-next-line no-prototype-builtins
        if (v.hasOwnProperty(p)) {
            return false;
        }
    }
    return true;
}

export const isValidDate = (v: unknown): v is Date => {
    if (!compareToString<Date>(v, '[object Date]') || isNaN(v.getTime())) {
        return false;
    }
    return true;
}

export const isEmpty = (v: unknown): v is undefined | null => {
    return v === undefined || v === null;
}

export const isDefined = <V>(v: V): v is Exclude<V, undefined | null> => {
    return v !== undefined && v !== null;
}

export const isEmptyContent = (v: unknown): v is undefined | null | '' => {
    return v === undefined || v === null || v === '';
}

export const hasValue = (v: unknown) => {
    return v !== undefined && v !== null;
}

export const isValidDocID = (v: unknown) => {
    return /[a-z]{7}\d{7}/.test(v + '');
}

export const undef = undefined;


// demo
// type c = Extract<string, any[]>

// function isArray2<T>(v: T): v is Exclude<T, Exclude<T, any[]>> {
//     return Array.isArray(v);
// }
// type d = Exclude<{x: 1}, Exclude<{x: 1}, undefined | null | string | number | boolean | symbol>>;
// let a: string[] | number[] | string = '123';

// const str = '1'
// ;if (isArray2(a)) {
//     let a2 = a;
// }
