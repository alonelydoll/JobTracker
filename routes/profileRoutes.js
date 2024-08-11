const express = require('express');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcrypt');
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

// Routes
router.get('/', requireAuth, checkUser, (req, res) => {
    const user = res.locals.user;
    if (user) {
        const split = user.cv.split("upload/");
        const fileName = split[split.length-1];
        const cvDownloadLink = user.cv.replace(fileName, "") + "fl_attachment/" + fileName;
        res.render('profile', {
            fullname: user.Firstname + " " + user.Lastname,
            email: user.email,
            github: user.Github,
            profilePicture: user.profilePicture,
            cv: user.cv,
            cvDownload: cvDownloadLink,
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/', upload.single('cv'), checkUser, async (req, res) => {
    const userId = res.locals.user.id;
    const password = req.body.password;
    const toUpdate = {};
    if (password) {
        const salt = await bcrypt.genSalt();
        toUpdate.password = await bcrypt.hash(password, salt);
    }
    // CV
    if (req.file) {
        toUpdate.cv = await uploadFile(res, req.file);
        console.log(toUpdate);
    }

    try {
        await User.updateOne({_id: userId}, toUpdate);
        res.status(200);
        res.redirect('/profile');
    } catch(err) {
        res.status(400).json({ err });
    }
});

module.exports = router;
