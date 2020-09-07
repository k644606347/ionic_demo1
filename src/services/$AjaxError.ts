import { isError, isPlainObject } from "../utils/Is";
import { hasOwnProperty } from "../utils/Tools";

type jqXHR<R> = JQuery.jqXHR<R>;
type ErrorStatus = JQuery.Ajax.ErrorTextStatus;

type $AjaxErrorType<R> = {
    $xhr: jqXHR<R>;
    textStatus: JQuery.Ajax.ErrorTextStatus;
    errorThrown: any;
} & Error;

const make$XHRError = <XHRResult = unknown>(error: Error | string, $xhr: jqXHR<XHRResult>, textStatus: ErrorStatus, errorThrown: string) => {
    let rawError: Error;

    if (isError(error)) {
        rawError = error;
    } else {
        rawError = new Error(error + '');
    }

    let $ajaxError = rawError as $AjaxErrorType<XHRResult>;

    $ajaxError.$xhr = $xhr;
    $ajaxError.textStatus = textStatus;
    $ajaxError.errorThrown = errorThrown;

    return $ajaxError;
}

function isAjaxError<R>(target: unknown): target is $AjaxErrorType<R> {
    return isError(target) && hasOwnProperty(target, '$xhr');
}

export { make$XHRError, isAjaxError };