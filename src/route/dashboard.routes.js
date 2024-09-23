const express = require('express');
const router = express.Router();
const adminController=require('../controller/admincontroller')


router.post('/send-otp',adminController.sendOTPToAdmin)
router.post('/verify-otp',adminController.verifyOTPAdmin)
router.get('/approved-user',adminController.approveAdmin)
router.get('/user-list',adminController.getUserList)

module.exports = router;