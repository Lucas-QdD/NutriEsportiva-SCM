const prisma = require("../lib/prisma");

const {
    calcularPerdaHidrica,
    calcularTaxaSudorese,
    calcularPercentualDesidratacao,
    calcularReposicaoPosTreino,
} = require("../utils/hydrationFormulas");

function determinarStatus (percentualDesidratacao) {
    
    if (percentualDesidratacao < 2) {
        return "GOOD";
    }

    if (percentualDesidratacao < 5) {
        return "MODERATE";
    }

    return "POOR";
} 

function gerarRecomendacao(status) {

    switch (status) {
        case "GOOD":
            return "Hidratação adequada.";

        case "MODERATE":
            return "Aumentar ingestão hídrica.";

        case "POOR":
            return "Reposição hídrica imediata recomendada.";

        default:
            return "";
    }
}

async function processarHidratacao(data){

    const {
        pesoInicial,
        pesoFinal,
        liquidoIngerido,
        tempoExercicioMinutos,
    } = data;

    // Validações básicas

    if (
        pesoInicial <= 0 ||
        pesoFinal <= 0
    ) {
        throw new Error (
            "Pesos inválidos"
        );
    }

    if (tempoExercicioMinutos <= 0) {
        throw new Error(
            "Tempo de exercício inválido"
        );
    }

    // Cálculos

    const perdaHidrica = calcularPerdaHidrica(
        pesoInicial,
        pesoFinal,
        liquidoIngerido
    );

    const taxaSudorese = calcularTaxaSudorese(
        perdaHidrica,
        tempoExercicioMinutos
    );

    const percentualDesidratacao = calcularPercentualDesidratacao(
        perdaHidrica,
        pesoInicial
    );

    const hydrationStatus =
        determinarStatus(
            percentualDesidratacao
        );

    const recommendation =
        gerarRecomendacao(
            hydrationStatus
        );

    const reposicaoPosTreino = calcularReposicaoPosTreino(
        pesoInicial,
        pesoFinal
    );

    return {
        perdaHidrica,
        taxaSudorese,
        percentualDesidratacao,
        reposicaoPosTreino,
        hydrationStatus,
        recommendation,
    };
}

module.exports = {
    processarHidratacao,
};