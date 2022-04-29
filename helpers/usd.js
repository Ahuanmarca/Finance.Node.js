function usd(value) {
    // Format value as USD.
    return '$' + value.toLocaleString('currency', {minimumFractionDigits: 2})
}

// console.log(usd(150000))

module.exports = usd;