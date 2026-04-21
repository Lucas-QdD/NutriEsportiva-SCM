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