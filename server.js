const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// BASE DE DATOS
// ======================

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.log("Error al conectar base de datos");
    } else {
        console.log("Base de datos conectada");
    }
});

// Crear tabla usuarios
db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
`);

// ======================
// MIDDLEWARES
// ======================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "virtualvetsecret",
    resave: false,
    saveUninitialized: false
}));

// Archivos estáticos
//app.use(express.static(__dirname));
// Archivos públicos
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/servicios", express.static(path.join(__dirname, "servicios")));

// ======================
// RUTAS PÚBLICAS
// ======================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/registro.html", (req, res) => {
    res.sendFile(path.join(__dirname, "registro.html"));
});

app.get("/servicios.html", (req, res) => {
    res.sendFile(path.join(__dirname, "servicios.html"));
});

// ======================
// RUTA PROTEGIDA
// ======================

app.get("/agendar.html", verificarAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "agendar.html"));
});

app.get("/confirmacion.html", verificarAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "confirmacion.html"));
});

app.get("/agendar.html", verificarAuth);
// ======================
// REGISTRO
// ======================
function verificarAuth(req, res, next) {

    if (req.session.usuario) {
        next();
    } else {
        res.redirect("/login.html?error=auth");
    }
}
app.post("/registro", async (req, res) => {

    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
        return res.send("Completa todos los campos");
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO usuarios(nombre, correo, password)
         VALUES (?, ?, ?)`,
        [nombre, correo, hashedPassword],
        function(err) {

            if (err) {
                return res.redirect("/registro.html?error=correo");
            }

            res.redirect("/login.html");
        }
    );
});

// ======================
// LOGIN
// ======================

app.post("/login", (req, res) => {

    const { correo, password } = req.body;

    db.get(
        `SELECT * FROM usuarios WHERE correo = ?`,
        [correo],
        async (err, usuario) => {

            if (err || !usuario) {
                return res.redirect("/login.html?error=usuario");
            }

            const passwordCorrecta = await bcrypt.compare(
                password,
                usuario.password
            );

            if (!passwordCorrecta) {
                return res.redirect("/login.html?error=password");
            }

            // Guardar sesión
            req.session.usuario = {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo
            };

            res.redirect("/index.html");
        }
    );
});

// ======================
// OBTENER USUARIO LOGUEADO
// ======================

app.get("/usuario", (req, res) => {

    if (req.session.usuario) {
        res.json({
            logueado: true,
            usuario: req.session.usuario
        });
    } else {
        res.json({
            logueado: false
        });
    }
});

// ======================
// CERRAR SESIÓN
// ======================

app.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/index.html");
    });
});

// ======================
// INICIAR SERVIDOR
// ======================

app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
});