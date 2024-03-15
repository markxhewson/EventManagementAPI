const accountSid = 'AC92d384770064c992d5a582288ad59f34'
const authToken = '3128b064989e7f50f8bdf64b6260bb1a';
const twilioPhoneNumber = '+447723193065';

const client = require('twilio')(accountSid, authToken);

const sendSMS = async (recipient, content) => {
  try {
    const message = await client.messages.create({
      body: content,
      from: twilioPhoneNumber,
      to: recipient
    });
    console.log(`Message sent with SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

module.exports = sendSMS;
