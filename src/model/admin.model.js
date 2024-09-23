const mongoose = require('mongoose');

// Define the registration schema with timestamps
const AdminSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    otp: {
        type: String,
    },

}, { timestamps: true });

// Create the model from the schema
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
