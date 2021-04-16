const AppError = require('../utils/AppError');

exports.ensureLogin = (req,res,next) => {
    if(req.isAuthenticated()) next();
    else throw new AppError('Please Login',401);
}

exports.ensureNoLogin = (req,res,next) => {
    if(req.isAuthenticated()) throw new AppError('Please Logout',403);
    next();
}