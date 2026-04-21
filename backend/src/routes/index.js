const { Router } = require("express");
const { listTeams, 
    createTeam, 
    getTeamById, 
    updateTeam,
} = require("../controllers/teamController");


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

module.exports = router;