import { Request } from "express";
import nodemailer, { Transporter } from "nodemailer";

export async function sendMail(email: string, firstName: string, bodyHtml: string, emailSubject: string) {
    const transporter: Transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
            user: "787671001@smtp-brevo.com",
            pass: "I5dWzcJ8k1qxYDTs"
        }
    });

    var mailOptions;
    let sender = 'glintflashcards@gmail.com';
    mailOptions = {
        from: sender,
        to: email,
        subject: emailSubject,
        html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #16dc65;
            color: #ffffff;
            text-align: center;
            padding: 20px 0;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .button-container {
            margin: 20px 0;
            text-align: center;
        }
        .button {
            background-color: #16dc65;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        a:visited {
            text-decoration: none;
            color: #fff;
        }
        .footer {
            background-color: #f4f4f4;
            color: #888888;
            text-align: center;
            padding: 20px;
            font-size: 12px;
        }
        .footer a {
            color: #16dc65;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email</h1>
        </div>
        <div class="content">
            <p>Hi ${firstName},</p>
            ${bodyHtml}
        </div>
    </div>
</body>
</html>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent ' + info.response);
    } catch (error) {
        console.error('Error sending email ' + error);
    }
};

const urlReqPerspective = (req: Request) => req.protocol + '://' + req.get('host');

export function sendEmailVerificationCode(code: string, email: string, firstName: string, req: Request) {
    let link = `${urlReqPerspective(req)}/verify?code=${code}`;
    let emailSubject = "Email Verification"

    let bodyHtml = `<p>Thank you for signing up with Glint.</p>
            <p>Please click the button below to verify your email address, or manually input the verification code: <b>${code}</b></p>
            <div class="button-container">
                <a href="${link}" class="button">Verify Email</a>
            </div>
            <p>If you did not create an account with us, please ignore this email.</p>`;

    sendMail(email, firstName, bodyHtml, emailSubject);
}

export function sendEmailPasswordUpdateCode(code: string, email: string, firstName: string, req: Request) {
    let link = `${urlReqPerspective(req)}/updatePassword?user_code=${code}`;
    let emailSubject = "Password Recovery Request"

    let bodyHtml = `<p>This is a request to change your Glint account's password. Please click the button below change your password.</p>
            <div class="button-container">
                <a href="${link}" class="button">Change Password</a>
            </div>
            <p>If you did not order a request to change your password, please ignore this email.</p>`;

    sendMail(email, firstName, bodyHtml, emailSubject);
}