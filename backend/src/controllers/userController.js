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

async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

// busca um usuário específico pelo id
async function getUserById(req, res) {
  try {
    // id vem da rota (/users/:id)
    const { id } = req.params;

    // busca o usuário no banco pelo id
    const user = await prisma.user.findUnique({
      where: {
        id,
      },

      // selecionamos apenas os campos seguros 
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // se não encontrar, retorna erro 404
    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // retorna o usuário encontrado
    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

// atualiza um usuário existente
async function updateUser(req, res) {
  try {
    // id vem da rota (/users/:id)
    const { id } = req.params;

    // novos dados enviados no body
    const { name, email, password, role, teamId } = req.body;

    // verifica se o usuário existe antes de tentar atualizar
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // validação básica (mantendo simples por enquanto)
    if (!name || !email || !role) {
      return res.status(400).json({
        error: "name, email e role são obrigatórios",
      });
    }

    // valida role
    const validRoles = ["ATHLETE", "COACH", "NUTRITIONIST"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "role inválida",
      });
    }

    // verificar se outro usuário já usa esse email
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id }, // ignora o próprio usuário que está sendo atualizado
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email já está em uso",
      });
    }

    // valida teamId (se enviado)
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

    // atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        teamId: teamId || null,
        // password só será atualizada se for enviada
        ...(password && { password }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
};