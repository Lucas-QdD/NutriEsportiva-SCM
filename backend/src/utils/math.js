function arredondar (valor, casas = 2) {
    return Number(valor.toFixed(casas));
}

function minutosParaHoras (minutos) {
    return minutos / 60;
}

module.exports = {
    arredondar,
    minutosParaHoras,
};