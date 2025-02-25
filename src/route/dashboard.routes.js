const express = require('express');
const router = express.Router();
const adminController = require('../controller/admincontroller');
const { upload } = require('../middleware/imageupload');
const selfController = require('../controller/selfcontroller');
const circularController = require('../controller/circularnewscontroller');
const extendedtrailController = require('../controller/extendedtrailcontroller');
const newsListController=require('../controller/newslistcontroller')
const technicalNewsController=require('../controller/technicalnewscontroller')
const hindiNewsController=require('../controller/hindinewscontroller')

 

// Admin Authentication APIs
router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/verify-code', adminController.verifyCode);
router.post('/reset-password', adminController.resetPassword);
router.get('/approved-user', adminController.approveAdmin);
router.get('/user-list', adminController.getUserList);
router.delete('/delete-admin', adminController.deleteUser);

// News Section APIs
router.post('/add-self-news', upload, selfController.addSelfNews); // Handle image upload for self news
router.post('/circular-news', upload, circularController.CircularNews); 
router.delete('/delete-circular-news', circularController.deleteCircularNews);
router.delete('/delete-self-news', selfController.deleteSelfNews);


// Extended Trail API
router.post('/extended-trail', extendedtrailController.extendedPlan);
router.get('/get-self-news',newsListController.selfnewsList);
router.get('/get-circular-news',newsListController.circularnewsList);
router.post('/technical-news',upload,technicalNewsController.technicalNews);
router.get('/get-technical-news',technicalNewsController.technicalNewsList)
router.get('/get-news-list',circularController.getNewsList)
router.get('/get-insights-news',circularController.getInsightNews)


router.post('/add-hindi-news',upload,hindiNewsController.addHindiNews);
router.get('/get-hindi-news',hindiNewsController.getHindiNews);
router.delete('/delete-hindi-news',hindiNewsController.deleteHindiNews);
router.post('/update-hindi-news',upload,hindiNewsController.updateHindiNews);



// Export the router
module.exports = router;
