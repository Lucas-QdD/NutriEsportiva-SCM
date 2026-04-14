const prisma = require('../lib/prisma');

async function listTeams(req, res) {
  try {
    const teams = await prisma.team.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(teams);
  } catch (error) {
    console.error("Erro ao listar equipes:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
    listTeams,
};
