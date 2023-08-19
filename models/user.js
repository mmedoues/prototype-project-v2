var mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const confiq=require('../config/config').get(process.env.NODE_ENV);
const bcrypt=require('bcrypt');
const salt=10;

const userSchema=mongoose.Schema({
    FirstName:{
        type: String,
        required: true,
        maxlength: 100
    },
    LastName:{
        type: String,
        required: true,
        maxlength: 100
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password:{
        type:String,
        required: true,
        minlength:8
    },
    token:{
        type: String
    },
    birthdate: {
        type: Date,
        dateOnly: true
      },
    level:{
        type:String
    },
    country:{
        type:String
    }
});
// to signup a user
userSchema.pre('save',function(next){
    var user=this;
    
    if(user.isModified('password')){
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                user.password2=hash;
                next();
            })

        })
    }
    else{
        next();
    }
});

//to login
userSchema.methods.comparepassword=function(password,cb){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(next);
        cb(null,isMatch);
    });
}

// generate token

// generate token
userSchema.methods.generateToken = function(secretOrPrivateKey, cb) {
    var user = this;
    var token = jwt.sign({ _id: user._id.toHexString() }, secretOrPrivateKey); // Update the sign function to pass the payload as an object
  
    user.token = token;
    user.save(function(err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  };
  

// find by token
userSchema.statics.findByToken=function(token,cb){
    var user=this;

    jwt.verify(token,confiq.SECRET,function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};

//delete token

userSchema.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}


module.exports=mongoose.model('User',userSchema);