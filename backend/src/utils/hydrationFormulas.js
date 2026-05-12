function calcularPerdaHidrica (
    pesoInicial,
    pesoFinal,
    liquidoIngerido
    
) {
    return (
        (pesoInicial - pesoFinal) + liquidoIngerido
    );
}

function calcularTaxaSudorese (
    perdaHidrica,
    tempoExercicioHoras
) {
    
    if (tempoExercicioHoras <= 0) {
        throw new Error (
            "Tempo de exercício inválido"
        );
    }

    return (
        perdaHidrica / tempoExercicioHoras
    );
}

function calcularPercentualDesidratacao (
    perdaHidrica,
    pesoInicial
) {
    return (
        (perdaHidrica / pesoInicial) * 100
    );
}

function calcularReposicaoPosTreino (
    pesoInicial,
    pesoFinal
) {
    return (
        (pesoInicial - pesoFinal) * 1.5
    );
}

module.exports = {
    calcularPerdaHidrica,
    calcularTaxaSudorese,
    calcularPercentualDesidratacao,
    calcularReposicaoPosTreino,
};