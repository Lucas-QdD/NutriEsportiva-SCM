const trainingSessionService = require("../services/trainingSessionService");

async function createTrainingSession(req, res) {
    
    try {
        const {
            athleteId,
            sessionDate,
            durationMin,
            measurementMethod,
        } = req.body;

        const session = await trainingSessionService.createTrainingSession({
            athleteId,
            sessionDate,
            durationMin,
            measurementMethod,
        });

        return res.status(201).json(session);

    } catch (error) {
        
        console.error(
            "Erro ao criar sessão de treino:",
            error
        );

        return res.status(500).json({
            error: error.message,
        });
    }
}

module.exports = {
    createTrainingSession,
};