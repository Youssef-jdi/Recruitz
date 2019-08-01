const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Roles = module.exports = Object.freeze({
    SuperAdmin: 'SuperAdmin',
    Admin: 'Admin',
    SimpleUser: 'Candidate',
  });

// User Schema
const UserSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    index: { unique: true }
  },
  password:String,
  role: {
    type: String,
    enum: Object.values(Roles),
    required: true
  },
  updatePasswordToken : String,
  resetPasswordExpires : String,
  quizToPass : { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz'},
  resultQuiz : {}
});

Object.assign(UserSchema.statics, {
    Roles,
  });

/**
 * Compare the passed password with the value in the database. A model method.
 *
 * @param {string} password
 * @returns {object} callback
 */
UserSchema.methods.comparePassword = function comparePassword(password, callback) {
    bcrypt.compare(password, this.password, callback);
  };
  
  
  /**
   * The pre-save hook method.
   */
  //  UserSchema.pre('findOneAndUpdate', function (next) {
  //     const user = this;
  //     // if (!user.isModified('password')) return next();
  //     return bcrypt.genSalt((saltError, salt) => {
  //       if (saltError) { return next(saltError); }
    
  //       return bcrypt.hash(user.password, salt, (hashError, hash) => {
  //         if (hashError) { return next(hashError); }
    
  //         // replace a password string with hash value
  //         user.password = hash;
    
  //         return next();
  //       });
  //     });
  // });




  UserSchema.pre('save', function saveHook(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    return bcrypt.genSalt((saltError, salt) => {
      if (saltError) { return next(saltError); }
  
      return bcrypt.hash(user.password, salt, (hashError, hash) => {
        if (hashError) { return next(hashError); }
  
        // replace a password string with hash value
        user.password = hash;
  
        return next();
      });
    });
});


  


  
  
  

  


const User = module.exports = mongoose.model('User', UserSchema);