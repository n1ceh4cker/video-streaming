const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
let options = {
	key: fs.readFileSync('./config/client-key.pem'),
	cert: fs.readFileSync('./config/client-cert.pem')
}
const server = https.createServer(options, app)
const router = require('./router')
const flash = require('express-flash')
const session = require('express-session')

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
app.use('/', router)

server.listen(3000, () =>{
    console.log('server listening in port 3000...')
})