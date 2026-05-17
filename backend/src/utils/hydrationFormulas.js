const { arredondar, minutosParaHoras } = require("./math");

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
    tempoExercicioMinutos
) {
    
    if (tempoExercicioMinutos <= 0) {
        throw new Error ("Tempo de exercício inválido");
    }
    
    const tempoExercicioHoras = minutosParaHoras(tempoExercicioMinutos)

    return arredondar(
        perdaHidrica / tempoExercicioHoras
    );
}

function calcularPercentualDesidratacao (
    perdaHidrica,
    pesoInicial
) {
    return arredondar(
        (perdaHidrica / pesoInicial) * 100
    );
}

function calcularReposicaoPosTreino (
    pesoInicial,
    pesoFinal
) {
    return arredondar(
        (pesoInicial - pesoFinal) * 1.5
    );
}

module.exports = {
    calcularPerdaHidrica,
    calcularTaxaSudorese,
    calcularPercentualDesidratacao,
    calcularReposicaoPosTreino,
};