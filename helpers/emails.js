import nodemailer from 'nodemailer'
const registerEmail = async (data) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const {email, name, token} = data
    
    //enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Hola!, Confirma tu Cuente en BienesRacies.com',
        text: '¡Gracias por subscribirte a la comunidad de BienesRacices!',
        html:  `
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        .image {
            display: flex;
            justify-content: center;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #FFFFFF; /* primary */
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #FFFFFF; /* primary */
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            background-color: #606C38; /* natural */
            color: #FFFFFF; /* primary */
            text-align: start;
            padding: 20px;
            align-items: center;
        }
        .header h1 {
            margin: 0;
            margin-top: 30px;
            font-size: 28px;
        }
        .content {
            padding: 30px;
            text-align: justify;
            line-height: 1.8;
        }
        .content p {
            color: #000000; /* secondary */
            font-size: 16px;
            line-height: 1.5;
        }
        .button {
            text-align: center;
            margin: 20px 0;
        }
        .button a {
            background-color: #FAEBD7; /* accent */
            color: #000000; /* secondary */
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-size: 15px;
            display: inline-block;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s, transform 0.3s;
        }

        .button a:hover {
            background-color: #BC6C25; /* dark */
            transform: scale(1.05);
        }

        .footer {
            background-color: #FAEBD7; /* accent */
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #000000; /* secondary */
        }

        .footer p {
            margin: 0;
            color: #000000; /* secondary */
        }

        .container {
            border-top: 4px solid #606C38; /* natural */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BienesRaices.com</h1>
            <img width="100" height="100" src="https://img.icons8.com/?size=100&id=Jhy9yLtZWVXL&format=png&color=000000" alt="real-estate"/>
        </div>
        <div class="content">
            <p>¡Hola <strong>${name}</strong>!</p>
            <h2 style="text-align: center; color: #606C38;">¡Bienvenido a BienesRaices.com!</h2> <!-- natural -->
            <p>¡Estamos emocionados de darte la bienvenida a nuestra comunidad! En <strong>BienesRaices.com</strong>, trabajamos día a día para ofrecerte las mejores oportunidades en el mercado inmobiliario. Tanto si estás buscando el hogar de tus sueños como si deseas invertir, estás en el lugar ideal.</p>
            <p>Tu registro ha sido exitoso, y tu cuenta ya está lista. Solo falta un paso para comenzar: haz clic en el enlace a continuación para confirmar tu cuenta y acceder a todas las ventajas que ofrecemos:</p>
            <div class="button">
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirm_Account/${token}">Confirmar cuenta</a>
            </div>
            <p style="text-align: center;">Si no era para ti, simplemente ignora este correo.</p>
        </div>

        <div>
            <h3 style="text-align: center;">Atentamente</h3>
        </div>
        <div class="image">
            <img src="https://xdddd.s3.us-east-2.amazonaws.com/firma.png" alt="firma" width="170px" height="140px">
        </div>
        <div>
            <h4 style="text-align: center;">Daniel Bravo Godinez</h4>
            <h4 style="text-align: center;">CEO de Bienes Raices</h4>
        </div>
        
        </div>
    </div>
</body>
</html>

    `
    })
}


const passwordRecoveryEmail = async (data) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const { email, name, token } = data;

    // Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Recupera tu contraseña - BienesRaices.com',
        text: `Hola, ${name}. Hemos recibido una solicitud para restablecer tu contraseña.`,
        html: `
              <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        .image {
            display: flex;
            justify-content: center;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #FFFFFF; /* primary */
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #FFFFFF; /* primary */
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            background-color: #606C38; /* natural */
            color: #FFFFFF; /* primary */
            text-align: start;
            padding: 20px;
            align-items: center;
        }
        .header h1 {
            margin: 0;
            margin-top: 30px;
            font-size: 28px;
        }
        .content {
            padding: 30px;
            text-align: justify;
            line-height: 1.8;
        }
        .content p {
            color: #000000; /* secondary */
            font-size: 16px;
            line-height: 1.5;
        }
        .button {
            text-align: center;
            margin: 20px 0;
        }
        .button a {
            background-color: #FAEBD7; /* accent */
            color: #000000; /* secondary */
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-size: 15px;
            display: inline-block;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s, transform 0.3s;
        }

        .button a:hover {
            background-color: #BC6C25; /* dark */
            transform: scale(1.05);
        }

        .footer {
            background-color: #FAEBD7; /* accent */
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #000000; /* secondary */
        }

        .footer p {
            margin: 0;
            color: #000000; /* secondary */
        }

        .container {
            border-top: 4px solid #606C38; /* natural */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BienesRaices.com</h1>
            <img width="100" height="100" src="https://img.icons8.com/?size=100&id=Jhy9yLtZWVXL&format=png&color=000000" alt="real-estate"/>
        </div>
        <div class="content">
            <p>¡Hola <strong>${name}</strong>!</p>
            <h2 style="text-align: center; color: #606C38;">Recuperacion de cuenta de BienesRaices.com</h2>
            <p>Hemos recibido una peticion de solicitud de contraseña, no te preocupes, solo haz click abajo y sigue con el proceso para restablecer tu contraseña.</p>
            <div class="button">
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/passwordRecovery/${token}" class="button">Restablecer Contraseña</a>            </div>
            <p style="text-align: center;">Si no era para ti, simplemente ignora este correo.</p>
        </div>

        <div>
            <h3 style="text-align: center;">Atentamente</h3>
        </div>
        <div class="image">
            <img src="https://xdddd.s3.us-east-2.amazonaws.com/firma.png" alt="firma" width="170px" height="140px">
        </div>
        <div>
            <h4 style="text-align: center;">Daniel Bravo Godinez</h4>
            <h4 style="text-align: center;">CEO de Bienes Raices</h4>
        </div>
        
        </div>
    </div>
</body>
</html>
        `,
    });
};



export {
    registerEmail,passwordRecoveryEmail
}
