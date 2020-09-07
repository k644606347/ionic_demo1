import { isFunction } from "./Is";

export type CancelFn = () => void;

export const isCancelablePromise = <T>(target: any): target is CancelablePromise<T> => {
    if (target && isFunction(target.classID) && target.classID() === classID) {
        return true;
    }

    return false;
}

const classID = '__comos_CancelablePromise';
export default class CancelablePromise<T> implements PromiseLike<T> {
    private _isCancelled = false;
    private _isPending = true;
    private promise: Promise<T>;
    private cancelFn: CancelFn | void = () => {};

    static resolve(): CancelablePromise<void>;
    static resolve<T>(value: T | PromiseLike<T>): CancelablePromise<T>;
    static resolve<T>(value?: T): CancelablePromise<T | void> {
        return new CancelablePromise(resolve => resolve(value));
    }

    static reject<T = never>(reason?: any): CancelablePromise<T> {
        return new CancelablePromise((resolve, reject) => reject(reason));
    }

    static all<T>(values: Array<T | PromiseLike<T>>): CancelablePromise<T[]>;
    static all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): CancelablePromise<[T1, T2]>;
    static all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): CancelablePromise<[T1, T2, T3]>;
    static all<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): CancelablePromise<[T1, T2, T3, T4]>;
    static all(values: Array<any | PromiseLike<any>>): CancelablePromise<any[]> {
        return new CancelablePromise((resolve, reject) => {
            Promise.all(values).then(resolve, reject);
            return () => values.forEach(value => {
                if (isCancelablePromise(value)) {
                    value.cancel();
                }
            });
        });
    }

    static race<T>(values: T[]): CancelablePromise<T extends PromiseLike<infer U> ? U : T> {
        return new CancelablePromise((resolve, reject) => {
            Promise.race(values).then(resolve as any, reject); // TODO resolve报错，暂时用any绕过
            return () => values.forEach(value => {
                if (isCancelablePromise(value)) {
                    value.cancel();
                }
            });
        });
    }

    // TODO: calling resolve with no value should result in CancelablePromise<void>
    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => CancelFn | void) {
        this.promise = new Promise((resolve, reject) => {
            const onResolve = (value?: T | PromiseLike<T>) => {
                this._isPending = false;
                resolve(value);
            };
            const onReject = (reason?: any) => {
                this._isPending = false;
                reject(reason);
            };
            this.cancelFn = executor(onResolve, onReject);
        });
    }

    cancel() {
        // console.log(this);
        if (!this._isPending || this._isCancelled) {
            return;
        }
        this._isCancelled = true;
        this._isPending = false;
        this.cancelFn && this.cancelFn();
    }

    isCanceled() {
        return this._isCancelled;
    }

    isPending() {
        return this._isPending;
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined): CancelablePromise<TResult1 | TResult2> {
        return new CancelablePromise((resolve, reject) => {
            this.promise.then(
                result => {
                    if (this._isCancelled) {
                        return;
                    }

                    let callbackResult = isFunction(onfulfilled) ? onfulfilled(result) : result;
                    resolve(callbackResult as any); // TODO: 此处暂时使用any防止报错
                },
                err => {
                    // if (this.isCancelled) { // TODO: 取消后是否该拦截错误？
                    //     return;
                    // }
                    if (!isFunction(onrejected)) {
                        reject(err);
                        return;
                    }

                    try {
                        let callbackResult = onrejected(err);
                        resolve(callbackResult);
                    } catch (err) {
                        reject(err);
                    }
                }
            ).catch(reject); // 追加的catch用于传递onfulfilled、onrejected执行时抛出的异常

            return () => this.cancel();
        });
    }

    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined): CancelablePromise<T | TResult> {
        return this.then(undefined, onrejected);
    }

    classID() {
        return classID;
    }
}

export function makeCancelable<T>(promise: PromiseLike<T>): CancelablePromise<T> {
    
    return new CancelablePromise<T>(
            (resolve, reject) => {
            promise.then(resolve, reject);
        });
};

export function cancel(promise: unknown) {
    isCancelablePromise(promise) && promise.cancel();
}

// test
// let p1 = CancelablePromise.resolve();
// let p2 = CancelablePromise.resolve('p2');
// let p3 = CancelablePromise.resolve(CancelablePromise.resolve(new Date()));

// let p4 = Promise.resolve();
// let p5 = Promise.resolve('p2');
// let p6 = Promise.resolve(Promise.resolve(new Date()));

// let p7 = CancelablePromise.reject();
// let p8 = CancelablePromise.reject('p2');
// let p9 = CancelablePromise.reject(CancelablePromise.resolve(new Date()));

// let p10 = Promise.reject();
// let p11 = Promise.reject('p2');
// let p12 = Promise.reject(Promise.resolve(new Date()));

// CancelablePromise.all([
//     Promise.resolve(CancelablePromise),
//     Promise.resolve(456),
//     Promise.reject(new Error('fff'))
// ]).then(data => {

// });

// Promise.all([
//     Promise.resolve(CancelablePromise),
//     Promise.resolve(456),
//     Promise.reject(new Error('fff'))
// ]).then(data => {

// })

// CancelablePromise.race([
//     CancelablePromise.resolve('e34'),
//     CancelablePromise.reject(new Error('ddd'))
// ]).then(d => {

// }).catch(err => {
//     return err;
// });

// Promise.race([
//     Promise.resolve('e34'),
//     Promise.reject(new Error('ddd'))
// ]).then(d => {
//     throw new Error('123');
// }).catch(err => {
//     return err;
// })

// new Promise((rel, rej) => {
//     // rel('reject');
//     rej('resolve');
// }).then((data) => {
//     return new Error('xxx');
// }).catch(err => {
//     //
// })


// new CancelablePromise((rel, rej) => {
//     // rej('reject');
//     // rel('resolve');
//     rej({ isValid: false, message: 'rejected', level: 'error' });
// }).then((data) => {
//     return data;
// })
// .then(data => {
//     throw new Error('abc');
// })
// .catch(err => {
//     console.error(err + '');
// });
// // test2
// let p1 = CancelablePromise.reject({x:1})
//     .then(data => {
//         throw new Error('xxx');
//     }, (err) => {
//         console.log(err);

//     })
//     .catch(err => {
//         return {x: 2};
//     })
//     .then(data => {
//         return data.x;
//     }, (err) => {
//         return new Error('catch');
// });
// let p2 = p1.then(x => {
//     return x;
// });
// let p3 = new Promise<{x:1}>((resolve, reject) => {

// });

// let cp1 = CancelablePromise.resolve({y: 2}).then(data => {
//     return data.y;
// });
// let cp2 = cp1.then(y => {
//     return y;
// });
// let cp3 = new CancelablePromise<{x:1}>((resolve, reject) => {

// });
// cp2.then().then(val => {
//     return val;
// });

// new Promise((rel, rej) => {
//     rel('resolve');
// //     rej('reject');
// }).then((data) => {
//     throw new Error('error in then fn');
// }, () => {
//     console.log('then.onrejected');
// }).catch(err => {
//     throw Error(err);
// }).then((result) => { console.log('catch to then', result)}, (err) => { console.log('catch to catch', err, typeof err) })


// new Promise((rel, rej) => {
//     rel('resolve');
// //     rej('reject');
// })
//     .then(
//         (data) => {
//         // throw new Error('error in then fn');
//             return Promise.reject('rejected');
//         }, 
//         (err) => {
//             console.log('then.onrejected');
//         })
//     .catch(err => { 
//         console.log('then return rejected promise', err); 
//     });

// new Promise((rel, rej) => {
//     rel('resolve');
// //     rej('reject');
// })
//     .then(
//         (data) => {
//         // throw new Error('error in then fn');
//             return new Promise((rel, rej) => { 
// // setTimeout(rel, 5000, 'return promise resolve') });
// setTimeout(rej, 5000, 'return promise reject') })
//         }, 
//         (err) => {
//             console.log('then 2 param')
//         }).catch(err => { console.log('then return rejected promise', err); }).then(result => { console.log('result', result) })

// new CancelablePromise((rel, rej) => {
//     rel('resolve');
// //     rej('reject');
// })
//     .then(
//         (data) => {
//         // throw new Error('error in then fn');
//             return new CancelablePromise((rel, rej) => { 
//                 setTimeout(rel, 5000, 'return promise resolve') 
//             })
//             .then((result) => {
//                 return CancelablePromise.reject(result);
//                 // return Promise.reject(result);
//             });
// // setTimeout(rej, 5000, 'return promise reject') })
//         }, 
//         (err) => {
//             console.log('then 2 param')
//         }).catch(err => { console.log('then return rejected CancelablePromise = ', err); }).then(result => { console.log('result = ', result) })