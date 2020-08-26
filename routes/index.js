const express = require('express');
const { ensureAuth, ensureGuest } = require('../middleware');
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
router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('dashboard');
});

module.exports = router;
