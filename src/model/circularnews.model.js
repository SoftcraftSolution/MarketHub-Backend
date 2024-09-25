const mongoose = require('mongoose');

const circularNewsSchema = new mongoose.Schema({
    addTitle: {
        type: String,
        required: true,
    },
    addContent: {
        type: String,
        required: true,
    },
    addLink: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    pdf:{
        type: String,
    },
    adminPhoneNumber: {
        type: String,
        required: true,
    },
    shareNews: {
        type: [String], // Change to an array of strings
        enum: ['freeTrialUsers', 'extendedTrialUsers', 'standardTrailUsers', 'premiumTrailUsers', 'basicTrailUsers'],
    },
}, { timestamps: true });

const CircularNews = mongoose.model('CircularNews', circularNewsSchema);

module.exports = CircularNews;
