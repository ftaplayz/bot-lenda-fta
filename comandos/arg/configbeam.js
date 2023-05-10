module.exports = {
    'dmarketConfig': {
        'gameId': 'tf2',
        'item': 'Mann Co. Supply Crate Key',
        'limit': 20,
        'offset': 0,
        'order': {
            'by': 'price',
            'dir': 'asc'
        },
        'currency': 'USD',
        'price':{ // this is in coins like 150 is 1.50$
            'min': 0,
            'max': 250
        }
    },
    'steamConfig': {
        'appId': 440,
        'currency': 34
    },
    'steamStealRate': 0.130418429713
}