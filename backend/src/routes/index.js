const { Router } = require("express");
const { listTeams, createTeam, getTeamById,}
 = require("../controllers/teamController");


const router = Router();

router.get("/", (req, res) => {
  return res.json({
    message: "SweatApp API funcionando",
  });
});

router.get("/teams", listTeams);
router.post("/teams", createTeam);
router.get("/teams/:id", getTeamById);

module.exports = router;