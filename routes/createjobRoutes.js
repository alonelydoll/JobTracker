const express = require('express');
const Job = require("../models/Job");
const { requireAuth, checkUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Utils
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {};

    if (err.message.includes('job validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

// Routes
router.get('/', requireAuth, (req, res) => {
    res.render('createjob', {error: ""});
})

router.post('/', requireAuth, checkUser, async (req, res) => {
    const userId = res.locals.user.id;
    const {company, Website, employersname, Emailofcontact, phone, addresscontact, origin, status, comments} = req.body;
    const title = req.body["job-title"];

    try {
        const job = await Job.create({ title: title, company, Website, employersname, Emailofcontact, phone, addresscontact, origin, status, comments, userId: userId});
        res.status(201);
        res.redirect('/');
    } catch (err) {
        const errors = handleErrors(err);
        console.log("ERRORS", errors);
        let errorMessage = "";
        Object.keys(errors).forEach(error => {
            errorMessage += errors[error] + " ";
        });
        res.status(400);
        res.render('createjob', {error: errorMessage});
    }
})

module.exports = router;
