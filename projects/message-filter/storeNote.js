// eslint-disable-next-line import/no-unresolved
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

// const DSDK = require('@dynatrace/oneagent-sdk');
// const dsdk = DSDK.createInstance();

const dynamo = new AWS.DynamoDB();


AWS.config.update({ region: 'us-east-1' });

const comprehend = new AWS.Comprehend();

// let isColdStart = true;

async function processMessage(params) {
  return comprehend.detectSentiment(params).promise();
}

module.exports.handler = async (event, context, callback) => {
  try {
    /*
    if (isColdStart) {
      console.log('This is a coldstart');
      dsdk.addCustomRequestAttribute('coldstart', 'yes');
      isColdStart = false;
    } else {
      dsdk.addCustomRequestAttribute('coldstart', 'no');
    }
    */

    const message = JSON.parse(event.Records[0].Sns.Message);
    const { note } = message.payload;

    const params = {
      LanguageCode: 'en',
      Text: note,
    };

    const data = await processMessage(params);

    // dsdk.addCustomRequestAttribute('sentiment', data.Sentiment);
    if (data.Sentiment === 'POSITIVE') {
      const noteData = {
        Item: {
          noteId: {
            S: uuidv4(),
          },
          note: {
            S: note,
          },
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: 'notesTable',
      };

      console.log(`Positive note - will be published: ${note} [${data.Sentiment}]`);
      await dynamo.putItem(noteData).promise();
    } else {
      console.log(`Negative note - won't be published: ${note} [${data.Sentiment}]`);
    }
    return callback();
  } catch (err) {
    return callback(err);
  }
};
