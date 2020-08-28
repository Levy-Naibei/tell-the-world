const express = require('express');
const { ensureAuth } = require('../middleware');
const Story = require('./../model/Story');
const router = express.Router();

/**
 * @desc   add story page
 * @route  GET  /stories/add
 */
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add');
});

/**
 * @desc   process add form
 * @route  POST /stories
 */
router.post('/', ensureAuth, async(req, res) => {
    try {
        req.body.user = req.user.id;
        await Story.create(req.body);
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('error/serverError');
    }
});

/**
 * @desc    show public stories
 * @route  GET  /stories
 */
router.get('/', ensureAuth, async(req, res) => {
    try {
        const pubStories = await Story.find({status: 'public'})
            .populate('user').sort({createdAt: -1}).lean()
        res.render('stories/index', { pubStories });
    } catch (error) {
        console.error(error)
        res.render('error/serverError')
    }
});

module.exports = router;
