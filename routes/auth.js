const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_KEY).toString(),
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    }catch (err) {
        res.status(500).json(err);
    }
});


// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        if(!user) {
            res.status(401).json("Không tồn tại tên đăng nhập!");
        }

        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_KEY);
        const password = hashedPassword.toString(CryptoJS.enc.Utf8);
        if(password !== req.body.password) {
            res.status(401).json("Sai mật khẩu!");
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_KEY,
                {expiresIn:"3d"}
            );

        res.status(200).json({...user, accessToken});
    }catch(err){
        res.status(500).json(err);
    }
});

module.exports = router