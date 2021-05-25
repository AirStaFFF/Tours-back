const nodemailer = require('nodemailer')


const sendEmail = async (options) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: "Max Ivanov <maxivanov200899@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transport.sendMail(mailOptions)
}

module.exports = sendEmail
