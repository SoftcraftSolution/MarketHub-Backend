const mongoose = require('mongoose');

const technicalnewsSchema = new mongoose.Schema({
    addTitle: {
        type: String,
      
    },
    addContent: {
        type: String,
       
    },
    addLink: {
        type: String,
   
    },
    image: {
        type: String,
   
    },
    email: {
        type: String,
       
    },
    shareNews: {
        type: [String], // Change to an array of strings
        enum: ['freeTrialUsers', 'extendedTrialUsers', 'standardTrailUsers', 'premiumTrailUsers', 'basicTrailUsers'],
    },
}, { timestamps: true });

const technicalnews= mongoose.model('TechnicalNews', technicalnewsSchema);

module.exports = technicalnews;
