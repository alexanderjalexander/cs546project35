//this will have all the routes that begin with /profile and /profiles
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import userData from '../data/users.js'
import itemData from '../data/items.js'
router.post('/profiles/:profileId/follow', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send("Unauthorized");
    }
    try {
        await profileData.followUser(req.session.user._id, req.params.profileId);
        res.redirect('/profiles/' + req.params.profileId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/:profileId/review', async (req, res) => {
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

router.post('/:profileId/follow', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send("Unauthorized");
    }
    try {
        await profileData.followUser(req.session.user._id, req.params.profileId);
        res.redirect('/profiles/' + req.params.profileId);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

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
    const foundProfile = await userData.getUserById(req.params.profileId);
    foundProfile.items = await itemData.getAllByUserId(req.params.profileId);
    foundProfile.followers = await Promise.all(foundProfile.followers.map(async (el) => {
        return await userData.getUserById(el.toString());
    }));
    foundProfile.following = await Promise.all(foundProfile.following.map(async (el) => {
        return await userData.getUserById(el.toString());
    }));
    foundProfile.reviews = await Promise.all(foundProfile.reviews.map(async (el) => {
        const reviewUser = await userData.getUserById(el.userId.toString());
        return {
            ...el,
            username: reviewUser.username
        }
    }));
    return res.render('profile', {
        title: foundProfile.username,
        ...foundProfile,
    });

    return res.json(foundUser);
});


export default router;