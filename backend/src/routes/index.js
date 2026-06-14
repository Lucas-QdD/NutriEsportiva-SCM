const { Router } = require("express");

const { listTeams, 
    createTeam, 
    getTeamById, 
    updateTeam,
    deleteTeam,
} = require("../controllers/teamController");

const { createUser, 
    listUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");

const hydrationController = require("../controllers/hydrationController");

const trainingSessionController = require("../controllers/trainingSessionController");

const athleteProfileController = require("../controllers/athleteProfileController");

const router = Router();

router.get("/", (req, res) => {
  return res.json({
    message: "SweatApp API funcionando",
  });
});

// rota pública de login
router.post("/login", loginUser);

// rotas públicas de cadastro (por enquanto)
router.post("/users", createUser);

// rotas protegidas de users
router.get("/users", authMiddleware, listUsers);
router.get("/users/:id", authMiddleware, getUserById);
router.put("/users/:id", authMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, deleteUser);

// rotas protegidas de teams
router.get("/teams", authMiddleware, listTeams);
router.get("/teams/:id", authMiddleware, getTeamById);
router.post("/teams", authMiddleware, createTeam);
router.put("/teams/:id", authMiddleware, updateTeam);
router.delete("/teams/:id", authMiddleware, deleteTeam);

// rotas do calculo da hidratação

router.post(
  "/hydration/calculate",
  authMiddleware,
  hydrationController.calcularHidratacao
);

// rotas do trainingSession

router.post(
  "/training-sessions",
  authMiddleware,
  trainingSessionController.createTrainingSession
);

// rotas do athleteProfile

router.post(
  "/athletes",
  authMiddleware,
  athleteProfileController.createAthleteProfile
);

module.exports = router;
