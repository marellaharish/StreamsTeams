const EventEmitter = require('events');

class RequestEmitter extends EventEmitter {}

export default new RequestEmitter();