const prisma = require("../lib/prisma");

const validRoles = ["ATHLETE", "COACH", "NUTRITIONIST"];

async function createUser(req, res) {
  try {
    const { name, email, password, role, teamId } = req.body;

    // validação básica
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: "name, email, password e role são obrigatórios",
      });
    }

    // validar role
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "role inválida",
      });
    }

    // verificar email duplicado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email já está em uso",
      });
    }

    // opcional: validar teamId
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        return res.status(404).json({
          error: "Equipe não encontrada",
        });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        teamId: teamId || null,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  createUser,
};