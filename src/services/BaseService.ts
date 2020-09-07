import { make$XHRError } from './$AjaxError';
import CancelablePromise from '../utils/CancelablePromise';
import $ from 'jquery';

export type JSONResponse<Data = unknown> = {
    msg: string;
    status: number;
    data: Data;
}

export const jsonResStatusMap = {
    done: 0,
    fail: 1
};

export function request<Res = unknown>(options: JQuery.AjaxSettings) {
    let $xhr: JQuery.jqXHR<Res> = $.ajax(options);

    let promise = new CancelablePromise<Res>((resolve, reject) => {
        $xhr.done(resolve).fail(($xhr, textStatus, errorThrown) => {
            let { status, responseText } = $xhr,
                errorMsg = '';

            switch (textStatus) {
                case 'abort':
                    errorMsg = '请求已中断'; break;
                case 'timeout':
                    errorMsg = '请求超时'; break;
                default :
                    errorMsg = '请检查网络及请求状态是否正常';
            }

            let error = make$XHRError(
                [
                    textStatus, errorMsg,
                    `${status ? `http-status: ${status}` : ''} ${errorThrown}`, 
                    responseText && `response:`,
                    responseText
                ].filter(n => n).join('\n'),
                $xhr, textStatus, errorThrown
            );

            // console.log(error);
            reject(error);
        });

        return () => {
            $xhr && $xhr.abort();
        }
    });

    return promise;
}

export function requestJSON<Data, Res = JSONResponse<Data>>
    (url: string, options?: JQuery.AjaxSettings) {
    return request<Res>({
        ...options,
        url,
        dataType: 'json',
    });
}