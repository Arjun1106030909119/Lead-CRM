class RequestError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
  }
}

module.exports = RequestError;
