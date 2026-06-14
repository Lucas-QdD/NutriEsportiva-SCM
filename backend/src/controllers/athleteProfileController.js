const athleteProfileService = require("../services/athleteProfileService");

async function createAthleteProfile(req, res) {
    
    try {
        
        const {
            userId,
            teamId,
            athleteCode,
            age,
            sport,
        } = req.body;

        const athlete = await athleteProfileService.createAthleteProfile({
            userId,
            teamId,
            athleteCode,
            age,
            sport,
        });

        return res.status(201).json(athlete);

    } catch (error) {

        console.error(
            "Erro ao criar um perfil de atleta:",
            error
        );

        return res.status(500).json({
            error: error.message,
        });
    }
}

module.exports = {
    createAthleteProfile,
};