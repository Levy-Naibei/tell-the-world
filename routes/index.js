const express = require('express');
const { ensureAuth, ensureGuest } = require('../middleware');
const Story = require('./../model/Story');
const router = express.Router();

/*
@desc landing/login page
@route  GET
*/
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    });
});

/*
@desc dashboard page
@route  GET /dashboard
*/
router.get('/dashboard', ensureAuth, async(req, res) => {
    try {
        const fetchedStories = await Story.find({ user: req.user.id })
        .sort({createdAt: -1}).lean();
        res.render('dashboard', {
            name: req.user.firstName,
            fetchedStories
        });  
    } catch (error) {
        res.render('error/serverError');
        console.error(error);
    }
});

module.exports = router;
