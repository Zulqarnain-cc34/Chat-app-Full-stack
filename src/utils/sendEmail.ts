import nodemailer from "nodemailer";

export const sendEmail = async (to: string, text: string) => {
    let testAccount = await nodemailer.createTestAccount();
    //console.log(testAccount);

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    let info = await transporter.sendMail({
        from: "support@gmail.com", // sender address
        to: to, // list of receivers
        subject: "forgot password", // Subject line
        html: text, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
