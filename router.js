const router = require('express').Router()
const request = require('request')
const e = require('express')
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
    let options = {
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
        }else{
            console.log(JSON.parse(body))
            if(typeof JSON.parse(body).message=='string'){
                req.flash('error_msg',JSON.parse(body).message)
                res.redirect('/')
            }else{
                const clientPayload = JSON.parse(body).clientPayload
                res.render('upload.ejs', { clientPayload })
            }          
        }

    })
})

router.get('/cb',(req, res)=>{
    req.flash('success_msg', 'Video uploaded successfully')
    res.redirect('/')
})

module.exports = router