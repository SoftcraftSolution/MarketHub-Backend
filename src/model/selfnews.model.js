const mongoose = require('mongoose');

const selfNewsSchema = new mongoose.Schema({
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
    adminPhoneNumber: {
        type: String,
        required: true,
    },
    shareNews: {
        type: [String], // Change to an array of strings
        enum: ['freeTrialUsers', 'extendedTrialUsers', 'standardTrailUsers', 'premiumTrailUsers', 'basicTrailUsers'],
    },
}, { timestamps: true });

const SelfNews = mongoose.model('SelfNews', selfNewsSchema);

module.exports = SelfNews;
