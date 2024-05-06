//this will have the /login /register etc. routes
import {Router} from 'express';
import * as help from '../helpers.js';
import userData from '../data/users.js';
const router = Router();

router.route('/')
.get(async (req, res) => {
    return res.render('home', {
        user: req.session.user
    });
});

router.route('/login')
.get(async (req, res) => {
    //code here for GET
    return res.render('login', {
        title:"Login"
    });
})
.post(async (req, res) => {
    const errors = [];
    const email = help.tryCatchHelper(errors, () => 
        help.checkEmail(req.body.email));
    const password = help.tryCatchHelper(errors, () => 
        help.checkPassword(req.body.password));
    
    if (errors.length !== 0) {
        return res.status(400).render('login', {
            title:"Login",
            errors: errors
        });
    }
    
    try {
        const login_result = await userData.loginUser(email, password);
        req.session.user = login_result;
        res.redirect('/');
    } catch (e) {
        return res.status(400).render('login', {
            ...req.body,
            title:"Login",
            errors: [e]
        });
    }
})

router.route('/register')
.get(async (req, res) => {
    return res.status(200).render('register', {
        title: 'Register'
    })
})
.post(async (req, res) => {
    const errors = [];
    const firstName = help.tryCatchHelper(errors, () => 
        help.checkName(req.body.firstName, 'First Name'));
    const lastName = help.tryCatchHelper(errors, () => 
        help.checkName(req.body.lastName, 'Last Name'));
    const email = help.tryCatchHelper(errors, () => 
        help.checkEmail(req.body.email));
    const username = help.tryCatchHelper(errors, () => 
        help.checkUsername(req.body.username));
    const password = help.tryCatchHelper(errors, () => 
        help.checkPassword(req.body.password));
    const confirmPassword = help.tryCatchHelper(errors, () => 
        help.checkString(req.body.confirmPassword, 'confirmPassword'));
    const themePreference = help.tryCatchHelper(errors, () => 
        help.checkTheme(req.body.themePreference));
    if (password !== confirmPassword) {
        errors.push('Error: passwords do not match.');
    }

    if (errors.length !== 0) {
        return res.status(400).render('register', {
            ...req.body,
            title:"Register",
            errors: errors
        });
    }

    try {
        await userData.createUser(
            firstName,
            lastName,
            email,
            username,
            password,
            themePreference
        );
        res.redirect('/login');
    } catch(e) {
        return res.status(500).render('register', {
            ...req.body,
            title:"Register",
            errors: [e]
        });
    }
})

router.route('/logout')
.get(async (req, res) => {
    //code here for GET
    req.session.destroy();
    return res.status(200).render('logout', {
        title: 'Logged Out'
    });
});

router.post('/theme', async (req, res) => {
    try {
        req.body.themePreference = help.checkTheme(req.body.themePreference);
    } catch (e) {
        return res.status(400).json({success: false, errors: [e]});
    }
    if (req.session.user !== undefined) {
        try {
            await userData.changeTheme(req.session.user._id, req.body.themePreference);
            req.session.user.themePreference = req.body.themePreference;
        } catch (e) {
            return res.status(500).json({success: false, errors: [e]});
        }
    }
    req.session.themePreference = req.body.themePreference;
    res.locals.themePreference = req.body.themePreference;
    return res.json({success: true, themePreference: req.body.themePreference});
})

export default router;