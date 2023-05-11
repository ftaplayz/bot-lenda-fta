const { SlashCommandBuilder } = require('discord.js');
var ConfigLoader = require("ConfigLoader");
var configL = new ConfigLoader();
var syncReq = require('sync-request');

function sendRequestQS(options) {
    var res = syncReq(options.method, options.url, { qs: options.qs, headers: options.headers });
    if (res.statusCode === 200)
        return JSON.parse(res.getBody('utf8'));
    else
        console.log('error: ' + res.statusCode);
}

function clearCurrency(receive) {
    return Number(receive.lowest_price.replace(/[^0-9,]/g, '').replace(',', '.'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ars')
        .setDescription('Quanto necessario')
        .addNumberOption(option => option.setName("atual").setDescription("Quantos ARS tu possuis.").setRequired(true))
        .addNumberOption(option => option.setName("quer").setDescription("Quantos ARS tu queres").setRequired(true)),
    async execute(interaction) {
        var config = configL.load("ars");
        var dmarketResponse, steamResponse, minPrice, midPrice;
        var minRequired = midRequired = minNow = midNow = 0;
        var wantedArs = Number(interaction.options.getNumber('quer'));
        var currentArs = Number(interaction.options.getNumber('atual'));
        console.log("wnat " + wantedArs)
        console.log("has " + currentArs)
        /*
        config.dmarketConfig = require('./configbeam').dmarketConfig;
        var dmarketOptions = {
            url: 'https://api.dmarket.com/exchange/v1/market/items',
            method: 'GET',
            qs: {
                gameId: config.dmarketConfig.gameId,
                title: config.dmarketConfig.item,
                limit: config.dmarketConfig.limit,
                offset: config.dmarketConfig.offset,
                orderBy: config.dmarketConfig.order.by,
                orderDir: config.dmarketConfig.order.dir,
                currency: config.dmarketConfig.currency,
                priceFrom: config.dmarketConfig.price.min,
                priceTo: config.dmarketConfig.price.max
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var res = syncReq(dmarketOptions.method, dmarketOptions.url, { qs: dmarketOptions.qs, headers: dmarketOptions.headers });
        if (res.statusCode === 200)
            dmarketResponse = JSON.parse(res.getBody('utf8'));
        else
            console.log('error: ' + res.statusCode);
            */
        dmarketResponse = sendRequestQS({
            url: 'https://api.dmarket.com/exchange/v1/market/items',
            method: 'GET',
            qs: {
                gameId: config.dmarketConfig.gameId,
                title: config.dmarketConfig.item,
                limit: config.dmarketConfig.limit,
                offset: config.dmarketConfig.offset,
                orderBy: config.dmarketConfig.order.by,
                orderDir: config.dmarketConfig.order.dir,
                currency: config.dmarketConfig.currency,
                priceFrom: config.dmarketConfig.price.min,
                priceTo: config.dmarketConfig.price.max
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        steamResponse = sendRequestQS({
            url: 'https://steamcommunity.com/market/priceoverview/',
            method: 'GET',
            qs: {
                appid: config.steamConfig.appId,
                currency: config.steamConfig.currency,
                market_hash_name: config.dmarketConfig.item
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        /*
        config.steamConfig = require('./configbeam').steamConfig;
        var steamOptions = {
            url: 'https://steamcommunity.com/market/priceoverview/',
            method: 'GET',
            qs: {
                appid: config.steamConfig.appId,
                currency: config.steamConfig.currency,
                market_hash_name: config.dmarketConfig.item
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }
        var res = syncReq(steamOptions.method, steamOptions.url, { qs: steamOptions.qs, headers: steamOptions.headers });
        if (res.statusCode === 200)
            steamResponse = JSON.parse(res.getBody('utf8'));
        else
            console.log('error: ' + res.statusCode);
            */
        minPrice = midPrice = clearCurrency(steamResponse);
        while (!(midRequired * (midPrice - midPrice * config.steamStealRate) + currentArs >= wantedArs))
            midRequired++;
        while (!(minRequired * (minPrice - minPrice * config.steamStealRate) + currentArs >= wantedArs))
            minRequired++;
        if (midRequired != minRequired) {
            for (var i = 0; i < midRequired; i++)
                if (dmarketResponse.objects[i + 1] != undefined)
                    midNow += Number(dmarketResponse.objects[i].price.USD) / 100;
                else
                    break;
        }
        for (var i = 0; i < minRequired; i++)
            if (dmarketResponse.objects[i + 1] != undefined)
                minNow += Number(dmarketResponse.objects[i].price.USD) / 100;
            else
                break;
        console.log(minNow)
        console.log(midNow)
        console.log(minRequired)
        console.log(midRequired)
        await interaction.reply({ content: 'Precisas comprar **' + minNow.toFixed(2) + '$** de chaves no mínimo'+(midRequired!=minRequired?', em média **' + midNow.toFixed(2) + '$**':'')+'. **Com taxas(CARTÃO) ' + (midRequired==minRequired?((minNow + minNow * 0.0385) + 0.3).toFixed(2):((midNow + midNow * 0.0385) + 0.3).toFixed(2)) + '$** \nLink para chaves: https://dmarket.com/pt/ingame-items/item-list/tf2-skins?title=%20Mann%20Co.%20Supply%20Crate%20Key%20. \nÉ esperado receberes **' + (midPrice - midPrice * config.steamStealRate).toFixed(2) + "ARS$** por chave e ficares com **" + (((midPrice - midPrice * config.steamStealRate) * midRequired) + currentArs).toFixed(2) + "ARS$** no total. \nSe gastares a quantidade que queres deves ficar com **" + ((((midPrice - midPrice * config.steamStealRate) * midRequired) + currentArs) - wantedArs).toFixed(2) + "ARS$**.", ephemeral: true });
    },
};
