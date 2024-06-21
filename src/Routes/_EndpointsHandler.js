class EndpointsHandler {
  constructor() {
    if (EndpointsHandler.instance instanceof EndpointsHandler) {
      return EndpointsHandler.instance;
    }
  }

  _RouteHandler = {
    //route logic
  };
}

module.exports = () => {
  return new EndpointsHandler();
};
