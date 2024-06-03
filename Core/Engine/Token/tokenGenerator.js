const tokenGenerator = (args) => {
  var activation_token = "";
  var reduction_token = "";
  var shipment_token = "";

  if (args.activationTokens.length > 0) {
    

    args.activationTokens.forEach((token) => {
        console.log(token);
      const _params = [
        token.class,
        token.id,
        token.product.id,
        token.param1,
        token.param2,
        token.param3,
      ];
      _params.forEach((param, index) => {
        if (index == 0) {
          activation_token += `${param}`;
        } else {
          if (param) {
            activation_token += `:${param}`;
          }
        }
      });
      activation_token += " ";
    });
  }
  if (args.reductionTokens.length > 0) {
    args.reductionTokens = args.reductionTokens.forEach((token) => {
      const _params = [
        token.class,
        token.id,
        token.product.id,
        token.param1,
        token.param2,
        token.param3,
      ];
      _params.forEach((param, index) => {
        if (index == 0) {
          reduction_token += `${param}`;
        } else {
          if (param) {
            reduction_token += `:${param}`;
          }
        }
      });
      reduction_token += " ";
    });
  }
  if (args.shipmentTokens.length > 0) {
    args.shipmentTokens = args.shipmentTokens.forEach((token) => {
      const _params = [
        token.class,
        token.id,
        token.product.id,
        token.param1,
        token.param2,
        token.param3,
      ];
      _params.forEach((param, index) => {
        if (index == 0) {
          shipment_token += `${param}`;
        } else {
          if (param) {
            shipment_token += `:${param}`;
          }
        }
      });
      shipment_token += " ";
    });
  }
  return {
    activation_token: activation_token.trim(),
    reduction_token: reduction_token ? "BC:9ied BC:549d BC:93je " + reduction_token.trim() : "",
    shipment_token: shipment_token.trim(),
  };
};

module.exports = tokenGenerator;
