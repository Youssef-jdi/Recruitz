const express = require('express');
const validator = require('validator');
const passport = require('passport');
const router = new express.Router();
const User = require('../models/user');

router.post('/reset', (req, res) => {
	User.findOne({
		updatePasswordToken: req.body.token,
		resetPasswordExpires: { $gt: Date.now() }
	})
		.then((user) => {
			if (user === null) {
				console.log('password reset link is invalid or has expired .');
				res.json({
					success: false,
					user: null
				});
			} else {
				res.status(200).json({
					success: true,
					user: user
				});
			}
		})
		.catch((err) => console.log('erreur find ' + err));
});

router.post('/login', (req, res, next) => {
	const validationResult = validateLoginForm(req.body);
	if (!validationResult.success) {
		console.error('validation ');
		return res.status(400).json({
			success: false,
			message: validationResult.message,
			errors: validationResult.errors
		});
	}

	return passport.authenticate('local-login', (err, token, userData) => {
		if (err) {
			if (err.name === 'IncorrectCredentialsError') {
				console.error('Credential ', err.message);
				return res.status(400).json({
					success: false,
					message: err.message
				});
			}
			console.error('400 w kahaw ', err.message);
			return res.status(400).json({
				success: false,
				message: err.message
			});
		}
		console.error('200');
		return res.json({
			success: true,
			message: 'You have successfully logged in!',
			token,
			user: userData
		});
	})(req, res, next);
});

router.post('/firstlogin', (req, res) => {
	const user = req.body.user;
	delete user.resetPasswordExpires;
	delete user.updatePasswordToken;
	User.find({ email: user.email }).remove().exec();
	const newUser = new User(user);
	newUser
		.save()
		.then((user) => {
			console.log('newnewuser ', user);
			res.json({ user: user, success: true });
		})
		.catch((err) => {
			console.log(err);
			res.json({ user: null, success: false });
		});
});

router.get('/Candidates', (req, res) => {
	User.find({ role: 'Candidate' }, (err, user) => {
		if (err) res.status(500).json({ success: false });
		else if (typeof user === 'undefined' || user === null) res.status(400).json({ success: false });
		else {
			res.status(200).json({ success: true, candidates: user });
		}
	});
});

router.get('/isQuizPassed/:id', (req, res) => {
	const idUser = req.params.id;
	User.findOne({ _id: idUser }, (err, user) => {
		if (err) res.status(500).json({ isPassed: false });
		user === null || typeof user === 'undefined' ? console.log('user undefined or null') : console.log('user is here')
		user.resultQuiz === null || typeof user.resultQuiz === 'undefined' ? res.status(200).json({ isPassed: false }) : res.status(200).json({ isPassed: true });
	});
});

router.post('/startQuiz',(req,res)=>{
	const user = req.body
	User.findOneAndUpdate({_id : user.id},{startedAt : Date.now()} , (err,user)=>{
		console.log('/startQuiz ', user)
	})
	res.end()
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

module.exports = router;
