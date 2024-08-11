const express = require('express');
const User = require("../models/User"); // DB
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
cloudinary.config({ 
    cloud_name: 'dhaij9evf', 
    api_key: '475535434537343', 
    api_secret: 'EvSOIWgHfH1bt1R_dPDqSp0BpMM',
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Utils
// Handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };
  
    // Incorrect email
    if (err.message === 'incorrect email') {
        errors.email = '⚠ That email is not registered';
    }
  
    // Incorrect password
    if (err.message === 'incorrect password') {
        errors.password = '⚠ The password is incorrect';
    }
  
    // Duplicate email error
    if (err.code === 11000) {
        errors.email = '⚠ That email is already registered';
        return errors;
    }
  
    // Validation errors
    if (err.message.includes('user validation failed')) {
        // console.log(err);
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log(val);
            // console.log(properties);
            errors[properties.path] = properties.message;
        });
    }
  
    return errors;
}

// Create a 3 days json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

async function uploadFile(res, file) {
    let cloudinaryUrl;
    await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error uploading to Cloudinary' });
            }
            cloudinaryUrl = result.secure_url;
            resolve();
        }).end(file.buffer);
    });
    return cloudinaryUrl;
}

// Register
router.get('/sign-up', (req, res) => {
    res.render('sign-up', {error: ""});
});

router.post('/sign-up', upload.fields([{name: 'profilePicture'}, {name: "cv"}]), async (req, res) => {
    const { Firstname, Lastname, email, Github, cv, password } = req.body;
    const repeatPwd = req.body["repeat-password"];

    console.log(repeatPwd, password);
    if (password !== repeatPwd) {
        res.status(400);
        res.render('sign-up', {error: " ⚠ The passwords do not match"});
        return;
    }

    // Upload profile picture and CV on Cloudinary.
    let imageSrc = "";
    let cvSrc = "";
    
    if (req.files.profilePicture) {
        imageSrc = await uploadFile(res, req.files.profilePicture[0]);
    }
    if (req.files.cv) {
        cvSrc = await uploadFile(res, req.files.cv[0]);
    }

    try {
        const user = await User.create({ Firstname, Lastname, email, Github, profilePicture: imageSrc, cv: cvSrc, password });
        console.log("user", user);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201)
        res.redirect('/');
    }
    catch(err) {
        const errors = handleErrors(err);
        let errorMessage = "";
        Object.keys(errors).forEach(error => {
            errorMessage += errors[error] + " ";
        });
        res.status(400);
        res.render('sign-up', {error: errorMessage});
    }
});

// Login
router.get('/login', (req, res) => {
    res.render('login', {error: ""});
});

router.post('/login', async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
  
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200);
        res.redirect('/');
    } 
    catch (err) {
        const errors = handleErrors(err);
        res.status(400);
        res.render('login', {error: errors.email + " " + errors.password});
    }
});

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
});

module.exports = router;
