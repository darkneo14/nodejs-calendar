var jsonwebtoken = require('jsonwebtoken');
var config = require('../config');
var secretKey = config.secretKey;
var User = require('../models/user');


function createToken(user) {

    var token = jsonwebtoken.sign({
        _id: user._id,
        email: user.email
    }, secretKey, {
        expiresIn : 60*60*24
    });
    return token;
}



module.exports = {

      login : function (req,res,next){
        User.findOne({'email': req.body.email}).select('password').exec(function (err, user) {
            if (err)
                throw err;
            if (!user) {
                res.json({message: "User doesn't exist", success: false, userprofile: user});
            } else if (user) {
                var validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.json({message: "Invalid Password", success: false})
                }
                else {
                  user.email=req.body.email;
                  console.log(user);


                    var token = createToken(user);
                    res.json({
                        success: true,
                        message: "Successfully login",
                        token: token,
                        userid: user._id
                    });
                }
            }
        });
      },

      signup : function(req,res,next){
          var name = req.body.name;
          var email = req.body.email;
          var password = req.body.password;
          console.log(name,email,password);
          var newUser = new User();
          newUser.name = name;
          newUser.email = email;
          newUser.password = password;
          User.findOne({'email': email}, function(err, user){
            if(err){
              res.json({message: "Some Error Occured!! Please try again1", success: false})
            }
            if(user){
              res.json({message: "Email already Exits", success: false})
            } 
            else{
              newUser.save(function(err) {
                if(err){
                  console.log(err);
                  res.json({message: "Some Error Occured!! Please try again2", success: false})
                } else{
                  res.json({message: "User created Successfully", success: true})
                }
              })
            }
          })
      }

}