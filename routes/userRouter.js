const router = require('express').Router()
const passport = require('passport')
const bcryptjs = require('bcryptjs')
const User = require('../model/User')

checkAuthenticated = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next()
    }
    req.flash('error_msg', 'please login first!!')
    res.redirect('/auth/login')
}

checkSuperAuthenticated = (req, res, next)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            return next()
        }
        req.flash('error_msg', 'you are not authorized for this!!')
        res.redirect('/')
    }
    else{
        res.redirect('/auth/login')
    }
    
}
checkNotAuthenticated = (req, res, next)=>{
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}


router.get('/register', checkNotAuthenticated, (req, res)=>{
    res.render('register.ejs')
})
router.post('/register', checkNotAuthenticated, (req, res)=>{
    let errors = []
    const { name, email, password, password2 } = req.body
    if(email==''||name==''||password==''||password2=='') errors.push({ msg: 'fill all field' })
    if(password!=password2) errors.push({ msg: 'passwords must be same' })
    if(errors.length>0){
        res.render('register.ejs',{
            errors,
            name,
            email,
            password,
            password2
        })
    }else{
        User.findOne({ email: email },(err, user)=>{
            if(err){
                errors.push({ msg: 'something went wrong' })
                res.render('register.ejs',{
                    errors,
                    name,
                    email,
                    password,
                    password2
                })      
            }else if(user){
                errors.push({ msg: 'email already registered!!' })
                res.render('register.ejs',{
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            }else{
                const user = new User({ name, email, password })
                bcryptjs.hash(password, 10, (err,hash)=>{
                    if(err){
                        errors.push({ msg: 'something went wrong' })
                        res.render('register.ejs',{
                            errors,
                            name,
                            email,
                            password,
                            password2
                        })   
                    }else{
                        user.password = hash
                        user.save((err, user)=>{
                            if(err){
                                console.log(err)
                                errors.push({ msg: 'something went wrong' })
                                res.render('register.ejs',{
                                    errors,
                                    name,
                                    email,
                                    password,
                                    password2
                                })   
                            }else{
                                req.flash('success_msg', 'registered successfully')
                                res.redirect('/auth/login')
                            }
                        })
                    }
                })
            }
        })
    }
})
router.get('/login', checkNotAuthenticated, (req, res)=>{
    res.render('login.ejs')
})
router.post('/login', checkNotAuthenticated, passport.authenticate('local',{
    failureRedirect: '/auth/login',
    failureFlash: true
}),(req, res)=>{
    if(req.user.isAdmin) res.redirect('/admin')
    else res.redirect('/')
})

router.get('/logout', (req, res)=>{
    req.logOut()
    res.redirect('/auth/login')
})

module.exports = {
    user: router,
    checkAuthenticated: checkAuthenticated,
    checkSuperAuthenticated: checkSuperAuthenticated    
}