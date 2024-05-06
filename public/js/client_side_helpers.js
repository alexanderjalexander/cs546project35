/**
 * Checks if a string exists and is a valid string(not just empty spaces).
 * @param {string} str
 * @param {string} name
 * @returns trimmed string, if valid.
 */
function checkString(str, name) {
    if (typeof str !== 'string') throw `Error: ${name} must be a string`;
    if (str.trim().length === 0)
        throw `Error: ${name} cannot be an empty string or just spaces`;
    str = str.trim();
    return str;
}

function checkItemName(str, name) {

}

/**
 * Calculates amt of decimal places a number has.
 * @param {number} num
 * @returns # of decimal places as an integer.
 */
function calcDecimalPlaces(num) {
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
function checkPrice(price, varName) {
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
function checkRating(rating) {
    if(!rating) throw `Error: You must provide rating`;
    if(typeof rating !== 'number' || Number.isNaN(rating)) throw `Error: rating must be a number`;
    if(rating.toFixed(1).length < rating.toString().length)
        throw `Error: rating cannot have more than one decimal point`
    if((rating < 1 || rating > 5)) throw `Error: rating must be between 0 and 5`
    return rating;
}

/**
 * Checks if name is valid. Must be 2 <= length <= 25 characters, with no numbers.
 * @param {string} name
 * @returns name if valid.
 */
const checkName = (name, varname) => {
    name = checkString(name, varname)
    if (name.length < 2 || name.length > 25) {
        throw `Error: ${varname} must be >= 2 and <= 25 characters in length.`
    }
    if (/\d/.test(name)) {
        throw `Error: ${varname} cannot contain numbers.`
    }
    return name;
}

/**
 * Checks username for validity. That is, if it has no numbers, and is >= 5 and <= 20 characters in length.
 * @param {string} username
 * @returns username if it's valid.
 */
const checkUsername = (username) => {
    username = checkString(username, 'username');
    username = username.toLowerCase();
    if (username.length < 5 || username.length > 20) {
        throw 'Error: username must be >= 5 and <= 20 characters in length.'
    }
    if (/\d/.test(username)) {
        throw `Error: username cannot contain numbers.`
    }
    if (/ /.test(username)) {
        throw `Error: username cannot contain spaces.`
    }
    return username;
}

/**
 * Checks for valid password. Must have >= 8 characters, >= 1 uppercase character,
 * >= 1 number, and >= 1 special character.
 * @param {string} password
 * @returns the password if valid
 */
const checkPassword = (password) => {
    password = checkString(password, 'password');
    const msg = "Error: password cannot contain whitespace, must be at least 8 characters, and must contain the following: one uppercase letter, one number, one special character.";
    if (/\s/.test(password)) {
        throw msg
    }
    if (password.length < 8) {
        throw msg
    }
    if (!(/[A-Z]/).test(password)) {
        throw msg
    }
    if (!(/[0-9]/).test(password)) {
        throw msg
    }
    if (!(/[^a-zA-Z0-9]/).test(password)) {
        throw msg
    }
    return password;
}

/**
 * Checks theme for validity.
 * @param {string} theme Theme. Can only be "light" or "dark"
 * @returns the theme if valid.
 */
const checkTheme = (theme) => {
    if (!theme) {
        throw `Error: You must supply a theme!`;
    }
    if (typeof theme !== 'string') {
        throw `Error: theme must be a string!`;
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
const checkEmail = (email) => {
    email = checkString(email, 'email');
    if (!(/^[^@]+@[a-z0-9.-]+\.[a-z]{2,}$/i).test(email))
        throw `Error: provided email is not a valid.`
    email = email.toLowerCase();
    return email;
}

/**
 * Trys the callback function provided. If it errors, add it to a list of provided errors. Useful for checking multiple things and giving back multiple errors.
 * @param {*} fn Non asynchronous callback function that does something.
 * @param {*} errors A list of errors to pass, if it fails.
 */
const tryCatchHelper = (errors, fn) => {
    try {
        return fn();
    } catch(e) {
        errors.push(e);
    }
}

/**
 * Trys the callback function provided. If it errors, add it to a list of provided errors. Useful for checking multiple things and giving back multiple errors.
 * @param {*} fn Non asynchronous callback function that does something.
 * @param {*} errors A list of errors to pass, if it fails.
 */
const tryCatchAsync = async (errors, fn) => {
    try {
        return await fn();
    } catch(e) {
        errors.push(e);
    }
}