const mongoose = require('mongoose')
const UserSchema = require('../models/user').schema

const QuizSchema = mongoose.Schema({
    madeBy : UserSchema,
    date : Date 
},
{strict : false})

const Quiz = module.exports = mongoose.model('Quiz', QuizSchema);