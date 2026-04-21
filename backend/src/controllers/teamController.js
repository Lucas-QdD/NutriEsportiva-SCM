const prisma = require("../lib/prisma");

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
      error: "Erro interno ao listar equipes",
    });
  }
}

async function createTeam(req, res) {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        error: "Os campos name e code são obrigatórios",
      });
    }

    const existingTeam = await prisma.team.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });

    if (existingTeam) {
      return res.status(409).json({
        error: "Já existe uma equipe com esse nome ou código",
      });
    }

    const team = await prisma.team.create({
      data: {
        name,
        code,
      },
    });

    return res.status(201).json(team);
  } catch (error) {
    console.error("Erro ao criar equipe:", error);

    return res.status(500).json({
      error: "Erro interno ao criar equipe",
    });
  }
}

module.exports = {
  listTeams,
  createTeam,
};