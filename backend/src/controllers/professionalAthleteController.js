const prisma = require("../lib/prisma");

const PROFESSIONAL_ROLES = ["NUTRITIONIST", "COACH"];

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  teamId: true,
};

function isProfessional(user) {
  return user && PROFESSIONAL_ROLES.includes(user.role);
}

async function createProfessionalAthleteLink(req, res) {
  try {
    const professionalId = req.user?.id;
    const { athleteId } = req.body;

    if (!isProfessional(req.user)) {
      return res.status(403).json({
        error: "Apenas nutricionistas ou treinadores podem vincular atletas",
      });
    }

    if (!athleteId) {
      return res.status(400).json({
        error: "athleteId e obrigatorio",
      });
    }

    const [professional, athlete] = await Promise.all([
      prisma.user.findUnique({
        where: { id: professionalId },
        select: userSelect,
      }),
      prisma.user.findUnique({
        where: { id: athleteId },
        select: userSelect,
      }),
    ]);

    if (!professional || !isProfessional(professional)) {
      return res.status(403).json({
        error: "Usuario autenticado nao e um profissional valido",
      });
    }

    if (!athlete) {
      return res.status(404).json({
        error: "Atleta nao encontrado",
      });
    }

    if (athlete.role !== "ATHLETE") {
      return res.status(400).json({
        error: "O usuario informado nao possui role ATHLETE",
      });
    }

    const existingLink = await prisma.professionalAthleteLink.findFirst({
      where: {
        professionalId,
        athleteId,
      },
    });

    if (existingLink) {
      return res.status(409).json({
        error: "Atleta ja vinculado a este profissional",
      });
    }

    const link = await prisma.professionalAthleteLink.create({
      data: {
        professionalId,
        athleteId,
      },
      include: {
        athlete: {
          select: userSelect,
        },
      },
    });

    return res.status(201).json(link);
  } catch (error) {
    console.error("Erro ao vincular atleta:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

async function listProfessionalAthleteLinks(req, res) {
  try {
    if (isProfessional(req.user)) {
      const links = await prisma.professionalAthleteLink.findMany({
        where: {
          professionalId: req.user.id,
        },
        include: {
          athlete: {
            select: userSelect,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(links);
    }

    if (req.user?.role === "ATHLETE") {
      const links = await prisma.professionalAthleteLink.findMany({
        where: {
          athleteId: req.user.id,
        },
        include: {
          professional: {
            select: userSelect,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(links);
    }

    return res.status(403).json({
      error: "Role nao autorizada",
    });
  } catch (error) {
    console.error("Erro ao listar vinculos:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

async function deleteProfessionalAthleteLink(req, res) {
  try {
    const { id } = req.params;

    if (!isProfessional(req.user)) {
      return res.status(403).json({
        error: "Apenas nutricionistas ou treinadores podem remover vinculos",
      });
    }

    const link = await prisma.professionalAthleteLink.findUnique({
      where: { id },
    });

    if (!link) {
      return res.status(404).json({
        error: "Vinculo nao encontrado",
      });
    }

    if (link.professionalId !== req.user.id) {
      return res.status(403).json({
        error: "Este vinculo pertence a outro profissional",
      });
    }

    await prisma.professionalAthleteLink.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Vinculo removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover vinculo:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  createProfessionalAthleteLink,
  listProfessionalAthleteLinks,
  deleteProfessionalAthleteLink,
};
