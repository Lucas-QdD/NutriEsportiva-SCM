const prisma = require("../lib/prisma");

async function createAthleteProfile(data) {

    const {
        userId,
        teamId,
        athleteCode,
        age,
        sport,
    } = data;

    if (
        !userId ||
        !teamId ||
        !athleteCode ||
        age === undefined
    ) {
        throw new Error(
            "userId, teamId, athleteCode e age são obrigatórios"
        );
    }

    if (age <= 0) {
        throw new Error(
            "Idade inválida"
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new Error(
            "Usuário não encontrado"
        );
    }

    if (user.role !== "ATHLETE") {
        throw new Error(
            "O usuário precisa ter o papel ATHLETE"
        );
    }

    const existingAthlete = await prisma.athleteProfile.findUnique({
        where: {
            userId,
        },
    });

    if (existingAthlete) {
        throw new Error(
            "Este usuário já possui um perfil de atleta"
        );
    }

    const team = await prisma.team.findUnique({
        where: {
            id: teamId,
        },
    });

    if (!team) {
        throw new Error(
            "Equipe não encontrada"
        );
    }

    const existingCode = await prisma.athleteProfile.findUnique({
        where: {
            athleteCode,
        },
    });

    if(existingCode) {
        throw new Error(
            "Código do atleta já está em uso"
        );
    }

    const athleteProfile = await prisma.athleteProfile.create({
        data: {
            userId,
            teamId,
            athleteCode,
            age,
            sport,
        },
    });

    return athleteProfile;
}

module.exports = {
    createAthleteProfile,
};