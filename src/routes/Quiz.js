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
		ReqQuiz.date = Date.now();
		const quiz = Quiz(ReqQuiz);
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
	Quiz.find({ madeBy: idUser }, (err, quizes) => {
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
		if (err || user === 'undefined' || user === null) {
			console.log('here user undefined null or err')
			res.status(500).json({ success: false });
		} else {
			Quiz.findOne({ _id: user.quizToPass }, (err, quiz) => {
				if (err || quiz === 'undefined' || quiz === null) {
					console.log('here quiz undefined null or err')
					res.status(500).json({ success: false });
				} else {
					res.status(200).json({ success: true, quiz: quiz });
				}
			});
		}
	});
});

router.post('/finishQuiz', (req, res) => {
	const body = req.body;
	User.findOne({_id : body.user.id} , (err,user) => {
		if(err){
			res.status(500).json({success : false})
		}
		else if(user === 'undefined' || user === null){
			res.status(400).json({success : false})
		}
		else {
			User.findOneAndUpdate({ _id :  user.id},{$set : {resultQuiz : body.result }} , {new : true} , (err,user) => {
				if(err){
					res.status(500).json({success : false})
				}
				else if(user === 'undefined' || user === null){
					console.log(user)
					res.status(400).json({success : false})
				}
				else {
					console.log(user)
					res.status(200).json({success : true})
				}
			})
			
		}
		
	
	})
	
	// console.log('body', body);
	// res.status(200).json({ success: true });
});

module.exports = router;
