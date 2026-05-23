const { Router } = require("express");

const { listEquipes, 
    createEquipe, 
    getEquipeById, 
    updateEquipe,
    deleteEquipe,
} = require("../controllers/equipeController");

const { createUsuario, 
    listUsuarios,
    getUsuarioById,
    updateUsuario,
    deleteUsuario,
    loginUsuario,
} = require("../controllers/usuarioController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.get("/", (req, res) => {
  return res.json({
    message: "SweatApp API funcionando",
  });
});

router.get("/", (req, res) => {
  return res.json({
    message: "SweatApp API funcionando",
  });
});

// rota pública de login
router.post("/login", loginUsuario);

// rotas públicas de cadastro (por enquanto)
router.post("/usuarios", createUsuario);

// rotas protegidas de usuarios
router.get("/usuarios", authMiddleware, listUsuarios);
router.get("/usuarios/:id", authMiddleware, getUsuarioById);
router.put("/usuarios/:id", authMiddleware, updateUsuario);
router.delete("/usuarios/:id", authMiddleware, deleteUsuario);

// rotas protegidas de equipes
router.get("/equipes", authMiddleware, listEquipes);
router.get("/equipes/:id", authMiddleware, getEquipeById);
router.post("/equipes", authMiddleware, createEquipe);
router.put("/equipes/:id", authMiddleware, updateEquipe);
router.delete("/equipes/:id", authMiddleware, deleteEquipe);

module.exports = router;