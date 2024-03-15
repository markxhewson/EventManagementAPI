const nodemailer = require('nodemailer');

const sendEmail = async (recipient, content) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: 'eventbloomauth@gmail.com',
            pass: 'TaHc0dtPwR17Zbnz'
        }
    });

    // Define email options
    const mailOptions = {
        from: '"Event Bloom" <eventbloomauth@gmail.com>',
        to: recipient,
        subject: 'Your Verification Code',
        text: content,
        html: '<strong>' + content + '</strong>'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = sendEmail;