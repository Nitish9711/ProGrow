const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const Contractor = require('../models/Contractor');
const upload = require('../config/multer');
const fs = require('fs').promises;
const Stock = require("../models/Stock");
const Sold = require("../models/Sold");

router.get('/login',authentication.ensureNoLogin,(req,res) => {
    res.render('contractors/login');
});

router.post('/login',authentication.ensureNoLogin,passport.authenticate('contractorLocal',{failureRedirect: '/contractors/login'}),(req,res) => {
    res.redirect('/contractors/dashboard');
})

router.get('/signup',authentication.ensureNoLogin,(req,res) => {
    res.render('contractors/signup');
})

router.post('/',authentication.ensureNoLogin,upload.single('image'),wrapAsync(async (req,res) => {
    const {password} = req.body;
    const contractor = new Contractor(req.body);
    if(req.file) contractor.image = `/images/uploads/${req.file.filename}`;
    try{
        await Contractor.register(contractor,password);
        req.login(contractor,err => {
            if(err) throw err;
            else res.redirect('/contractors/dashboard');
        })
    }catch(err){
        if(req.file) await fs.unlink(`/images/uploads/${req.file.filename}`);
        throw err;
    }
}))

router.get('/dashboard',authentication.ensureLogin,authorization.ensureContractor,(req,res) => {
    res.render('contractors/dashboard');
})
router.post('/dashboard/stock',(req,res) => {
    
    
    console.log("data");
    Stock.find({}, function(err, data) {
        console.log(data);
        res.send(data);
    });
    

})

router.post('/buyStock',(req,res) => {
    qty = req.body.qty;
    _id = req.body._id;
//,authentication.ensureLogin,authorization.ensureContractor
    Stock.findById(_id)
    .then(data => {
        const newStock = data;
        console.log(newStock)
        newStock.qty.amount = newStock.qty.amount - qty;
        
        newQty = {
            amount: qty,
            unit: data.qty.unit
        }
        const sold = new Sold({
            // farmer : data.farmer,
            // contractor : req.user._id,
            qty : newQty,
            price : qty * data.price,
        });
        sold.save;
        Stock.findByIdAndUpdate(_id, newStock, {upsert: true});
    }).catch(err => console.log(err));
    res.json({msg:"success"})
})



















module.exports = router;