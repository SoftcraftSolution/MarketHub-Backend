const express = require('express');
const router = express.Router();
const adminController=require('../controller/admincontroller')
const { uploadImage, uploadPdf } = require('../middleware/imageupload');
const selfController=require('../controller/selfcontroller')
const circularController=require('../controller/circularnewscontroller')

router.post('/send-otp',adminController.sendOTPToAdmin)
router.post('/verify-otp',adminController.verifyOTPAdmin)
router.get('/approved-user',adminController.approveAdmin)
router.get('/user-list',adminController.getUserList)

//NEWS SECTION API


const multer = require('multer');

// Set up multer for file uploads

router.post('/add-self-news',uploadImage ,selfController.addSelfNews)

router.post('/circular-news', uploadImage, circularController.CircularNews);

module.exports = router;