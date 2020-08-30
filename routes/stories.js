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
        res.render('error/serverError');
    }
});

/**
 * @desc   show update page
 * @route  GET  /stories/update/:id
 */
router.get('/update/:id', ensureAuth, async(req, res) => {
    try {
        const story = await Story.findOne({_id: req.params.id}).lean();

        if (!story) {
            return res.render('error/pageNotFound'); 
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/update', { story });
        }
    } catch (error) {
        console.error(error);       
    }
});

/**
 * @desc   process update form
 * @route  PUT  /stories/:id
 */
router.put('/:id', ensureAuth, async(req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean();

        if (!story) {
            res.render('/error/pageNotFound');
        }

        if (story.user != req.user.id) {
            res.redirect('/stories');
        } else {
            story = await Story.findOneAndUpdate(
                {_id: req.params.id},
                req.body,
                {
                    new: true,
                    runValidators: true
                })
            res.redirect('/dashboard');
        }
    } catch (err) {
        console.error(err)
    }
});

module.exports = router;
