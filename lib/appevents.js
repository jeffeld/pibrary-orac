var EventEmitter = require('events').EventEmitter,
    _ = require('underscore'),
    stock = require ('./modules/stock'),
    members = require ('./modules/members'),
    isbn = require ('./modules/isbn')
;

module.exports = new EventEmitter();


console.log("==> INITIALIZING EVENTS");

// Naming convention for events...
// Module-Action e.g. Member-Add, Stock-Loan etc.

var eventsToObservers = [
    {
        event : 'Stock-Loan',
        observers : [stock.OnStockLoan, members.OnStockLoan, isbn.OnLoan]
    },
    {
        event : 'Stock-Return',
        observers : [stock.OnStockReturn, members.OnStockReturn]
    },
    {
        event : 'Stock-Renew',
        observers : []
    }
];


// Wire up the events with their handlers

_.each(eventsToObservers, function (event) {
    _.each(event.observers, function (observer) {
        module.exports.on(event.event, observer);
    });
});


