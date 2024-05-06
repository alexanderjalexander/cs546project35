//this will have all the routes that begin with /profile and /profiles
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import userData from '../data/users.js'
import itemData from '../data/items.js'
router.post('/:profileId/follow', async (req, res) => {
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
        await userData.addFollower(req.params.profileId, req.session.user._id);
        req.session._message = ['successfully added a follower']
        res.redirect(`/profiles/${req.params.profileId}`);
    } catch (error) {
        return res.status(500).render('error', {
            title: "error",
            errors: [e],
        })
    }
});

router.post('/:profileId/review', async (req, res) => {
    return res.json({error: "implemenet"});
    if (!req.session.user) {
        return res.status(403).send("Unauthorized");
    }

    const reviewContent = req.body.review;
    if (!reviewContent) {
        return res.status(400).send("Review content cannot be empty");
    }

    try {
        await profileData.addReviewToProfile(req.params.profileId, req.session.user._id, reviewContent);
        res.redirect('/profiles/' + req.params.profileId);
    } catch (error) {
        res.status(500).send(error.message);
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
            title: "users"
        })
    } catch (e) {
        return res.status(500).render('error', {
            title: "error",
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
            title: "error",
            errors: ['invalid url'],
        })
    }
    try{
        foundUser = await userData.getUserById(req.params.profileId);
    } catch(e){
        return res.status(404).render('error', {
            title: "error",
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