const express = require('express');
const router = new express.Router();
const Quiz = require('../models/quiz');
const User = require('../models/user');

router.post('/Create', (req, res) => {
	const ReqQuiz = req.body.quiz;
	const ReqUser = req.body.user;

	User.findOne({ email: ReqUser.email }, (err, user) => {
		if (err) console.log(err);
		ReqQuiz.madeBy = user;
		ReqQuiz.date = Date.now();
		let randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		typeof ReqQuiz.cookieName === 'undefined' ? ReqQuiz.cookieName = randomToken : console.log('cookie from quiz ',ReqQuiz.cookieName)
		ReqQuiz.showPrevButton = false
		ReqQuiz.sendResultOnPageNext = true
		ReqQuiz.showProgressBar = "bottom"
		ReqQuiz.firstPageIsStarted = true
		const quiz = new Quiz(ReqQuiz);
		quiz
			.save()
			.then((quiz) => {
				console.log('quiz ', quiz);
				res.status(200).json({ success: true, quiz: quiz });
			})
			.catch((err) => {
				console.log('error save quiz ', err);
				res.status(300).json({ success: false });
			});
	});
});

router.get('/MyQuizes/:id', (req, res) => {
	const idUser = req.params.id;

	Quiz.find({ 'madeBy._id': idUser }, (err, quizes) => {
		if (err) {
			console.log('error finding quizes');
			res.status(500).json({ success: false });
		}

		res.status(200).json({ success: true, quizes: quizes });
	});
});

router.get('/pass/:id', (req, res) => {
	const idUser = req.params.id;

	User.findOne({ _id: idUser }, (err, user) => {
		if (err) {
			res.status(500).json({ success: 0 });
		} else if (typeof user === 'undefined' || user === null) {
			// console.log('user ', user);
			res.status(400).json({ success: 0 });
		} else {
			Quiz.findOne({ _id: user.quizToPass }, (err, quiz) => {
				if (err) {
					res.status(500).json({ success: 0 });
				} else if (typeof quiz === 'undefined' || quiz === null) {
					res.status(400).json({ success: 0 });
				} else {
					// console.log('/pass quiz user ', user);
					// console.log('/pass quiz quiz ', quiz);
					res.status(200).json({ success: 1, quiz: quiz });
				}
			});
		}
	});
});

router.post('/finishQuiz', (req, res) => {
	const body = req.body;
	User.findOne({ _id: body.user.id }, (err, user) => {
		if (err) {
			res.status(500).json({ success: false });
		} else if (user === 'undefined' || user === null) {
			res.status(400).json({ success: false });
		} else {
			User.findOneAndUpdate(
				{ _id: user.id },
				{ $set: { resultQuiz: body.result } },
				{ new: true },
				(err, user) => {
					if (err) {
						res.status(500).json({ success: false });
					} else if (user === 'undefined' || user === null) {
						console.log(user);
						res.status(400).json({ success: false });
					} else {
						console.log(user);
						res.status(200).json({ success: true });
					}
				}
			);
		}
	});

	// console.log('body', body);
	// res.status(200).json({ success: true });
});

router.get('/result/:id', (req, res) => {
	const id = req.params.id;
	User.findOne({ _id: id }, (err, user) => {
		if (err) {
			res.status(500).json({ success: false });
		} else if (typeof user === 'undefined' || user === null) {
			res.status(400).json({ success: false });
		} else {
			Quiz.findOne({ _id: user.quizToPass }, (err, quiz) => {
				if (err) {
					res.status(500).json({ success: false });
				}
				if (typeof quiz === 'undefined' || quiz === null) {
					res.status(400).json({ success: false });
				} else {
					quiz = quiz.toObject();
					delete quiz.cookieName;
					delete quiz.showPrevButton;
					delete quiz.maxTimeToFinish;
					delete quiz.maxTimeToFinishPage;
					delete quiz.showTimerPanel;

					res.status(200).json({ success: true, user: user, quiz: quiz });
				}
			});
		}
	});
});

router.get('/AllQuizes', (req, res) => {
	Quiz.find({}, (err, quizes) => {
		if (err) {
			console.log('here');
			res.status(500).json({ success: false });
		} else if (typeof quizes === 'undefined' || quizes === null) {
			console.log('here');
			res.status(400).json({ success: false });
		} else {
			res.status(200).json({ success: true, quizes: quizes });
		}
	});
});

router.post('/assign', (req, res) => {
	const user = req.body.user;
	const quiz = req.body.quiz;
	User.findOneAndUpdate({ _id: user._id }, { quizToPass: quiz }, (err, user) => {
		if (err) res.status(500).json({ success: false });
		res.status(200).json({ success: true });
	});
});

router.post('/delete', (req, res) => {
	const quiz = req.body.quiz;
	Quiz.remove({ _id: quiz._id }, (err,status) => {
		if (err) res.status(500).json({ success: false });
		Quiz.find({},(err,quizes)=>{
			if(err) res.status(500).json({ success: false });
			console.log('quizes ',quizes)
			res.status(200).json({ success: true , quizes : quizes});
		})
		
	});
});



router.get('/isStarted/:id', (req, res) => {
	const idUser = req.params.id;
	User.findOne({ _id: idUser }, (err, user) => {
		err
			? res.status(500).json({ success: false })
			: user === null || typeof user === 'undefined'
				? res.status(400).json({ success: false })
				: user.startedAt === null || typeof user.startedAt === 'undefined'
					? res.status(200).json({ started: false, success: true })
					: res.status(200).json({ started: true, success: true });
	});
});

module.exports = router;
