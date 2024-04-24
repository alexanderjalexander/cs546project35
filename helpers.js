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

//helpers for reviews

export function makeRate(rating, reviewerName) {
    if (rating === null || rating === undefined) {
        throw `Error: No rating provided for '${reviewerName}'`;
    }
    if (typeof rating !== 'number') {
        throw `Error: Rating for '${reviewerName}' must be a number`;
    }
    if (!Number.isInteger(rating)) {
        throw `Error: Rating for '${reviewerName}' must be an integer`;
    }
    if (rating < 1 || rating > 5) {
        throw `Error: Rating for '${reviewerName}' must be between 1 and 5`;
    }
    return `Rating for ${reviewerName} is ${rating}`;
}

export const checkName = (name) => {
    name = checkString(name, 'name')
    if (name.length < 2 || name.length > 25) {
        throw 'Error: name must be >= 2 and <= 25 characters in length.'
    }
    if (/\d/.test(name)) {
        throw `Error: name cannot contain numbers.`
    }
    return name;
}

export const checkUsername = (username) => {
    username = checkString(username, 'username');
    username = username.toLowerCase();
    if (username.length < 5 || username.length > 20) {
        throw 'Error: username must be >= 5 and <= 20 characters in length.'
    }
    if (/\d/.test(username)) {
        throw `Error: username cannot contain numbers.`
    }
    return username;
}

export const checkPassword = (password) => {
    password = checkString(password, 'password');
    if (/\s/.test(password)) {
        throw `Error: password cannot contain spaces or whitespace characters.`
    }
    if (password.length < 8) {
        throw `Error: password must contain at least 8 characters.`
    }
    if (!(/[A-Z]/).test(password)) {
        throw `Error: password must contain at least one uppercase letter.`
    }
    if (!(/[0-9]/).test(password)) {
        throw `Error: password must contain at least one number.`
    }
    if (!(/[^a-zA-Z0-9]/).test(password)) {
        throw `Error: password must contain at least one special character.`
    }
    return password;
}

export const checkTheme = (theme) => {
    if (!theme) {
        throw `Error: You must supply a theme!`;
    }
    if (typeof theme !== 'string') {
        throw `Error: username must be a string!`;
    }
    theme = theme.toLowerCase();
    if (theme !== 'light' && theme !== 'dark') {
        throw 'Error: theme is invalid. Must be either \'light\' or \'dark\'.'
    }
    return theme;
}
