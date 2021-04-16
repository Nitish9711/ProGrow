const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// const contractorSchema = new mongoose.Schema({
//   userType: {
//     type: String,
//     required: true,
//     default: "Contractor",
//   },
//   name: {
//     first: {
//       type: String,
//       required: true,
//     },
//     last: {
//       type: String,
//       required: true,
//     },
//   },
//   phone: {
//     type: Number,
//     required: true,
//   },
//   aadhar: {
//     type: Number,
//     required: true
//   },
//   address: {
//     type: String,
//     required: true
//   },
//   image: String
// });
const contractorSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
    default: "Contractor",
  },
  name: {
    first: {
      type: String,
      required: true,
    },
    last: {
      type: String,
      required: true,
    },
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  aadhar: {
    type: Number,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  image: String,
  gender: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

contractorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Contractor", contractorSchema);
