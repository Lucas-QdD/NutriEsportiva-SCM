const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validRoles = ["ATHLETE", "COACH", "NUTRITIONIST"];

async function createUser(req, res) {
  try {
    const { name, email, password, role, teamId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: "name, email, password e role são obrigatórios",
      });
    }

    const validRoles = ["ATHLETE", "COACH", "NUTRITIONIST"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "role inválida",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email já está em uso",
      });
    }

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

    // criptografa a senha antes de salvar no banco
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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

    const data = {
      name,
      email,
      role,
      teamId: teamId || null,
    };

    // Mantem a senha criptografada quando ela for atualizada.
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    // atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
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

// remove um usuário existente
async function deleteUser(req, res) {
  try {
    // id vem da rota (/users/:id)
    const { id } = req.params;

    // verifica se o usuário existe antes de deletar
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // remove o usuário do banco
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Usuário removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

// realiza login do usuário
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // validação básica
    if (!email || !password) {
      return res.status(400).json({
        error: "email e password são obrigatórios",
      });
    }

    // busca usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // compara senha informada com senha criptografada
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Senha incorreta",
      });
    }

    // gera token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET, 
      {
        expiresIn: "1d",
      }
    );

    // retorna usuário (sem senha) + token
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
      },
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);

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
  deleteUser,
  loginUser,
};
