const nodemailer = require('nodemailer');

const sendEmail = (subject, recipient, content) => {
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
        subject: subject,
        text: content,
        html: '<strong>' + content + '</strong>'
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', err);
                reject(error);
            } else {
                console.log('Email sent:', info.response);
                resolve(info);
            }
        });
    });
};

module.exports = sendEmail;