import { CSSProperties } from "react";

export type AnyObject = { [k in string | number | symbol]: any };
export type AnyFunction = (...args: any[]) => any;
export type NoResultFunction = (...args: any[]) => void;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export interface CSSAttrs {
    style?: CSSProperties;
    className?: string;
}
export type LoadStatus = 'beforeload' | 'loading' | 'loaded' | 'error' | 'needLogin';
export interface LoadInfo {
    loadStatus: LoadStatus;
    loadMsg?: string | JSX.Element;
}

export interface LoadInfo2 {
    status: LoadStatus;
    msg?: string | JSX.Element;
}
export const tuple = <T extends string[]>(...args: T) => args;
export const required = <T>(p: T) => p as {
    [P in keyof T]-?: T[P];
};
export type DefaultValue<T, K extends keyof T = keyof T> = {
    [P in K]-?: T[P];
};

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }

export type XOR<T, U> = (T | U) extends object
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : T | U

export type DynamicImport = (...args: any) => Promise<any>;

export type UnionToIntersection<U> = 
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never;

export type ObjectKey = string | number | symbol;

export type ValueOf<T> = T[keyof T];

export type KeyofStr<T> = Extract<keyof T, string>;

export type ExtractStrKey<Keys> = Extract<Keys, string>;

export type FuncName<T> = {
    [k in keyof T]: T[k] extends Function ? k : never;
}[keyof T];

export type StrFuncName<T> = Extract<FuncName<T>, string>;

export const anyArr = [] as any;