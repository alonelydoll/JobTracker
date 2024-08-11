const express = require('express');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');
const Job = require('../models/Job');

const router = express.Router();

router.get('/', requireAuth, checkUser, async (req, res) => {
    const userId = res.locals.user.id;
    const statusClasses = {
        "Interested": "interested", "Cv sent": "cvSent", "Negative": "negative", "Interview": "interview"};
    const jobs = (await Job.find({userId: userId})).map(job => {
        return {
            title: job.title,
            employer: job.employersname,
            status: job.status,
            statusClass: statusClasses[job.status],
            jobId: job.id,
        }
    });
    res.render('dashboard', {jobs: jobs});
});

router.get('/:id', requireAuth, async (req, res) => {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    res.render('updatejob', {
        title: job.title,
        company: job.company,
        website: job.Website,
        employer: job.employersname,
        email: job.Emailofcontact,
        phone: job.phone,
        address: job.addresscontact,
        origin: job.origin,
        status: job.status,
        comments: job.comments || "",
        jobId: jobId,
    });
});

router.post('/:id', requireAuth, async (req, res) => {
    console.log("POST UPDATE JOB");
    console.log(req.body);
    const jobId = req.params.id;
    const toUpdate = {};
    Object.keys(req.body).forEach(key => {
        const value = req.body[key];
        if (value) {
            toUpdate[key] = value;
        }
    });

    try {
        await Job.updateOne({_id: jobId}, toUpdate);
        res.status(200);
        res.redirect('/dashboard');
    } catch(err) {
        res.status(400).json({ err });
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    const jobId = req.params.id;
    await Job.deleteOne({_id: jobId}).then(() => {
        res.status(200);
        res.json({res: "OK"}); // dummy response
    }).catch(function(err){
        res.status(400).json({ err });
    });
});

module.exports = router;
