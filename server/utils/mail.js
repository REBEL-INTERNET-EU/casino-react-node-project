var nodemailer = require('nodemailer')
var constants = require('../var/constants')

const transports = {
    gmail: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: constants.AUTH_FROM,
            pass: constants.GMAIL_PASS
        }
    }),
    default: nodemailer.createTransport({
        host: "smtp.mailtrap.io",
		port: 2525,
		auth: {
			user: constants.AUTH_USER,
			pass: constants.AUTH_PASS
		}
    })
}

function getTransport(email) {
    const domain = email.split('@')[1]
    if(domain){
        if (domain.includes('gmail.com')){
            return transports.gmail
        } else {
            return transports.gmail
        }
    } else {
        return transports.default
    }
}

function sendEmail(reason, e, data){
	return new Promise((resolve, reject)=>{
		if(!e.email){
			resolve({send: "email_no_send"})
		}		
		let user = e.user
		let email = e.email
		const transport = getTransport(email)

		let subject = ''
		let html = ''
        let success_message = "email_send"

        let mailOptions = {}

        switch (reason) {
            case "forgot_password":
                let lang = data.lang || 'ENG'
                switch (lang) {
                    case "DE":
                        subject = 'BunnyBet Passwort zurücksetzen'
                        html = html + "<p>Hallo " + user + "</p>"
                        html = html + "<p>Sie haben eine Passwortrücksetzung angefordert.</p>"
                        html = html + "<p>Ihr neues Passwort ist: <b>Password001!</b></p>"
                        html = html + "<p>Nachdem Sie sich angemeldet haben, setzen Sie bitte dieses Passwort auf Ihr eigenes zurück.</p>"
                        break
                    case "ES":
                        subject = 'BunnyBet restablecer contraseña'
                        html = html + "<p>Hola " + user + "</p>"
                        html = html + "<p>Has solicitado restablecer tu contraseña.</p>"
                        html = html + "<p>Su nueva contraseña es: <b>Password001!</b></p>"
                        html = html + "<p>Después de iniciar sesión, por favor restablezca esta contraseña con la suya propia.</p>"
                        break
                    case "FR":
                        subject = 'BunnyBet réinitialiser le mot de passe'
                        html = html + "<p>Bonjour " + user + "</p>"
                        html = html + "<p>Vous avez demandé à réinitialiser votre mot de passe.</p>"
                        html = html + "<p>Votre nouveau mot de passe est : <b>Password001!</b></p>"
                        html = html + "<p>Après vous être connecté, veuillez réinitialiser ce mot de passe avec le vôtre.</p>"
                        break
                    case "IT":
                        subject = 'BunnyBet reimposta password'
                        html = html + "<p>Ciao " + user + "</p>"
                        html = html + "<p>Hai richiesto di resettare la tua password.</p>"
                        html = html + "<p>La tua nuova password è: <b>Password001!</b></p>"
                        html = html + "<p>Dopo aver effettuato l'accesso, si prega di reimpostare questa password con la propria.</p>"
                        break
                    case "PT":
                        subject = 'BunnyBet redefinir senha'
                        html = html + "<p>Olá " + user + "</p>"
                        html = html + "<p>Você solicitou a redefinição de sua senha.</p>"
                        html = html + "<p>Sua nova senha é: <b>Password001!</b></p>"
                        html = html + "<p>Depois de fazer login, por favor redefina esta senha com a sua própria.</p>"
                        break
                    case "RO":
                        subject = 'BunnyBet resetare parolă'
                        html = html + "<p>Bună " + user + "</p>"
                        html = html + "<p>Ai cerut resetarea parolei tale.</p>"
                        html = html + "<p>Noua ta parolă este: <b>Password001!</b></p>"
                        html = html + "<p>După autentificare, vă rugăm să resetați această parolă cu cea proprie.</p>"
                        break
                    case "RU":
                        subject = 'BunnyBet сброс пароля'
                        html = html + "<p>Привет " + user + "</p>"
                        html = html + "<p>Вы запросили сброс пароля.</p>"
                        html = html + "<p>Ваш новый пароль: <b>Password001!</b>.</p>"
                        html = html + "<p>После входа в систему, пожалуйста, сбросьте этот пароль на свой собственный.</p>"
                        break
                    case "ZH":
                        subject = 'BunnyBet 重置密码'
                        html = html + "<p>你好 " + user + "</p>"
                        html = html + "<p>你请求重置密码。</p>"
                        html = html + "<p>您的新密码是：<b>Password001!</b></p>"
                        html = html + "<p>登录后，请将此密码更改为您自己的密码。</p>"
                        break
                    case "ENG":
                    default:
                        subject = 'BunnyBet reset password'
                        html = html + "<p>Hi " + user + "</p>"
                        html = html + "<p>You requested to reset your password.</p>"
                        html = html + "<p>You new password is: <b>Password001!</b>.</p>"
                        html = html + "<p>After you login, please reset this password with your own.</p>"
                        break
                }

                success_message = "email_send_mailtrap"

                mailOptions = {
                    from: constants.AUTH_FROM,
                    to: email,
                    subject: subject,
                    html: html
                }

                break
            case "contact":
                subject = e.subject
                html = html + "<p><b>email: </b> " + e.email + "</p>"
                html = html + "<p><b>About: </b> " + e.about + "</p>"
                html = html + "<p><b>Message: </b> " + e.message + "</p>"

                success_message = "email_send"

                mailOptions = {
                    from: email,
                    to: constants.AUTH_FROM,
                    subject: subject,
                    html: html
                }

                break
            case "withdraw":
                subject = reason

                html = html + "<p><b>id: </b> " + e.id + "</p>"
                html = html + "<p><b>uuid: </b> " + e.uuid + "</p>"
                html = html + "<p><b>amount: </b> " + e.amount + "</p>"
                html = html + "<p><b>currency: </b> " + e.currency + "</p>"
                html = html + "<p><b>name: </b> " + e.name + "</p>"
                html = html + "<p><b>phone: </b> " + e.phone + "</p>"
                html = html + "<p><b>email: </b> " + e.email + "</p>"
                html = html + "<p><b>country: </b> " + e.country + "</p>"
                html = html + "<p><b>city: </b> " + e.city + "</p>"
                html = html + "<p><b>iban: </b> " + e.iban + "</p>"

                success_message = "withdraw_success"

                mailOptions = {
                    from: email,
                    to: constants.AUTH_FROM,
                    subject: subject,
                    html: html
                }

                break             
        }
        
        if (Object.keys(mailOptions).length === 0) {
            transport.sendMail(mailOptions, (error, info)=>{                
                if (error) {
                    console.log('error--> ', error, mailOptions)
                    resolve({send: "email_no_send"})
                } else {
                    resolve({send: success_message})
                }
            })
        } else {
            console.log('error--> ', mailOptions)
            resolve({send: "email_no_send"})
        }
    })
}

function sendVerificationEmail(email, token) {
    return new Promise((resolve, reject) => {
        if (!email) {
            return resolve({ send: "email_no_send" });
        }

        // Determine the appropriate transport based on the email domain
        const transport = getTransport(email);

        // Compose the email subject and HTML body
        const subject = 'Please Verify Your Email Address';
        const html = `<p>Click the link below to verify your email address:</p>
                      <a href="${process.env.BASE_URL}/verify-email?token=${token}">Verify Email</a>`;

        // Mail options
        const mailOptions = {
            from: constants.AUTH_FROM,
            to: email,
            subject: subject,
            html: html
        };

        // Send the email using the selected transport
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending verification email:', error);
                resolve({ send: "email_no_send" });
            } else {
                console.log('Verification email sent:', info.response);
                resolve({ send: "email_send" });
            }
        });
    });
}

module.exports = {
	sendEmail,
    sendVerificationEmail,
}