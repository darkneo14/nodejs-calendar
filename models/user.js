var mongoose=require('mongoose');
var bcrypt = require('bcrypt');
var Schema=mongoose.Schema;


var UserSchema = mongoose.Schema({
    name : String,
    password: {type: String, select: false},
    email : {type:String, unique : true },
});

UserSchema.pre('save', function(next) {

    var user = this;
    console.log(user);
    if (!user.isModified('password'))
    {
      return next();
    }
    bcrypt.genSalt(10, function(err, salt){
      console.log("halual",salt)
      bcrypt.hash(user.password, salt, function (err, hash) {
          if(err){
            console.log(err);
            return next(err);

          }
          user.password = hash;
          console.log("here");
          next();

      });
    })
});

UserSchema.methods.comparePassword = function(password) {

    var user = this;

    var a = bcrypt.compareSync(password, user.password);

    if (a == true)
        return true;
    else {
        // console.log('error in compare password');
        return false;
    }

}

var User = mongoose.model('User', UserSchema);


module.exports = User;