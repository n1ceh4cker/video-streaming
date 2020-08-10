const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
let options = {
	key: fs.readFileSync('./config/client-key.pem'),
	cert: fs.readFileSync('./config/client-cert.pem')
}
const server = https.createServer(options, app)
const video = require('./routes/videoRouter')
const { user } = require('./routes/userRouter')
const flash = require('express-flash')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
require('./config/passport-config')

app.set('view-engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended:false }))
app.use(session({
	secret: 'MY_SECRET',
	resave: false,
	saveUninitialized: false
}))
app.use(flash())
app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	res.locals.error = req.flash('error')
	next();
})
app.use(passport.initialize())
app.use(passport.session())
app.use('/', video)
app.use('/auth', user)
mongoose.connect('mongodb://localhost/video-player?retryWrites=true&w=majority',{useUnifiedTopology:true, useNewUrlParser:true},(err)=>{
	if(err) console.log(err)
	else console.log('db connected...')
})
server.listen(3000, () =>{
    console.log('server listening in port 3000...')
})