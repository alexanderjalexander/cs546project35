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
export function calcDecimalPlaces(num) {
    if (Math.floor(num) !== num || !Number.isInteger(num)) {
        let splitnum = num.toString().split('.');
        return splitnum[1].length;
    } else {
        return 0;
    }
}
export function checkPrice(price, varName) {
    if (price === null || price === undefined) {
        throw `Error: Provided arg ${varName} doesn't exist`;
    }
    if (typeof price !== 'number') {
        throw `Error: Provided arg ${varName} is not a number. Must be a number >= 0.`;
    }
    if (price <= 0) throw `Error: Provided arg ${varName} must be > 0.`
    if (calcDecimalPlaces(price) > 2) {
        throw `Error: Provided arg ${varName} must be a price with <= 2 decimal places.`
    }
    return price;
}