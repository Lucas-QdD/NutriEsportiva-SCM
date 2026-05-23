const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('./dev.db');

async function main() {
  try {
    console.log('Criando dados padrão direto no SQLite...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // IDs simulando cuid/uuid
    const equipeId = 'team_123';
    const usuarioId = 'user_123';
    const profileId = 'prof_123';

    // 1. Inserir Time Padrão (ignorando se já existe)
    db.prepare(`
      INSERT INTO "Equipe" (id, nome, codigo, atualizadoEm)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(codigo) DO UPDATE SET nome=excluded.nome;
    `).run(equipeId, 'Time Principal', 'TIME_001');

    // 2. Inserir Atleta (ignorando se já existe)
    db.prepare(`
      INSERT INTO "Usuario" (id, nome, email, senha, papel, equipeId, atualizadoEm)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(email) DO UPDATE SET nome=excluded.nome;
    `).run(usuarioId, 'Atleta Teste', 'atleta@email.com', hashedPassword, 'ATLETA', equipeId);

    // 3. Inserir PerfilAtleta
    db.prepare(`
      INSERT INTO "PerfilAtleta" (id, usuarioId, equipeId, codigoAtleta, idade, esporte, atualizadoEm)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(usuarioId) DO UPDATE SET idade=excluded.idade;
    `).run(profileId, usuarioId, equipeId, 'ATL_123', 25, 'Futebol');

    console.log('\n✅ Seed executado com sucesso!');
    console.log('Atleta padrão criado:');
    console.log('Email: atleta@email.com');
    console.log('Senha: 123456');

  } catch (error) {
    console.error('Erro ao executar o seed:', error);
  }
}

main();
