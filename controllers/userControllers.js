import { check, validationResult } from "express-validator";
import { generateId } from "../helpers/tokens.js";
import { registerEmail } from "../helpers/emails.js";
import User from "../models/User.js";

const formLogin = (req, res) => {
    res.render('auth/login', {
        page: "Iniciar sesión"
    });
};

const formCreateAccount = (req, res) => {
    res.render('auth/createAccount', {
        page: "Crear una cuenta",
        csrfToken: req.csrfToken(),
    });
};

const create = async (req, res) => {
    // Validación de campos
    await check('name').notEmpty().withMessage('El nombre no puede ir vacío <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 162px; display: inline-block;" />').run(req);
    await check('email').isEmail().withMessage('Por favor, ingrese un correo electrónico válido. <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 10px; display: inline-block;" />').run(req);
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres. <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 12px; display: inline-block;" />').run(req);
    await check('repeat-password').custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 143px; display: inline-block;" />').run(req);

    await check('birthDate')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser válida <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 85px; display: inline-block;" />')
    .custom(value => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--; 
        }
        if (age < 18) {
            throw new Error('Debes ser mayor de edad para registrarte <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 85px; display: inline-block;" />');
        }
        return true;
    })
    .run(req);
    
    let result = validationResult(req);

    // Verificar si hay errores de validación
    if (!result.isEmpty()) {
        return res.render('auth/createAccount', {
            page: "Crear una cuenta",
            csrfToken: req.csrfToken(),
            errors: result.array(),
            user: {
                name: req.body.name,
                email: req.body.email,
                birthDate: req.body.birthDate,
            }
        });
    }

    // Extraer los datos del formulario
    const { name, email, password, birthDate } = req.body;

    // Verificar si el usuario ya existe
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
        return res.render('auth/createAccount', {
            page: "Crear una cuenta",
            errors: [{ msg: `El usuario asociado al correo ${req.body.email} ya existe` }],
            csrfToken: req.csrfToken(),
            user: {
                 name,
                 email,
                 birthDate
            }
        });
    }

    // Almacenar un nuevo usuario
    const user = await User.create({
        name,
        email,
        password,
        birthDate,
        token: generateId()
    });

    // Enviar correo de confirmación
    registerEmail({
        name: user.name,
        email: user.email,
        token: user.token
    });

    // Mostrar mensaje de confirmación
    res.render('template/message', {
        page: 'Cuenta creada',
        msg: `Se ha enviado un email de confirmación a: ${email}, por favor, ingrese al siguiente enlace`
    });
};

const confirmAccount = async (req, res) => {
    const { token } = req.params;

    try {
        // Verificar si el token es válido
        const user = await User.findOne({ where: { token } });

        if (!user) {
            return res.render('auth/confirm_Account', {
                page: 'Error al confirmar tu cuenta',
                csrfToken: req.csrfToken(),
                msg: '¡Ups!, algo ha salido mal, inténtalo de nuevo',
                error: true
            });
        }

        // Confirmar la cuenta: eliminar el token y marcar la cuenta como confirmada
        user.token = null;
        user.confirm = 1;
        await user.save(); // Guardar los cambios en la base de datos

        // Mostrar mensaje de confirmación
        res.render('auth/confirm_Account', {
            page: 'Cuenta Confirmada',
            msg: 'La cuenta se confirmó correctamente. Ya puedes loguearte.',
            error: false
        });
    } catch (error) {
        console.error(error);
        res.render('auth/confirm_Account', {
            page: 'Error al confirmar tu cuenta',
            csrfToken: req.csrfToken(),
            msg: 'Hubo un problema al confirmar tu cuenta. Inténtalo nuevamente.',
            error: true
        });
    }
};

const formPasswordRecovery = (req, res) => {
    res.render('auth/passwordRecovery', {
        page: "Recupera tu contraseña",
        csrfToken: req.csrfToken(),
    });
};

const forgetPassword = async (req, res) => {
    // Validación de campos
    await check('email').isEmail().withMessage('Por favor, ingrese un correo electrónico válido. <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 10px; display: inline-block;" />').run(req);
   
    let result = validationResult(req);

    // Verificar si hay errores de validación
    if (!result.isEmpty()) {
        return res.render('auth/createAccount', {
            page: "Crear una cuenta",
            csrfToken: req.csrfToken(),
            errors: result.array(),
            user: {
                name: req.body.name,
                email: req.body.email,
                birthDate: req.body.birthDate,
            }
        });
    }
}

export {
    formLogin,
    forgetPassword,
    formCreateAccount,
    formPasswordRecovery,
    confirmAccount,
    create
};
