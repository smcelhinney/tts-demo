const server = require('../server');
const debug = require('debug')('sounds');

server.port = process.env.PORT || 4000;
server.listen(server.port, () => {
  debug(`Started up server listening on port ${server.port}`);
});

module.exports = server;
