const mongoose = require('mongoose');

// Define the registration schema with timestamps
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
      },
      phoneNumber:{
        type:String,
      },
      role:{
        type:String,
        enum: ['admin','superadmin'],
        default:'admin'
      },
      otp: {
        type: String,
        
    },
    access:{
      type:String,
      enum:['spotPrice','news',"all"]
    }

}, { timestamps: true });

// Create the model from the schema
const User = mongoose.model('User', UserSchema);

module.exports = User;
