const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // SMTP host
    port: 587,  
    service: 'gmail', // Use the email provider (e.g., Gmail)
    auth: {
        user: process.env.NODE_MAILER_EMAIL, // Your email address
        pass: process.env.NODE_MAILER_PASSWORD  // Your email password or app password
    }
});

module.exports=transporter