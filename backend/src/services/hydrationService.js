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
        sessionId,
        pesoInicial,
        pesoFinal,
        liquidoIngerido,
        temperatureC,
        humidityPercent,
        symptoms,
    } = data;

    // Validações básicas

    if (!sessionId){
        throw new Error(
            "sessionId é obrigatório"
        );
    }

    if (
        pesoInicial <= 0 ||
        pesoFinal <= 0
    ) {
        throw new Error (
            "Pesos inválidos"
        );
    }
    
    const session = await prisma.trainingSession.findUnique({
        where: {
            id: sessionId,
        },
    });
    
    if (!session) {
        throw new Error(
            "Sessão não encontrada"
        );
    }
    
    const existingRecord = await prisma.hydrationRecord.findUnique({
        where: {
            sessionId,
        },
    });
    
    if (existingRecord) {
        throw new Error(
            "Esta sessão já possui um registro de hidratação"
        );
    }
    
    const tempoExercicioMinutos = session.durationMin;
    
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

    await prisma.$transaction(async (tx) => {

        await tx.hydrationRecord.create({
            
            data: {
                sessionId,
                preWeightKg: pesoInicial,
                postWeightKg: pesoFinal,
                fluidIntakeLiters: liquidoIngerido,
                temperatureC,
                humidityPercent,
                symptoms,
            },

        });

        await tx.hydrationResult.create({

            data: {
                sessionId,
                sweatRateLitersHour: taxaSudorese,
                waterLossLiters: perdaHidrica,        
                dehydrationPercent: percentualDesidratacao,     
                rehydrationNeedLiters: reposicaoPosTreino,
                hydrationStatus,
                recommendation,  
            },
        
        });

    });

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