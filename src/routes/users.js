const express = require('express');
const validator = require('validator');
const passport = require('passport');
const router = new express.Router();
const User = require('../models/user')



router.post('/reset',(req,res)=>{
   
    User.findOne({ 
        
        updatePasswordToken: req.body.token,
        resetPasswordExpires : { $gt : Date.now() }
        
        
        
        })
    
        .then(user => {
        
        if(user === null){
            console.log('password reset link is invalid or has expired .')
            res.json({
                success : false,
                user : null
            })
        }
        else {
            res.status(200).json({
                success: true,
                user: user
            })
        }
        })
        .catch(err => console.log('erreur find '+err))
})


router.post('/login', (req, res, next) => {
	const validationResult = validateLoginForm(req.body);
	if (!validationResult.success) {
        console.error('validation ')
		return res.status(400).json({
			success: false,
			message: validationResult.message,
			errors: validationResult.errors
		});
	}

	return passport.authenticate('local-login', (err, token, userData) => {
		if (err) {
			if (err.name === 'IncorrectCredentialsError') {
                console.error('Credential ')
				return res.status(400).json({
					success: false,
					message: err.message
				});
			}
            console.error('400 w kahaw ')
			return res.status(400).json({
				success: false,
				message: err.message
			});
		}

		return res.json({
			success: true,
			message: 'You have successfully logged in!',
			token,
			user: userData
		});
	})(req, res, next);
});




 router.post('/firstlogin',(req,res) => {
    const user = req.body.user
    delete user.resetPasswordExpires
    delete user.updatePasswordToken
    User.find({email : user.email}).remove().exec()
    const newUser = new User(user);
    newUser.save().then(user => {
        console.log('newnewuser ',user)
        res.json({user : user , success : true})
    }).catch(err => {
        console.log(err)
        res.json({user : null , success : false})
    });
})



/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
 function validateLoginForm(payload) {
	const errors = {};
	let isFormValid = true;
	let message = '';

	if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
		isFormValid = false;
		errors.email = 'Please provide your email address.';
	}

	if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
		isFormValid = false;
		errors.password = 'Please provide your password.';
	}

	if (!isFormValid) {
		message = 'Check the form for errors.Yo';
	}

	return {
		success: isFormValid,
		message,
		errors
	};
}



module.exports = router