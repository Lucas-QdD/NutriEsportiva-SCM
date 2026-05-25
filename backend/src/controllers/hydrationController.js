const hydrationService = require('../services/hydrationService');

async function calcularHidratacao(req, res) {

    try {

        const {
            pesoInicial,
            pesoFinal,
            liquidoIngerido,
            tempoExercicioMinutos,
        } = req.body;

        if (
            pesoInicial === null ||
            pesoFinal === null ||
            liquidoIngerido === null ||
            tempoExercicioMinutos === null
        ) {
            return res.status(400).json({
                error:
                    "pesoInicial, pesoFinal, liquidoIngerido e tempoExercicioMinutos são obrigatórios",
            });
        }

        const resultado = await hydrationService.processarHidratacao({
            pesoInicial,
            pesoFinal,
            liquidoIngerido,
            tempoExercicioMinutos,
        });

        return res.status(200).json(resultado);

    } catch (error) {

        console.error(
            "Erro ao calcular hidratação:", error
        );

        return res.status(500).json({
            error: error.message,
        });
    }
}

module.exports = {
    calcularHidratacao,
};