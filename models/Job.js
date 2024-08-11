const mongoose = require('mongoose');
const { isEmail } = require('validator');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title'],
    },
    company: {
        type: String,
        required: [true, 'Please enter a company'],
    },
    Website: {
        type: String,
        required: [true, 'Please enter a website'],
    },
    employersname: {
        type: String,
        required: [true, 'Please enter the name of the employer'],
    },
    Emailofcontact: {
        type: String,
        required: [true, 'Please enter an email'],
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    phone: {
        type: Number,
        required: [true, 'Please enter the phone of the employer'],
    },
    addresscontact: {
        type: String,
        required: [true, 'Please enter the name of the employer'],
    },
    origin: {
        type: String,
        required: [true, 'Please select the origin of the job'],
        enum : ['candidature','Offer'],
        default: 'candidature'
    },
    status: {
        type: String,
        required: [true, 'Please select the status'],
        enum : ['Interested','Cv sent', 'Negative', 'Interview'],
        default: 'Interested'
    }, 
    comments: String,
    userId: String, 
});

const Job = mongoose.model('job', jobSchema);

module.exports = Job;
