const { NODE_ENV } = require('../env');
const logger = require('../logger');
const knex = require('knex');
const knexFile = require('../../knexfile');

/** Models */
const EntityModel = require('./models/EntityModel');

/** Integrations */
const Placeholder = require('./integrations/Placeholder');

/** Services */
const UserService = require('./services/UserService');

const database = knex(knexFile);
if (NODE_ENV === 'development') {
  database.on('query', (query) => {
    let { sql } = query;
    if (query.bindings) {
      query.bindings.forEach((binding) => {
        sql = sql.replace('?', binding);
      });
    }
    logger.info(sql);
  });
}

database.migrate.latest();

/**
 * @typedef ModelContainer
 * @type {Object}
 * @property {EntityModel} entityModel
 */

/** @type {ModelContainer} */
const models = {
  entityModel: new EntityModel(database),
};

/**
 * @typedef IntegrationContainer
 * @property {Placeholder} placeholder
 */

/** @type {IntegrationContainer} */
const integrations = {
  placeholder: new Placeholder(),
};

/**
 * @typedef ServiceContext
 * @type {ModelContainer & IntegrationContainer}
 */

/** @type {ServiceContext} */
const serviceContext = {
  ...models, ...integrations,
};

/**
 * @typedef ServiceContainer
 * @type {Object}
 * @property {UserService} userService
 */

/** @type {ServiceContainer} */
const services = {
  userService: new UserService(serviceContext),
};

/**
 * @typedef Container
 * @type {ServiceContainer}
 */

/** @type {Container} */
const container = {
  ...services,
};

module.exports = container;
