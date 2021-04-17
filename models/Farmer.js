const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// const farmerSchema = new mongoose.Schema({
//     // userType: {
//     //     type: String,
//     //     required: true,
//     //     default: 'Farmer'
//     // },
//     name: {
//         first: {
//             type: String,
//             required: true
//         },
//         last: {
//             type: String,
//             required: true
//         }
//     },
//     phone: {
//         type: Number,
//         required: true
//     },
//     aadhar: {
//         type: Number,
//         required: true
//     },
//     land: {
//         area: {
//             type: Number,
//             required: true
//         },
//         soil: {
//             type: String,
//             required: true
//         },
//         address: {
//             type: String,
//             required: true
//         },
//         products: [{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Product'
//         }]
//     },
//     image: String,
//     gender: {
//         type: String,
//         required: true,
//         enum: ['male','female','other']
//     }
// })
const farmerSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: true,
        default: "Farmer",
    },
    name: {
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },
    phone: {
        type: Number,
        required: true
    },
    accNumber: {
        type: Number,
        required: true
    },
    accHolder: {
        type: String,
        required: true,
    },
    ifsc: {
        type: String,
        required: true,
    },
    aadhar: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    image: String,
    gender: {
        type: String,
        required: true,
    },
    address:{
        village: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        }
    }
})

farmerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Farmer',farmerSchema);