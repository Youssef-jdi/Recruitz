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
//tochange
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
			res.status(500).json({ success: false });
		} else if (typeof user === 'undefined' || user === null) {
			console.log('user ', user);
			res.status(400).json({ success: false });
		} else {
			Quiz.findOne({ _id: user.quizToPass }, (err, quiz) => {
				if (err) {
					res.status(500).json({ success: false });
				} else if (typeof quiz === 'undefined' || quiz === null) {
					console.log('user ', quiz);
					res.status(400).json({ success: false });
				} else {
					res.status(200).json({ success: true, quiz: quiz });
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
			console.log('user ', user);
			Quiz.findOne({ _id: user.quizToPass }, (err, quiz) => {
				if (err) {
					res.status(500).json({ success: false });
				}
				if (typeof quiz === 'undefined' || quiz === null) {
					res.status(400).json({ success: false });
				} else {
					console.log('quiz ', quiz);
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

router.post('/assign',(req,res)=>{
	const user = req.body.user
	const quiz = req.body.quiz
	User.findOneAndUpdate({_id : user._id},{quizToPass : quiz},(err,user)=>{
		if(err) res.status(500).json({success : false})
		res.status(200).json({success : true})	
	})

})


router.post('/delete',(req,res)=>{
	const quiz = req.body.quiz
	Quiz.remove({_id : quiz._id},(err,quiz)=>{
		if(err) res.status(500).json({success : false})
		res.status(200).json({success : true})
	})
})

module.exports = router;
