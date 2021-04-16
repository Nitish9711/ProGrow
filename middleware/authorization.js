const AppError = require('../utils/AppError');

exports.identifyUserType = (req,res,next) => {
    if(!req.find) req.find = {};
    if(req.user) req.find.userType = req.user.userType;
    next();
}

exports.ensureFarmer = (req,res,next) => {
    if(req.user.userType === 'Farmer') next();
    else throw new AppError('Forbidden',403);
}

exports.ensureContractor = (req,res,next) => {
    if(req.user.userType === 'Contractor') next();
    else throw new AppError('Forbidden',403);
}