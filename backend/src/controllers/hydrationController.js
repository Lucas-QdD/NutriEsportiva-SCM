const hydrationService = require('../services/hydrationService');

async function calcularHidratacao(req, res) {

    try {

        const {
            sessionId,
            pesoInicial,
            pesoFinal,
            liquidoIngerido,
            temperatureC,
            humidityPercent,
            symptoms,
        } = req.body;

        if (
            !sessionId ||
            pesoInicial === null ||
            pesoFinal === null ||
            liquidoIngerido === null
        ) {
            return res.status(400).json({
                error:
                    "session Id, pesoInicial, pesoFinal e liquidoIngerido são obrigatórios",
            });
        }

        const resultado = await hydrationService.processarHidratacao({
            sessionId,
            pesoInicial,
            pesoFinal,
            liquidoIngerido,
            temperatureC,
            humidityPercent,
            symptoms,
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