const express = require("express");
const router = express.Router();

const User = require('../models/User');
const passport = require('passport');

const {isAuthenticated} =require('../helpers/auth');

router.get('/users/signin', (req, res)=>{
    res.render('users/signin');
});

router.post('/users/signin', 
    passport.authenticate('local',{
        successRedirect:'/notes',
        failureRedirect:'/users/signin',
        failureFlash:true //enviar mensajes flash
    })
);

router.get('/users/signup',(req, res)=>{
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;
    const errors = [];

    if(!name){
        errors.push({text: 'Name is required'});
    }

    if(!email){
        errors.push({text: 'Email is required'});
    }

    if(!password){
        errors.push({text: 'Password is required'});
    }

    if(password !== confirm_password){
        errors.push({text: 'Password do not match'});
    }

    if(password.length < 4){
        errors.push({text: 'Password must be at least 4 characters'})
    }

    if(errors.length > 0){
        res.render('users/signup',{errors,name,email,password,confirm_password});
    }else{
        const emailUser = await User.findOne({email:email})
        if(emailUser){
            req.flash('error_msg','This email is already in use!');
            res.redirect('/users/signup')
        }

        const newUser = new User({name,email,password});
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg','User registered successfully');
        res.redirect('/users/signin');
    }
})

router.get('/users/logout', isAuthenticated,(req,res)=>{
    req.logOut();
    res.redirect('/');
})

module.exports = router;