const prisma = require("../lib/prisma");

const {
    calcularPerdaHidrica,
    calcularTaxaSudorese,
    calcularPercentualDesidratacao,
    calcularReposicaoPosTreino,
} = require("../utils/hydrationFormulas");

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

    const reposicaoPosTreino = calcularReposicaoPosTreino(
        pesoInicial,
        pesoFinal
    );

    return {
        perdaHidrica,
        taxaSudorese,
        percentualDesidratacao,
        reposicaoPosTreino,
    };
}

module.exports = {
    processarHidratacao,
};