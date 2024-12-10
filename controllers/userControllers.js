import { check, validationResult } from "express-validator";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import { generateId } from "../helpers/tokens.js";
import { registerEmail, passwordRecoveryEmail } from "../helpers/emails.js";

// Mostrar formulario de inicio de sesión
const formLogin = (req, res) => {
  res.render("auth/login", {
    page: "Iniciar Sesión",
    csrfToken: req.csrfToken()
  });
};

// Autenticar usuario
const authenticate = async (req, res) => {
  // Validación de campos
  await check('email')
      .notEmpty().withMessage('El correo electrónico es un campo obligatorio')
      .isEmail().withMessage('Debe ser un correo válido')
      .run(req);
  await check('password')
      .notEmpty().withMessage('La contraseña es un campo obligatorio')
      .run(req);

  const resultado = validationResult(req);

  // Validar errores en los campos
  if (!resultado.isEmpty()) {
      return res.render('auth/login', {
          page: 'Error al intentar iniciar sesión',
          csrfToken: req.csrfToken(),
          errors: resultado.array(),
      });
  }

  const { email:email, password } = req.body;

  try {
      // Verificar si el usuario existe en la base de datos
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.render('auth/login', {
              page: 'Iniciar Sesión',
              csrfToken: req.csrfToken(),
              errors: [{ msg: 'El Usuario No Existe' }],
          });
      }

      // Verificar si el usuario está confirmado
      if (!user.confirm) {
          return res.render('auth/login', {
              page: 'Iniciar Sesión',
              csrfToken: req.csrfToken(),
              errors: [{ msg: 'Tu Cuenta no ha sido Confirmada' }],
          });
      }

      // Revisar el password
      if (!user.verificarPassword(password)) {
          return res.render('auth/login', {
              page: 'Iniciar Sesión',
              csrfToken: req.csrfToken(),
              errors: [{ msg: 'La Contraseña es Incorrecta' }],
          });
      }

      // Generar el token JWT
      const token = generarJWT({ id: user.id, nombre: user.name });

      // Almacenar el token en una cookie
      return res.cookie('_token', token, {
          httpOnly: true,
      }).redirect('/myProperties');
  } catch (error) {
      console.error(error);
      return res.status(500).render('auth/login', {
          page: 'Iniciar Sesión',
          csrfToken: req.csrfToken(),
          errors: [{ msg: 'Ocurrió un error inesperado. Intenta de nuevo.' }],
      });
  }
};

// Mostrar formulario de registro
const formCreateAccount = (req, res) => {
  res.render("auth/register", {
    page: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

// Mostrar formulario de recuperación de contraseña
const formPasswordRecovery = (req, res) => {
  res.render("auth/passwordRecovery", {
    page: "Recuperar Contraseña",
    csrfToken: req.csrfToken(),
  });
};

const create = async (req, res) => {
// Crear un nuevo usuario
await check('name').notEmpty().withMessage('El nombre no puede ir vacío <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 162px; display: inline-block;" />').run(req);
await check('email').isEmail().withMessage('Por favor, ingrese un correo electrónico válido. <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 10px; display: inline-block;" />').run(req);
await check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres. <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 12px; display: inline-block;" />').run(req);
await check('repeat-password').custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 143px; display: inline-block;" />').run(req);
await check('birthDate')
    .notEmpty().withMessage('La fecha de nacimiento no puede ir vacía <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 10px; display: inline-block;" />')
    .custom((value) => {
        const hoy = new Date();
        const fechaNacimiento = new Date(value);
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            return edad - 1 >= 18;
        }
        return edad >= 18;
    }).withMessage('Debes ser mayor de edad para registrarte <img src="/assets/error.png" alt="Error" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 10px; display: inline-block;" />').run(req);
let result = validationResult(req);

// Verificar si hay errores de validación
if (!result.isEmpty()) {
    return res.render('auth/register', {
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
    return res.render('auth/register', {
        page: "Error al intentar crear la Cuenta de Usuario",
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
res.render('templates/message', {
    page: 'Cuenta creada',
    msg: `Se ha enviado un email de confirmación a: ${email}, por favor, ingrese al siguiente enlace`
});
};

// Confirmar cuenta
const confirmAccount = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { token } });

  if (!user) {
    return res.render("auth/confirm_Account", {
      page: "Error",
      msg: "Token inválido",
      error: true,
    });
  }

  user.token = null;
  user.confirm = 1;
  await user.save();

  res.render("auth/confirm_Account", {
    page: "Cuenta Confirmada",
    msg: "Tu cuenta ha sido confirmada con éxito.",
    error: false,
  });
};

// Validar token para restablecimiento de contraseña
const checkToken = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ where: { token } });

  if (!user || !user.confirm) {
    return res.render("auth/confirm_Account", {
      page: "Restablece tu Contraseña...",
      msg: "Hubo un error al validar tu información. Verifica que tu cuenta esté confirmada.",
      error: true,
    });
  }

  // Formulario para modificar el password
  res.render("auth/reset-password", {
    page: "Restablece tu Contraseña",
    csrfToken: req.csrfToken(),
  });
};
const resetPassword = async (req, res) => {
  await check('email').notEmpty().withMessage('El correo electrónico es un campo obligatorio')
    .isEmail().withMessage('El correo electrónico no tiene el formato correcto')
    .run(req);

  const resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render('auth/passwordRecovery', {
      page: 'Recupera tu acceso a Bienes Raíces',
      csrfToken: req.csrfToken(),
      errors: resultado.array(),
    });
  }

  const { email } = req.body;

  // Buscar el usuario
  const user = await User.findOne({ where: { email } });

  if (!user || !user.confirm) {
    return res.render('auth/passwordRecovery', {
      page: 'Recupera tu acceso a Bienes Raíces',
      csrfToken: req.csrfToken(),
      errors: [{ msg: 'El correo no pertenece a un usuario confirmado o autenticado.' }],
    });
  }

  // Generar un token
  user.token = generateId();
  await user.save();

  // Enviar un Email
  passwordRecoveryEmail({
    email: user.email,
    name: user.name,
    token: user.token,
  });

  // Mostrar mensaje de confirmación
  res.render('templates/message', {
    page: 'Restablece tu Contraseña',
    msg: `Hemos enviado un email a ${email} con las instrucciones para restablecer tu contraseña.`,
  });
};

// Restablecer contraseña
const newPassword = async (req, res) => {
  // Validar el password
  await check("new_password")
    .notEmpty().withMessage("La contraseña es un campo obligatorio")
    .isLength({ min: 6 }).withMessage("El Password debe ser de al menos 6 caracteres")
    .run(req);
  await check("new_password2")
    .equals(req.body.new_password).withMessage("La contraseña debe coincidir con la anterior")
    .run(req);

  const resultado = validationResult(req);

  // Verificamos que el resultado esté vacío
  if (!resultado.isEmpty()) {
    return res.render("auth/reset-password", {
      page: "Reestablece tu Contraseña",
      csrfToken: req.csrfToken(),
      errors: resultado.array(),
    });
  }
  const { token } = req.params;
  const { new_password } = req.body;

  // Identificar quién hace el cambio
  const user = await User.findOne({ where: { token } });

  // Hashear el nuevo password
  user.password = new_password;
  user.token = null;
  await user.save();

  res.render("auth/confirm_Account", {
    page: "Password Reestablecido",
    msg: "El password se Guardó correctamente ",
  });
};

// Confirmar operación adicional
const confirm = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { token } });

  if (!user) {
    return res.render("auth/confirm_Account", {
      page: "Error",
      msg: "Token inválido",
      error: true,
    });
  }

  res.render("templates/message", {
    page: "Operación Confirmada",
    msg: `Operación confirmada para el usuario ${user.name}.`,
  });
};

export {
  formLogin,
  authenticate,
  formCreateAccount,
  formPasswordRecovery,
  create,
  resetPassword,
  confirmAccount,
  confirm,
  checkToken,
  newPassword,
};
