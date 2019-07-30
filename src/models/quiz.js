const mongoose = require('mongoose')


const QuizSchema = mongoose.Schema({
    madeBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date : Date
},
{strict : false})

const Quiz = module.exports = mongoose.model('Quiz', QuizSchema);