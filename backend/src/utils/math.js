function arredondar (valor, casas = 2) {
    return Number(valor.toFixed(casas));
}

module.exports = {
    arredondar,
};