import {ObjectId} from 'mongodb';

/**
 * Checks if a string exists and is a valid string(not just empty spaces).
 * @param {string} str 
 * @param {string} name 
 * @returns trimmed string, if valid.
 */
export function checkString(str, name) {
    if (typeof str !== 'string') throw `${name} must be a string`;
    if (str.trim().length === 0)
        throw `${name} cannot be an empty string or just spaces`;
    str = str.trim();
    return str;
}

/**
 * Checks if a given ObjectId as a string is valid.
 * @param {string} id An ObjectId represented as a string
 * @returns a thrown error or a valid objectId depending on input.
 */
export function checkIdString(id) {
    id = checkString(id, 'id')
    if (!ObjectId.isValid(id)) throw 'invalid object ID';
    return id;
}

/**
 * Calculates amt of decimal places a number has.
 * @param {number} num 
 * @returns # of decimal places as an integer.
 */
export function calcDecimalPlaces(num) {
    if (Math.floor(num) !== num || !Number.isInteger(num)) {
        let splitnum = num.toString().split('.');
        return splitnum[1].length;
    } else {
        return 0;
    }
}

/**
 * Checks if price is valid. That is, it's a number with no more than 2 decimal places.
 * @param {number} price 
 * @param {string} varName 
 * @returns price if valid.
 */
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

/**
 * Checks if a rating is valid.
 * @param {number} rating 
 * @param {string} reviewerName 
 * @returns string saying `Rating for ${reviewerName} is ${rating}`
 */
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

/**
 * Checks if name is valid. Must be 2 <= length <= 25 characters, with no numbers.
 * @param {string} name 
 * @returns name if valid.
 */
export const checkName = (name, x) => {
    name = checkString(name, x)
    if (name.length < 2 || name.length > 25) {
        throw `Error: ${x} must be >= 2 and <= 25 characters in length.`
    }
    if (/\d/.test(name)) {
        throw `Error: ${x} cannot contain numbers.`
    }
    return name;
}

/**
 * Checks username for validity. That is, if it has no numbers, and is >= 5 and <= 20 characters in length.
 * @param {string} username 
 * @returns username if it's valid.
 */
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

/**
 * Checks for valid password. Must have >= 8 characters, >= 1 uppercase character,
 * >= 1 number, and >= 1 special character.
 * @param {string} password 
 * @returns the password if valid
 */
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

/**
 * Checks theme for validity.
 * @param {string} theme Theme. Can only be "light" or "dark"
 * @returns the theme if valid.
 */
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

/**
 * Checks email to see if it's valid.
 * @param {string} email 
 * @returns email if valid. Throws error if not
 */
export const checkEmail = (email) => {
    email = checkString(email, 'email');
    // if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))) {
    //     throw `Error: provided email is not a valid.`
    // }
    if (!(/^[^@]+@[a-z0-9.-]+\.[a-z]{2,}$/i).test(email))
        throw `Error: provided email is not a valid.`
    return email;
}

/**
 * Trys the callback function provided. If it errors, add it to a list of provided errors. Useful for checking multiple things and giving back multiple errors.
 * @param {*} fn Non asynchronous callback function that does something.
 * @param {*} errors A list of errors to pass, if it fails.
 */
export const tryCatchHelper = (fn, errors) => {
    try {
        fn();
    } catch(e) {
        errors.push(e);
    }
}