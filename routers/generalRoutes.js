import express from 'express';
const router = express.Router();

router.get("/", function(req, res){
    res.send("Hola Mundo desde Node, a travé s del Navegador")
})


router.get("/QuienSoy", function(req, res){
    res.json({"Esstudiante": "Daniel de Jesús Bravo Godínez", 
        "Carrera": "TI DSM",
        "Grado": "4°",
        "Grupo": "B",
        "Asignatura": "Aplicaciones Web Orientada a Servicios (AWOS)"
    })
})


export default router