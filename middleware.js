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
 * Dynamically determines the navLinks that should be visible when the user's 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const nav_middleware = (req, res, next) => {
    const everyone = [
        {label: "Home", url: "/"},
        {label: "View Community Items", url: "/items"},
    ];
    const authorized_only = [
        {label: "My Trades", url: "/trades"},
        {label: "Direct Messages", url: "/directmsgs"},
        {label: "My Profile", url: "/profile"},
        {label: "Log Out", url: "/logout"},
    ];
    const guest_only = [
        {label: "Log In", url: "/login"},
        {label: "Register", url: "/register"}
    ];
    let navLinks = [];
    navLinks = navLinks.concat(everyone)
    if (req.session.user && req.originalUrl !== '/logout') {
        //user is authorized
        navLinks = navLinks.concat(authorized_only)
    } else {
        //user is not authorized
        navLinks = navLinks.concat(guest_only)

    }
    //add an id for the link for the page that the user is currently on
    navLinks.map((el) => {
        if(el.url === req.originalUrl){
            el.class = "currentLink";
        } else{
            el.class = "otherLink";
        }
    });
    res.locals.navLinks = navLinks
    next();
}
/**
 * Dynamically determines the navLinks that should be visible when the user's 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const message_middleware = (req, res, next) => {
    res.locals._message = req.session._message
    req.session._message = undefined
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