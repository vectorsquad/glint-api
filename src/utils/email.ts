import nodemailer, { Transporter } from "nodemailer";

const sendMail = async (email:string, firstName:string, bodyHtml:string) => {
    const transporter: Transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
            user: "773785001@smtp-brevo.com",
            pass: "FKaThAcJ0y7CwOzr"
        }
    });

    var mailOptions;
    let sender = 'jefferson.pvpgamer@gmail.com';
    mailOptions = {
        from: sender,
        to: email,
        subject: "Email verification",
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
            background-color: #007bff;
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
            background-color: #007bff;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            text-decoration: none;
        }
        .footer {
            background-color: #f4f4f4;
            color: #888888;
            text-align: center;
            padding: 20px;
            font-size: 12px;
        }
        .footer a {
            color: #007bff;
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

export default sendMail;