const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

router.post("/send-email", (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    const contentHTML = `
    <h1>Formulario de contacto</h1>
    <ul>
        <li>Nombre: ${nombre}</li>
        <li>E-mail: ${email}</li>
        <li>Asunto: ${asunto}</li>
    </ul>
    <p>${mensaje}</p>
  `;

    const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    async function sendMail() {
        try {
            let accessToken = await oAuth2Client.getAccessToken();
            if (oAuth2Client.isTokenExpiringSoon()) {
                const { token } = await oAuth2Client.getAccessToken();
                oAuth2Client.setCredentials({ access_token: token });
                accessToken = token;
            }
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user: "leviapages@gmail.com",
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            const mailOptions = {
                from: "Web SPS Ambulancias <leviapages@gmail.com>",
                to: "leviaconecta@gmail.com",
                subject: "Formulario web",
                html: contentHTML,
            };

            const result = await transporter.sendMail(mailOptions);

            console.log("Correo electrónico a enviar:", contentHTML);
            return result;
        } catch (err) {
            res.redirect("/error.html");
        }
    }
    sendMail()
        .then(result => res.status(200).redirect("/success.html"))
        .catch(error => console.log(error.message));
});

module.exports = router;