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

async function getTeamById(req, res) {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: {
        id,
      },
    });

    if (!team) {
      return res.status(404).json({
        error: "Equipe não encontrada",
      });
    }

    return res.status(200).json(team);
  } catch (error) {
    console.error("Erro ao buscar equipe:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

async function updateTeam(req, res) {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        error: "Os campos name e code são obrigatórios",
      });
    }

    const team = await prisma.team.findUnique({
      where: {
        id,
      },
    });

    if (!team) {
      return res.status(404).json({
        error: "Equipe não encontrada",
      });
    }

    const existingTeam = await prisma.team.findFirst({
      where: {
        OR: [{ name }, { code }],
        NOT: {
          id,
        },
      },
    });

    if (existingTeam) {
      return res.status(409).json({
        error: "Já existe outra equipe com esse nome ou código",
      });
    }

    const updatedTeam = await prisma.team.update({
      where: {
        id,
      },
      data: {
        name,
        code,
      },
    });

    return res.status(200).json(updatedTeam);
  } catch (error) {
    console.error("Erro ao atualizar equipe:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

async function deleteTeam(req, res) {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: {
        id,
      },
    });

    if (!team) {
      return res.status(404).json({
        error: "Equipe não encontrada",
      });
    }

    await prisma.team.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Equipe removida com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover equipe:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  listTeams,
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
};