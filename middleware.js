/**
 * Logs authentication status of user to the console, as well as methods and routes.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const root_middleware = (req, res, next) => {
    const timestamp = new Date().toUTCString();
    const method = req.method;
    const route = req.originalUrl;
    const auth_string = req.session.user ? (req.session.user.username) : ('Non-authenticated User');
    console.log(`[${timestamp}]: ${method} ${route} (${auth_string})`);

    next();
}

/**
 * If user is already logged in, bring them back home instead.
 * Otherwise, allow them to register / login.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const register_login_middleware = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    } else {
        next();
    }
}

/**
 * Redirects user to login screen if unauthenticated.
 * Helps protect authenticated routes.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const protected_middleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else {
        next();
    }
}