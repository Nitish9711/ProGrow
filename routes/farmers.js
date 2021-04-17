const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const Farmer = require('../models/farmer');
const Stock = require("../models/Stock");
const Land = require('../models/Land');
const upload = require('../config/multer');
const Sold = require('../models/Sold');
const Request = require('../models/Request');

router.get('/login',authentication.ensureNoLogin,(req,res) => {
    res.render('farmers/login');
});

router.post('/login',authentication.ensureNoLogin,passport.authenticate('farmerLocal',{failureRedirect: '/farmers/login'}),(req,res) => {
    res.redirect('/farmers/dashboard');
})

router.get('/signup',authentication.ensureNoLogin,(req,res) => {
    res.render('farmers/signup');
})

router.post('/',authentication.ensureNoLogin,upload.single('image'),wrapAsync(async (req,res) => {
    const {password} = req.body;
    const farmer = new Farmer(req.body);
    if(req.file) farmer.image=`/images/uploads/${req.file.filename}`;
    try{
        await Farmer.register(farmer,password);
        req.login(farmer,err => {
            if(err) throw err;
            else res.redirect('/farmers/dashboard');
        })
    }catch(err){
        if(req.file) await fs.unlink(`/images/uploads/${req.file.filename}`);
        throw err;
    }
}))

router.get('/dashboard',authentication.ensureLogin,authorization.ensureFarmer,wrapAsync(async (req,res) => {
    const stocks = await Stock.find({farmer: req.user._id});
    const solds = await Sold.find({farmer: req.user._id});
    const lands = await Land.find({farmer: req.user._id});
    const requests = [];

    let totalAmount = 0, soldAmount = 0;
    for(const stock of stocks) totalAmount+=stock.qty.amount;
    for(const sold of solds) soldAmount+=sold.qty.amount;

    res.render('farmers/dashboard',{
        stocks,
        lands,
        stats: {
            stock: {
                total: totalAmount,
                sold: soldAmount
            }
        }
    });
}))


router.get('/addStock',authentication.ensureLogin,authorization.ensureFarmer, wrapAsync(async (req,res) => {
    res.render('farmers/stock/addStock'); 
}))

router.post('/stock',authentication.ensureLogin,authorization.ensureFarmer,upload.single('image'),wrapAsync(async (req,res) => {
    const stock = new Stock(req.body);
    if(req.file) stock.image = `/images/uploads/${req.file.filename}`;
    stock.farmer = req.user._id;
    await stock.save()
    res.redirect('/farmers/dashboard');
}))

router.get('/land/new',authentication.ensureLogin,authorization.ensureFarmer,(req,res) => {
    res.render('farmers/land/addLand');
})

router.post('/land',authentication.ensureLogin,authorization.ensureFarmer,upload.single('image'),wrapAsync(async (req,res) => {
    const land = new Land(req.body);
    land.farmer = req.user._id;
    if(req.file) land.image=`/images/uploads/${req.file.filename}`;
    await land.save();
    res.redirect('/farmers/dashboard');
}))

router.get('/contractRequested',authentication.ensureLogin,authorization.ensureFarmer, wrapAsync(async (req,res) => {
    const requests = [];
    const lands = await Land.find({farmer: req.user._id});
    for(const land of lands){
        const reqs = await Request.find({land: land._id});
        for(const req of reqs){
            if(!req.accepted) requests.push(req);
        }
    }
    for(const req of requests){
        await req.populate('land').execPopulate();
        await req.populate('contractor').execPopulate();
    }
    res.render('farmers/contracts/contractRequested',{requests});
}))
router.get('/contractFormed',authentication.ensureLogin,authorization.ensureFarmer, wrapAsync(async (req,res) => {
    const requests = [];
    const lands = await Land.find({farmer: req.user._id});
    for(const land of lands){
        const reqs = await Request.find({land: land._id});
        for(const req of reqs){
            if(req.accepted) requests.push(req);
        }
    }
    for(const req of requests){
        await req.populate('land').execPopulate();
        await req.populate('contractor').execPopulate();
    }
    res.render('farmers/contracts/contractFormed',{requests});
}))
router.get('/stockList',authentication.ensureLogin,authorization.ensureFarmer, wrapAsync(async (req,res) => {
    const stocks = await Stock.find({farmer: req.user._id});
    res.render('farmers/stock/stockList',{stocks}); 
}))
router.get('/soldList',authentication.ensureLogin,authorization.ensureFarmer, wrapAsync(async (req,res) => {
    const solds = await Sold.find({farmer: req.user._id});
    for(const sold of solds){
        await sold.populate('Stock').execPopulate();
        await sold.populate('contractor').execPopulate();
    }
    res.render('farmers/sold/soldList', {solds});
}))
router.get('/landList',authentication.ensureLogin,authorization.ensureFarmer,wrapAsync(async (req,res) => {
    const lands = await Land.find({farmer: req.user._id});
    res.render('farmers/land/landList',{lands});
}))
router.get('/contact',authentication.ensureLogin,authorization.ensureFarmer, wrapAsync(async (req,res) => {
    res.render('farmers/contact'); 
}))

router.delete('/requests/:id',authentication.ensureLogin,authorization.ensureFarmer,wrapAsync(async (req,res) => {
    await Request.findByIdAndDelete(req.params.id);
    res.redirect('/farmers/contractRequested');
}))
router.put('/requests/:id',authentication.ensureLogin,authorization.ensureFarmer,wrapAsync(async (req,res) => {
    await Request.findByIdAndUpdate(req.params.id, {accepted: true}, { upsert: true })
    res.redirect('/farmers/contractRequested');
}))



module.exports = router;