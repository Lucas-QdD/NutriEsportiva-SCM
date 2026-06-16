const prisma = require("../lib/prisma"); // 🚀 CORREÇÃO: Importa a instância do Prisma adaptada ao SQLite
const trainingSessionService = require("../services/trainingSessionService");

async function createTrainingSession(req, res) {
    try {
        const {
            athleteId,
            sessionDate,
            durationMin,
            measurementMethod,
        } = req.body;

        const session = await trainingSessionService.createTrainingSession({
            athleteId,
            sessionDate,
            durationMin,
            measurementMethod,
        });

        return res.status(201).json(session);

    } catch (error) {
        console.error("Erro ao criar sessão de treino:", error);

        return res.status(500).json({
            error: error.message,
        });
    }
}

// 🚀 Função de exclusão com a referência ao prisma corrigida
async function deleteTrainingSession(req, res) {
    try {
        const { id } = req.params;

        // Verifica se a sessão existe no SQLite antes de apagar
        const session = await prisma.trainingSession.findUnique({
          where: { id },
        });

        if (!session) {
          return res.status(404).json({ error: "Sessão de treino não encontrada" });
        }

        // Executa a limpeza relacional em transação atômica para o SQLite aceitar sem violar FK
        await prisma.$transaction([
          prisma.hydrationRecord.deleteMany({ where: { sessionId: id } }),
          prisma.hydrationResult.deleteMany({ where: { sessionId: id } }),
          prisma.trainingSession.delete({ where: { id } })
        ]);

        return res.status(200).json({ message: "Sessão e métricas hídricas removidas com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar sessão de treino:", error);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createTrainingSession,
    deleteTrainingSession,
};