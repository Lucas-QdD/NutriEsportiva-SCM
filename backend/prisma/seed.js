const prisma = require('../src/lib/prisma.js');
const bcrypt = require('bcrypt');

async function main() {
  try {
    console.log('Criando dados padrão...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const equipeId = 'team_123';
    const usuarioId = 'user_123';
    const profileId = 'prof_123';

    // 1. Inserir Time Padrão
    await prisma.team.upsert({
      where: { code: 'TIME_001' },
      update: { name: 'Time Principal' },
      create: {
        id: equipeId,
        name: 'Time Principal',
        code: 'TIME_001',
      },
    });

    // 2. Inserir Atleta
    await prisma.user.upsert({
      where: { email: 'atleta@email.com' },
      update: { name: 'Atleta Teste' },
      create: {
        id: usuarioId,
        name: 'Atleta Teste',
        email: 'atleta@email.com',
        password: hashedPassword,
        role: 'ATHLETE',
        teamId: equipeId,
      },
    });

    // 3. Inserir PerfilAtleta
    await prisma.athleteProfile.upsert({
      where: { userId: usuarioId },
      update: { age: 25 },
      create: {
        id: profileId,
        userId: usuarioId,
        teamId: equipeId,
        athleteCode: 'ATL_123',
        age: 25,
        sport: 'Futebol',
      },
    });

    // 4. Inserir Nutricionista
    await prisma.user.upsert({
      where: { email: 'nutri@email.com' },
      update: { name: 'Nutricionista Teste' },
      create: {
        id: 'user_nutri',
        name: 'Nutricionista Teste',
        email: 'nutri@email.com',
        password: hashedPassword,
        role: 'NUTRITIONIST',
        teamId: equipeId,
      },
    });

    console.log('\n✅ Seed executado com sucesso!');
    console.log('Atleta padrão criado:');
    console.log('Email: atleta@email.com');
    console.log('Senha: 123456');
    console.log('\nNutricionista padrão criado:');
    console.log('Email: nutri@email.com');
    console.log('Senha: 123456');

  } catch (error) {
    console.error('Erro ao executar o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
