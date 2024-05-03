//this will have all the routes that begin with /profile and /profiles
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';


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


export default router;