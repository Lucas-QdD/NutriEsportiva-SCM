const { Router } = require("express");
const { listTeams, 
    createTeam, 
    getTeamById, 
    updateTeam,
    deleteTeam,
} = require("../controllers/teamController");

const { createUser 
} = require("../controllers/userController");

const router = Router();

router.get("/", (req, res) => {
  return res.json({
    message: "SweatApp API funcionando",
  });
});

router.get("/teams", listTeams);
router.post("/teams", createTeam);
router.get("/teams/:id", getTeamById);
router.put("/teams/:id", updateTeam);
router.delete("/teams/:id", deleteTeam);
router.post("/users", createUser);

module.exports = router;