const express = require('express');
const router = express.Router();
const adminController = require('../controller/admincontroller');
const { upload } = require('../middleware/imageupload');
const selfController = require('../controller/selfcontroller');
const circularController = require('../controller/circularnewscontroller');
const extendedtrailController = require('../controller/extendedtrailcontroller');
const newsListController=require('../controller/newslistcontroller')
const technicalNewsController=require('../controller/technicalnewscontroller')

 

// Admin Authentication APIs
router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/verify-code', adminController.verifyCode);
router.post('/reset-password', adminController.resetPassword);
router.get('/approved-user', adminController.approveAdmin);
router.get('/user-list', adminController.getUserList);

// News Section APIs
router.post('/add-self-news', upload, selfController.addSelfNews); // Handle image upload for self news
router.post('/circular-news', upload, circularController.CircularNews); // Handle multiple file uploads for circular news

// Extended Trail API
router.post('/extended-trail', extendedtrailController.extendedPlan);
router.get('/get-self-news',newsListController.selfnewsList);
router.get('/get-circular-news',newsListController.circularnewsList);
router.post('/technical-news',upload,technicalNewsController.technicalNews);
router.get('/get-technical-news',technicalNewsController.technicalNewsList)
router.get('/get-news-list',circularController.getNewsList)
router.get('/get-insights-news',circularController.getInsightNews)


// Export the router
module.exports = router;
