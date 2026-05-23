const prisma = require("../lib/prisma");

async function listEquipes(req, res) {
  try {
    const equipes = await prisma.equipe.findMany({
      orderBy: {
        nome: "asc",
      },
    });

    return res.status(200).json(equipes);
  } catch (error) {
    console.error("Erro ao listar equipes:", error);

    return res.status(500).json({
      error: "Erro interno ao listar equipes",
    });
  }
}

async function createEquipe(req, res) {
  try {
    const { nome, codigo } = req.body;

    if (!nome || !codigo) {
      return res.status(400).json({
        error: "Os campos nome e codigo são obrigatórios",
      });
    }

    const existingEquipe = await prisma.equipe.findFirst({
      where: {
        OR: [{ nome }, { codigo }],
      },
    });

    if (existingEquipe) {
      return res.status(409).json({
        error: "Já existe uma equipe com esse nome ou código",
      });
    }

    const equipe = await prisma.equipe.create({
      data: {
        nome,
        codigo,
      },
    });

    return res.status(201).json(equipe);
  } catch (error) {
    console.error("Erro ao criar equipe:", error);

    return res.status(500).json({
      error: "Erro interno ao criar equipe",
    });
  }
}

async function getEquipeById(req, res) {
  try {
    const { id } = req.params;

    const equipe = await prisma.equipe.findUnique({
      where: {
        id,
      },
    });

    if (!equipe) {
      return res.status(404).json({
        error: "Equipe não encontrada",
      });
    }

    return res.status(200).json(equipe);
  } catch (error) {
    console.error("Erro ao buscar equipe:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

async function updateEquipe(req, res) {
  try {
    const { id } = req.params;
    const { nome, codigo } = req.body;

    if (!nome || !codigo) {
      return res.status(400).json({
        error: "Os campos nome e codigo são obrigatórios",
      });
    }

    const equipe = await prisma.equipe.findUnique({
      where: {
        id,
      },
    });

    if (!equipe) {
      return res.status(404).json({
        error: "Equipe não encontrada",
      });
    }

    const existingEquipe = await prisma.equipe.findFirst({
      where: {
        OR: [{ nome }, { codigo }],
        NOT: {
          id,
        },
      },
    });

    if (existingEquipe) {
      return res.status(409).json({
        error: "Já existe outra equipe com esse nome ou código",
      });
    }

    const updatedEquipe = await prisma.equipe.update({
      where: {
        id,
      },
      data: {
        nome,
        codigo,
      },
    });

    return res.status(200).json(updatedEquipe);
  } catch (error) {
    console.error("Erro ao atualizar equipe:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

async function deleteEquipe(req, res) {
  try {
    const { id } = req.params;

    const equipe = await prisma.equipe.findUnique({
      where: {
        id,
      },
    });

    if (!equipe) {
      return res.status(404).json({
        error: "Equipe não encontrada",
      });
    }

    await prisma.equipe.delete({
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
  listEquipes,
  createEquipe,
  getEquipeById,
  updateEquipe,
  deleteEquipe,
};