import {ObjectId} from 'mongodb';

export function checkString(str, name) {
    if (typeof str !== 'string') throw `${name} must be a string`;
    if (str.trim().length === 0)
        throw `${name} cannot be an empty string or just spaces`;
    str = str.trim();
    return str;
}
export function checkIdString(id) {
    id = checkString(id, 'id')
    if (!ObjectId.isValid(id)) throw 'invalid object ID';
    return id;
}