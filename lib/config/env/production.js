'use strict';

module.exports = {
  env: 'production',
  database: process.env.MONGODB || 'library-prod'
};
