const twilio = require("twilio");

const client = twilio("ACCOUNT_SID","AUTH_TOKEN");

const sendSMS = (number,message) => {

  client.messages.create({
    body: message,
    from: "+1234567890",
    to: number
  });

};

module.exports = sendSMS;