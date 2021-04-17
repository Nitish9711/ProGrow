const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const PassportLocal = require('passport-local');
const AppError = require('./utils/AppError');
const Contractor = require('./models/Contractor');
const Farmer = require('./models/farmer');
const contractorsRouter = require('./routes/contractors');
const farmersRouter = require('./routes/farmers');
const authentication = require('./middleware/authentication');
const methodOverride = require('method-override');

(async function(){
    try{
        await mongoose.connect('mongodb+srv://nitish_kumar:1234567890@cluster0.xt7ds.mongodb.net/progrow?retryWrites=true&w=majority',{
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB is running...');
    }catch(err){
        console.log(err);
        process.exit(1);
    }
})();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(session({
    name: 'session',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 60*60*24*7
    }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use('farmerLocal',new PassportLocal(Farmer.authenticate()));
passport.use('contractorLocal',new PassportLocal(Contractor.authenticate()));
passport.serializeUser(function(user,done){
    done(null,user);
});
passport.deserializeUser(function(user,done){
    if(user) done(null,user);
})

app.use((req,res,next) => {
    res.locals.user = req.user;
    next();
})

app.get('/',(req,res) => {
    res.render('landing');
});

app.use('/farmers',farmersRouter);
app.use('/contractors',contractorsRouter);

app.post('/logout',authentication.ensureLogin,(req,res) => {
    req.logout();
    res.redirect('/');
})
app.get('/terms', (req, res) => {
    res.render('termsAndCond')
})
app.get('/about',(req,res) => {
    res.render('about');
})

app.get('/contact',(req,res) => {
    res.render('contact');
})

app.use((req,res) => {
    throw new AppError('Not found', 404);
})

app.use((err,req,res,next) => {
    if(!err.status) err.status = 500;
    if(!err.message) err.message = 'Something went wrong';
    res.status(err.status).render('error',{err});
});

const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Server is running on port ${port}...`)); 