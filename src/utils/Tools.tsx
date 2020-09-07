import { AnyObject, ObjectKey } from "./types";

export function hasOwnProperty(obj: AnyObject, prop: ObjectKey) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}