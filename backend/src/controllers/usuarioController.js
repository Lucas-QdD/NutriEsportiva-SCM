const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validRoles = ["ATLETA", "TECNICO", "NUTRICIONISTA"];

async function createUsuario(req, res) {
  try {
    const { nome, email, senha, papel, equipeId } = req.body;

    if (!nome || !email || !senha || !papel) {
      return res.status(400).json({
        error: "nome, email, senha e papel são obrigatórios",
      });
    }

    const validRoles = ["ATLETA", "TECNICO", "NUTRICIONISTA"];

    if (!validRoles.includes(papel)) {
      return res.status(400).json({
        error: "papel inválida",
      });
    }

    const existingUsuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUsuario) {
      return res.status(409).json({
        error: "Email já está em uso",
      });
    }

    if (equipeId) {
      const equipe = await prisma.equipe.findUnique({
        where: { id: equipeId },
      });

      if (!equipe) {
        return res.status(404).json({
          error: "Equipe não encontrada",
        });
      }
    }

    // criptografa a senha antes de salvar no banco
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        papel,
        equipeId: equipeId || null,
      },
    });

    return res.status(201).json(usuario);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

async function listUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: {
        nome: "asc",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        equipeId: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

// busca um usuário específico pelo id
async function getUsuarioById(req, res) {
  try {
    // id vem da rota (/usuarios/:id)
    const { id } = req.params;

    // busca o usuário no banco pelo id
    const usuario = await prisma.usuario.findUnique({
      where: {
        id,
      },

      // selecionamos apenas os campos seguros 
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        equipeId: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    // se não encontrar, retorna erro 404
    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // retorna o usuário encontrado
    return res.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

// atualiza um usuário existente
async function updateUsuario(req, res) {
  try {
    // id vem da rota (/usuarios/:id)
    const { id } = req.params;

    // novos dados enviados no body
    const { nome, email, senha, papel, equipeId } = req.body;

    // verifica se o usuário existe antes de tentar atualizar
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // validação básica (mantendo simples por enquanto)
    if (!nome || !email || !papel) {
      return res.status(400).json({
        error: "nome, email e papel são obrigatórios",
      });
    }

    // valida papel
    const validRoles = ["ATLETA", "TECNICO", "NUTRICIONISTA"];

    if (!validRoles.includes(papel)) {
      return res.status(400).json({
        error: "papel inválida",
      });
    }

    // verificar se outro usuário já usa esse email
    const existingUsuario = await prisma.usuario.findFirst({
      where: {
        email,
        NOT: { id }, // ignora o próprio usuário que está sendo atualizado
      },
    });

    if (existingUsuario) {
      return res.status(409).json({
        error: "Email já está em uso",
      });
    }

    // valida equipeId (se enviado)
    if (equipeId) {
      const equipe = await prisma.equipe.findUnique({
        where: { id: equipeId },
      });

      if (!equipe) {
        return res.status(404).json({
          error: "Equipe não encontrada",
        });
      }
    }

    // atualiza o usuário
    const updatedUsuario = await prisma.usuario.update({
      where: { id },
      data: {
        nome,
        email,
        papel,
        equipeId: equipeId || null,
        // senha só será atualizada se for enviada
        ...(senha && { senha }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        equipeId: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return res.status(200).json(updatedUsuario);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

// remove um usuário existente
async function deleteUsuario(req, res) {
  try {
    // id vem da rota (/usuarios/:id)
    const { id } = req.params;

    // verifica se o usuário existe antes de deletar
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // remove o usuário do banco
    await prisma.usuario.delete({
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
async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body;

    // validação básica
    if (!email || !senha) {
      return res.status(400).json({
        error: "email e senha são obrigatórios",
      });
    }

    // busca usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // compara senha informada com senha criptografada usando bcrypt
    const senhaMatch = await bcrypt.compare(senha, usuario.senha);

    if (!senhaMatch) {
      return res.status(401).json({
        error: "Senha incorreta",
      });
    }

    // gera token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
      },
      process.env.JWT_SECRET, 
      {
        expiresIn: "1d",
      }
    );

    // retorna usuário (sem senha) + token
    return res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        equipeId: usuario.equipeId,
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
  createUsuario,
  listUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
};