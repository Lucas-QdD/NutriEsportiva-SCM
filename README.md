# SweatApp

O SweatApp é um projeto acadêmico voltado ao monitoramento da taxa de sudorese e apoio à tomada de decisão em hidratação de atletas.

A proposta do sistema é permitir o registro de dados antes, durante e após sessões de treino, processar essas informações e fornecer recomendações individualizadas com base no histórico do atleta e no contexto ambiental.

---

## Arquitetura do sistema

O projeto foi estruturado em um modelo cliente-servidor com três camadas principais:

- **Mobile** → Aplicativo para o atleta (React Native)
- **Web** → Painel para treinador e nutricionista (Next.js)
- **Backend** → API REST compartilhada (Node.js + Express)

O backend centraliza as regras de negócio, o acesso ao banco de dados e a comunicação entre as interfaces.

---

## Estrutura
- `mobile/` aplicativo do atleta
- `web/` painel do treinador/nutricionista
- `backend/` API compartilhada
- `docs/` documentação do projeto


---

## Tecnologias utilizadas

### Backend
- Node.js
- Express
- Prisma ORM
- SQLite
- better-sqlite3
- dotenv
- cors
- nodemon

---

## Status atual do projeto

O backend já possui:

- servidor Express configurado
- estrutura modular inicial (`src/`)
- Prisma configurado com SQLite
- banco de dados local via migrations
- modelagem inicial das entidades
- integração funcional com o banco
- rota de teste (`/`)
- rota de leitura (`GET /teams`)

---

## Modelagem inicial do banco

As principais entidades do sistema são:

- `User`
- `Team`
- `AthleteProfile`
- `TrainingSession`
- `HydrationRecord`
- `HydrationResult`

A modelagem foi definida para suportar o fluxo principal do sistema e poderá ser evoluída ao longo do projeto.

---

## Execução do projeto (backend)

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd SweatApp
2. Acessar o backend
cd backend
3. Instalar dependências
npm install
4. Configurar variáveis de ambiente

Criar um arquivo .env na pasta backend:

DATABASE_URL="file:./dev.db"
5. Gerar o Prisma Client
npx prisma generate
6. Criar e sincronizar o banco de dados
npx prisma migrate dev --name init
7. Iniciar o servidor
npm run dev

A aplicação estará disponível em:

http://localhost:3333
Endpoints disponíveis
Health check
GET /

Resposta:

{
  "message": "SweatApp API funcionando"
}
Listar equipes
GET /teams

Resposta esperada (sem dados):

[]
Scripts disponíveis
npm run dev

Executa o servidor com reload automático (nodemon)

npm start

Executa o servidor em modo padrão

Considerações importantes
O arquivo dev.db não é versionado
O arquivo .env não é versionado
Cada integrante deve gerar seu banco localmente
O projeto utiliza estrutura de monorepositório
Os comandos do backend devem ser executados dentro da pasta backend
