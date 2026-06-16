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
async function searchUserByEmail(req, res) {
  try {
    const { email } = req.query;

    if (!["NUTRITIONIST", "COACH"].includes(req.user?.role)) {
      return res.status(403).json({
        error: "Apenas nutricionistas ou treinadores podem buscar usuarios por email",
      });
    }

    if (!email) {
      return res.status(400).json({
        error: "email e obrigatorio",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuario nao encontrado",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuario por email:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        athleteProfile: true, // 🚀 CORREÇÃO: Garante a entrega do perfil e da idade para o frontend
        team: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // Remove a senha por segurança antes de responder à API
    const { password, ...secureUser } = user;

    return res.status(200).json(secureUser);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

// atualiza um usuário existente
// Substitua APENAS a função updateUser dentro do seu src/controllers/userController.js
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, role, teamId, age, sport, athleteCode } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (!name || !email || !role) {
      return res.status(400).json({ error: "name, email e role são obrigatórios" });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "role inválida" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email já está em uso" });
    }

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });
      if (!team) {
        return res.status(404).json({ error: "Equipe não encontrada" });
      }
    }

    const data = {
      name,
      email,
      role,
      teamId: teamId || null,
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    // 🚀 SALVAMENTO RELACIONAL ATIVO: Força a gravação de age e sport no Prisma Studio
    if (role === "ATHLETE" && age !== undefined) {
      const computedCode = athleteCode || `ATL-${Math.floor(100000 + Math.random() * 900000)}`;
      
      await prisma.athleteProfile.upsert({
        where: { userId: id },
        update: {
          age: parseInt(age, 10),
          sport: sport || "Geral",
          teamId: teamId
        },
        create: {
          userId: id,
          teamId: teamId,
          athleteCode: computedCode,
          age: parseInt(age, 10),
          sport: sport || "Geral"
        }
      });
    }

    // Atualiza o utilizador e devolve a árvore relacional completa para o app fixar no cache
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
        athleteProfile: true, // Acopla o perfil atualizado
        team: true
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ error: error.message });
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
// Substitua APENAS a function loginUser dentro do seu src/controllers/userController.js
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email e password são obrigatórios" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        athleteProfile: true, // Garante a injeção do perfil no login
        team: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        athleteProfile: user.athleteProfile, // Repassa a árvore ao frontend
        team: user.team
      },
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createUser,
  listUsers,
  searchUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
};
