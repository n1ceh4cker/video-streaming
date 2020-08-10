const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const bcryptjs = require('bcryptjs')
const User = require('../model/User')

passport.use(new localStrategy({usernameField: 'email'}, (email, password, done)=>{
    User.findOne({ email:email }, (err,user)=>{
        if(err) return done(err)
        else if(user!=null){
            bcryptjs.compare(password, user.password,(err,result)=>{
                if(err) return done(err)
                else if(result) return done(null, user)
                else return done(null, false, { message: 'password incorrect' })
            })
        }
        else return done(null, false, { message: 'user does not exist' })
    })
}))

passport.serializeUser((user,done)=>{
    done(null, user.id)
})
passport.deserializeUser((id,done)=>{
    User.findById(id,(err, user)=>{
        done(err, user)
    })
})
module.exports = passport