const express = require('express');
const router = new express.Router();
const Quiz = require('../models/quiz');
const User = require('../models/user');

router.post('/Create', (req, res) => {
	const ReqQuiz = req.body.quiz;
	const ReqUser = req.body.user;

	User.findOne({ email: ReqUser.email }, (err, user) => {
		if (err) console.log(err);
		console.log('user mong ', user);
        ReqQuiz.madeBy = user;
        ReqQuiz.date = Date.now()
		const quiz = Quiz(ReqQuiz);
		quiz
			.save()
			.then((quiz) => {
				console.log('quiz ', quiz);
				res.status(200).json({ success: true , quiz : quiz });
			})
			.catch((err) => {
				console.log('error save quiz ', err);
				res.status(300).json({ success: false });
			});
	});
});

router.get('/MyQuizes/:id', (req, res) => {
	const idUser = req.params.id;
	Quiz.find({ madeBy: idUser }, (err, quizes) => {
		if (err) {
			console.log('error finding quizes');
			res.status(500).json({ success: false });
		}

		res.status(200).json({ success: true, quizes: quizes });
	});
});




module.exports = router;
