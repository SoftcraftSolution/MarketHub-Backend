const express = require('express');
const router = express.Router();
const adminController=require('../controller/admincontroller')
const { uploadImage, uploadPdf } = require('../middleware/imageupload');
const selfController=require('../controller/selfcontroller')
const circularController=require('../controller/circularnewscontroller')

router.post('/register',adminController.register)
router.post('/login', adminController.login);

router.post('/forgot-password',adminController.forgotPassword)
router.post('/verify-code',adminController.verifyCode)
router.post('/reset-password',adminController.resetPassword)
router.get('/approved-user',adminController.approveAdmin)
router.get('/user-list',adminController.getUserList)

//NEWS SECTION API


const multer = require('multer');

// Set up multer for file uploads

router.post('/add-self-news',uploadImage ,selfController.addSelfNews)

router.post('/circular-news', uploadImage, circularController.CircularNews);

module.exports = router;