const jwt = require("jsonwebtoken");

// middleware responsável por validar o token JWT
function authMiddleware(req, res, next) {
  try {
    // pega o header Authorization da requisição
    const authHeader = req.headers.authorization;

    // se não existir header, bloqueia acesso
    if (!authHeader) {
      return res.status(401).json({
        error: "Token não informado",
      });
    }

    // o formato esperado é: Bearer TOKEN
    const parts = authHeader.split(" ");

    // valida se o formato do header está correto
    if (parts.length !== 2) {
      return res.status(401).json({
        error: "Token mal formatado",
      });
    }

    const [scheme, token] = parts;

    // verifica se o esquema é Bearer
    if (scheme !== "Bearer") {
      return res.status(401).json({
        error: "Token mal formatado",
      });
    }

    // valida e decodifica o token
    const decoded = jwt.verify(token, "segredo-super-seguro");

    // salva os dados do usuário na requisição para uso futuro
    req.user = decoded;

    // libera para a próxima etapa (rota)
    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido",
    });
  }
}

module.exports = authMiddleware;