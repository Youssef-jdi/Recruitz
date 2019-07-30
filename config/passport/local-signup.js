const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const nodemailer = require('nodemailer');
/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy(
	{
		usernameField: 'email',
		// passwordField: 'password',
		session: false,
		passReqToCallback: true
	},
	(req, email, password, done) => {
		let userData;

		typeof req.body.quiz === 'undefined'
			? (userData = {
					email: email.trim(),
					password: '********',
					name: req.body.name.trim(),
					role: req.body.role.trim()
				})
			: (userData = {
					email: email.trim(),
					password: '********',
					name: req.body.name.trim(),
					role: req.body.role.trim(),
					quizToPass: req.body.quiz
				});

		console.log('userdata', userData);

		const newUser = new User(userData);
		newUser.save((err, user) => {
			if (err) {
				return done(err);
			} else {
				sendMail(user);
			}

			return done(null);
		});
	}
);

const sendMail = (user) => {
	const token = crypto.randomBytes(20).toString('hex');
	User.updateOne(
		{ email: user.email },
		{
			updatePasswordToken: token,
			resetPasswordExpires: Date.now() + 360000
		},
		(err, user) => {
			if (err) console.log(err);
		}
	);
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		auth: {
			user: 'example@email.com',
			pass: '****'
		}
	});
	const mailOptions = {
		from: 'youssef.jdidi@esprit.tn',
		to: user.email,
		subject: 'Quiz',
		text: 'http://localhost:3000/updatepassword/' + token
	};

	transporter.sendMail(mailOptions, (err, res) => {
		if (err) console.log('sending went wrong ' + err);
		console.log('response sending ', res);
	});
};
