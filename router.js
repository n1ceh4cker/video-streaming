const router = require('express').Router()
const request = require('request')
const e = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

let filename = ''
const storage = multer.diskStorage({
	destination: (req, file, cb)=>{
		cb(null, 'uploads')
	},
	filename: (req, file, cb)=>{
        filename = file.fieldname + '-' + Date.now() + '.mp4'
		cb(null, filename)
	}
})

const maxSize = 10*1024*1024
const upload = multer({
	storage: storage,
	limits: { fileSize: maxSize },
	fileFilter: (req, file, cb)=>{
		const filetype = /mp4/
		const mimetype = filetype.test(file.mimetype)
		const extname = filetype.test(path.extname(file.originalname.toLowerCase()))
		if(mimetype && extname) return cb(null,true)
		cb('file can be only mp4 type')
	}
}).single('myvideo')

router.get('/',(req,res)=>{
    const options = {
        method: 'GET',
        url: 'https://dev.vdocipher.com/api/videos',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Apisecret 0fSSCjtWzvm6UCJS1rSHEK7ikkCcHhy1m6803sxiEt9cqDCRR3lDxlMsa0sxojXe'
        }
    }
    request(options,(error, response, body)=>{
        if(error){
            console.log(error)
        }else{
        
            res.render('index.ejs',{videos: JSON.parse(body).rows} )
        }

    })
})

router.get('/play/:id', (req,res)=>{
    const id = req.params.id
    const options = {
        method: 'POST',
        url: `https://dev.vdocipher.com/api/videos/${id}/otp`,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Apisecret 0fSSCjtWzvm6UCJS1rSHEK7ikkCcHhy1m6803sxiEt9cqDCRR3lDxlMsa0sxojXe'
        },
        body:{
            ttl:3000
        },
        json: true
    }
    request(options,(error, response, body)=>{
        if(error){
            console.log(error)
        }else{
           
            res.render('play.ejs',{video: body} )
        }

    })
})
router.post('/upload',(req,res)=>{
    console.log(`https://${req.hostname}:3000/cb`)
    let options = {}
    upload(req, res ,(err)=>{
        if(err){
            console.log(err)
            res.redirect('/')
        }else{
            options = {
                method: 'PUT',
                url: 'https://dev.vdocipher.com/api/videos',
                qs:{
                    title: req.body.title
                },
                headers: {
                    Authorization: 'Apisecret 0fSSCjtWzvm6UCJS1rSHEK7ikkCcHhy1m6803sxiEt9cqDCRR3lDxlMsa0sxojXe'
                }
            }
            request(options,(error, response, body)=>{
                if(error){
                    console.log(error)
                    res.redirect('/')
                }else{
                    if(typeof JSON.parse(body).message=='string'){
                        req.flash('error_msg',JSON.parse(body).message)
                        res.redirect('/')
                    }else{
                        const clientPayload = JSON.parse(body).clientPayload
                        options = {
                            method: 'POST',
                            url: clientPayload.uploadLink,
                            headers: { 'content-type': 'multipart/form-data '},
                            formData:{
                                policy: clientPayload['policy'],
                                key: clientPayload['key'],
                                'x-amz-signature': clientPayload['x-amz-signature'],
                                'x-amz-algorithm': clientPayload['x-amz-algorithm'],
                                'x-amz-date': clientPayload['x-amz-date'],
                                'x-amz-credential': clientPayload['x-amz-credential'],
                                success_action_status: '201',
                                success_action_redirect: `https://${req.hostname}:3000/cb`,
                                file: fs.createReadStream('./uploads/' + filename) 
                            }
                        }
                        request(options, (error, response, body)=>{
                            if(error){
                                console.log(error)
                                res.redirect('/')
                            }else{
                                console.log(body)
                                req.flash('success_msg', 'Video uploaded successfully')
                                res.redirect('/')
                            }
                        })
                    }          
                }
        
            })
        }
    })
    
})

router.get('/cb',(req, res)=>{
    req.flash('success_msg', 'Video uploaded successfully')
    res.redirect('/')
})

module.exports = router