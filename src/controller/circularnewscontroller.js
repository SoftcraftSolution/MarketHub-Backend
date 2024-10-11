const CircularNews = require('../model/circularnews.model');

const multer = require('multer');
const Admin = require('../model/user.model'); 
const { cloudinary } = require('../middleware/imageupload');





exports.CircularNews = async (req, res) => {
    try {
        // Extract data from the request body
        const { addTitle, addContent, addLink, adminPhoneNumber, shareNews } = req.query;

        // Parse shareNews if it's coming as a JSON string
        const shareNewsArray = Array.isArray(shareNews) ? shareNews : JSON.parse(shareNews || "[]");

        // Log the req.files object to see the uploaded files
        console.log('Uploaded files:', req.files);

        // Prepare to store URLs
        let imageUrl = null;
        let pdfUrl = null;

        // Check if image file is present and upload to Cloudinary using buffer
        if (req.files['image'] && req.files['image'][0]) {
            // Upload image buffer to Cloudinary
            const imageUploadResponse = await cloudinary.uploader.upload(`data:${req.files['image'][0].mimetype};base64,${req.files['image'][0].buffer.toString('base64')}`, {
                folder: 'images',
                resource_type: 'image'
            });
            imageUrl = imageUploadResponse.secure_url; // Get the image URL from the result
        }

        // Check if PDF file is present and upload to Cloudinary using buffer
        if (req.files['pdf'] && req.files['pdf'][0]) {
            // Upload PDF buffer to Cloudinary
            const pdfUploadResponse = await cloudinary.uploader.upload(`data:${req.files['pdf'][0].mimetype};base64,${req.files['pdf'][0].buffer.toString('base64')}`, {
                folder: 'pdfs',
                resource_type: 'raw' // Specify it's a raw file type
            });
            pdfUrl = pdfUploadResponse.secure_url; // Get the PDF URL from the result
        }

        // Log the URLs obtained
        console.log('Uploaded image URL:', imageUrl);
        console.log('Uploaded PDF URL:', pdfUrl);

        // Create a new CircularNews document
        const newCircularNews = new CircularNews({
            addTitle,
            addContent,
            addLink,
            adminPhoneNumber,
            shareNews: shareNewsArray,
            image: imageUrl,
            pdf: pdfUrl,
        });

        // Save the new document to the database
        await newCircularNews.save();

        // Send a success response with the uploaded data
        res.status(201).json({
            message: 'News uploaded successfully',
            circularNews: {
                addTitle: newCircularNews.addTitle,
                createdAt: newCircularNews.createdAt,
                addContent: newCircularNews.addContent,
                addLink: newCircularNews.addLink,
                adminPhoneNumber: newCircularNews.adminPhoneNumber,
                shareNews: newCircularNews.shareNews,
                image: newCircularNews.image,
                pdf: newCircularNews.pdf,
            }
        });
    } catch (error) {
        console.error('Error while adding circular news:', error);
        res.status(500).json({ message: 'An error occurred while uploading news.' });
    }
};



  