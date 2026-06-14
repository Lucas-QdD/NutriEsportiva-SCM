const prisma = require("../lib/prisma");

async function createTrainingSession(data) {

    const {
        athleteId,
        sessionDate,
        durationMin,
        measurementMethod,
    } = data;

    if (!athleteId || !sessionDate || !measurementMethod) {
        throw new Error(
            "athleteId, sessionDate e measurementMethod são obrigatórios"
        );
    }

    if (durationMin <= 0) {
        throw new Error(
            "Duração do treino inválida"
        );
    }

    const athlete = await prisma.athleteProfile.findUnique({
        where: {
            id: athleteId,
        },
    });

    if (!athlete) {
        throw new Error(
            "Atleta não encontrado"
        );
    }

    const session = await prisma.trainingSession.create({
        data : {
            athleteId,
            sessionDate: new Date(sessionDate),
            durationMin,
            measurementMethod,
        },
    });

    return session;
}

module.exports = {
    createTrainingSession,
};