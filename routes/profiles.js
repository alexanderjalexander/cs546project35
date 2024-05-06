//this will have all the routes that begin with /profile and /profiles
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import userData from '../data/users.js'
import itemData from '../data/items.js'
router.post('/:profileId/follow/:arg', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send("Unauthorized");
    }
    const errors = [];
    req.params.profileId = help.tryCatchHelper(errors, ()=>
        help.checkIdString(req.params.profileId));
    //check if user exists
    try{
        await userData.getUserById(req.params.profileId);
    } catch(e){
        return res.status(404).render('error', {
            title: "error",
            errors: ['user not found'],
        })
    }
    try {
        if (req.params.arg === 'follow'){
            await userData.addFollower(req.params.profileId, req.session.user._id);
            req.session._message = ['successfully added a follower'];
        } else if (req.params.arg === 'unfollow'){
            await userData.removeFollower(req.params.profileId, req.session.user._id);
            req.session._message = ['successfully removed a follower'];
        } else {
            return res.status(400).render('error', {
                title: 'error',
                errors: ['invalid url argument']
            });
        }
        res.redirect(`/profiles/${req.params.profileId}`);
    } catch (error) {
        return res.status(500).render('error', {
            title: "error",
            errors: [e],
        })
    }
});

router.post('/:profileId/review', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send("Unauthorized");
    }
    const errors = [];
    req.params.profileId = help.tryCatchHelper(errors, ()=>
        help.checkIdString(req.params.profileId));
    //check if user exists
    let foundUser = undefined;
    try{
        foundUser = await userData.displayUserData(req.params.profileId);
    } catch(e){
        return res.status(404).render('error', {
            title: "error",
            errors: ['user not found'],
        })
    }
    req.body.comment = help.tryCatchHelper(errors, el=>
                        help.checkComment(req.body.comment));
    req.body.rating = help.tryCatchHelper(errors, el=>
                        help.checkRating(req.body.rating));
    if (errors.length !== 0){
        return res.status(400).render('profile', {
            ...foundUser,
            errors: errors,
            title: "profile",
            ...req.body
        });
    }
    try {
        if (foundUser.reviews.find((element) => {
            return element.userId.toString() === req.session.user._id
        })){
            return res.render('profile', {
                ...foundUser,
                title: "profile",
                errors: ['you already have a review on this user!']
            });
        }
        await userData.addReview(
            req.params.profileId, 
            req.session.user._id, 
            req.body.comment,
            req.body.rating);
        foundUser = await userData.displayUserData(req.params.profileId);
        return res.render('profile', {
            ...foundUser,
            title: "profile"
        });
    } catch (e) {
        return res.render('profile', {
            ...foundUser,
            title: "profile",
            errors: ['you already have a review on this user!']
        });
    }
});


router.delete('/:profileId/review', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send("Unauthorized");
    }
    const errors = [];
    req.params.profileId = help.tryCatchHelper(errors, ()=>
        help.checkIdString(req.params.profileId));
    //check if user exists
    let foundUser = undefined;
    try{
        foundUser = await userData.displayUserData(req.params.profileId);
    } catch(e){
        return res.status(404).render('error', {
            title: "Error",
            errors: ['user not found'],
        })
    }
    try {
        if (!foundUser.reviews.find((element) => {
            return element.userId.toString() === req.session.user._id
        })){
            return res.render('profile', {
                ...foundUser,
                title: "Profile",
                errors: ['you dont have a review on this user to delete!']
            });
        }
        await userData.removeReview(req.params.profileId, req.session.user._id)     
        foundUser = await userData.displayUserData(req.params.profileId);
        return res.render('profile', {
            ...foundUser,
            title: "Profile"
        });
    } catch (e) {
        return res.status(404).render('error', {
            title: "error",
            errors: [e],
            thisUserId: req.session.user._id.toString()
        })
    }
});


router.get('/', async (req, res) => {
    try{
        let users = await userData.getAll();
        if (req.session.user){
            //filter out the current user?
        }
        return res.status(200).render('profiles', {
            users,
            title: "Users"
        })
    } catch (e) {
        return res.status(500).render('error', {
            title: "Error",
            errors: [`unexpected server error ${e}`]
        })
    }
});

router.get('/:profileId', async (req, res) => {
    //verify url param
    let foundUser = undefined;
    try{
        req.params.profileId = help.checkIdString(req.params.profileId);
    } catch (e){
        return res.status(400).render('error', {
            title: "Error",
            errors: ['invalid url'],
        })
    }
    try{
        foundUser = await userData.getUserById(req.params.profileId);
    } catch(e){
        return res.status(404).render('error', {
            title: "Error",
            errors: ['user not found'],
        })
    }
    if (req.session.user && req.session.user._id === req.params.profileId){
        //user is looking at themself. Redirect to the self page
        return res.redirect('/profile');
    }
    const foundProfile = await userData.displayUserData(req.params.profileId);
    let self = undefined;
    if(req.session.user){
        self = await userData.displayUserData(req.session.user._id);
        
        return res.render('profile', {
            title: foundProfile.username,
            ...foundProfile,
            thisUser: self,
            followed: foundProfile.followers.find((el)=>
                            el._id.toString()===self._id.toString())
        });
    }
    return res.render('profile', {
        title: foundProfile.username,
        ...foundProfile,
        auth: false
    });
});


export default router;