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
} = require("../controllers/userController");

const router = Router();

router.get("/", (req, res) => {
  return res.json({
    message: "SweatApp API funcionando",
  });
});

// Rotas para equipes
router.get("/teams", listTeams);
router.post("/teams", createTeam);
router.get("/teams/:id", getTeamById);
router.put("/teams/:id", updateTeam);
router.delete("/teams/:id", deleteTeam);

// Rotas para usuários
router.post("/users", createUser);
router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;