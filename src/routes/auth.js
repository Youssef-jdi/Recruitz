// divid login and sign up
// login for all users
// sign up Admin for SuperAdmin
// sign up SimpleUser for SuperAdmin and Admin

const express = require('express');
const validator = require('validator');
const passport = require('passport');


const router = new express.Router();


/**
 * Validate the sign up form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignupForm(payload) {
	let errors = '';
	let isFormValid = true;
	let message = '';

	if (!payload || typeof payload.email !== 'string' || !validator.isEmail(payload.email)) {
		isFormValid = false;
		errors = 'Please provide a correct email address.';
	}

	if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
		isFormValid = false;
		errors = 'Password must have at least 8 characters.';
	}

	if (!payload || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
		isFormValid = false;
		errors.name = 'Please provide your name.';
	}

	if (!isFormValid) {
		message = 'Check the form for errors.';
	}

	return {
		success: isFormValid,
		message,
		errors
	};
}



router.post('/signup', (req, res, next) => {
	const validationResult = validateSignupForm(req.body);
	if (!validationResult.success) {
		return res.status(400).json({
			type: 'Validation error',
			success: false,
			message: validationResult.message,
			errors: validationResult.errors
		});
	}

	return passport.authenticate('local-signup', (err) => {
		if (err) {
			if (err.name === 'MongoError' && err.code === 11000) {
				// the 11000 Mongo code is for a duplication email error
				// the 409 HTTP status code is for conflict error
				return res.status(409).json({
					success: false,
					message: 'this email or this name is already used'
				});
			}

			return res.status(400).json({
				type: err.message,
				success: false,
				message: 'Could not process the form.'
			});
		}

		return res.status(200).json({
			success: true,
			message: 'User Added'
		});
	})(req, res, next);
});












module.exports = router;
