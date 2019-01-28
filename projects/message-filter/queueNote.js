// eslint-disable-next-line import/no-unresolved
const AWS = require('aws-sdk');
const DSDK = require('@dynatrace/oneagent-sdk');

const dsdk = DSDK.createInstance();

AWS.config.update({ region: 'us-east-2' });

const sns = new AWS.SNS();

// let isColdStart = true;

module.exports.handler = async (event, context, callback) => {

  /*
  if (isColdStart) {
    console.log('This is a coldstart');
    dsdk.addCustomRequestAttribute('coldstart', 'yes');
    isColdStart = false;
  } else {
    dsdk.addCustomRequestAttribute('coldstart', 'no');
  }
  */

  const data = JSON.parse(event.body);
  if (typeof data.note !== 'string') {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t add the note.',
    });
    return;
  }

  const tracer = dsdk.traceOutgoingRemoteCall({
    serviceEndpoint: 'SNS',
    serviceMethod: 'publish',
    serviceName: 'AnalyzeNote',
    channelType: DSDK.ChannelType.TCP_IP,
  });

  try {
    await tracer.start(() => {
      const dtTag = tracer.getDynatraceStringTag();
      const params = {
        Message: JSON.stringify({ payload: { note: data.note } }),
        MessageAttributes: {
          'x-dynatrace': {
            DataType: 'String',
            StringValue: dtTag,
          },
        },
        TopicArn: `arn:aws:sns:us-east-2:${event.requestContext.accountId}:analyzeNote`,
      };
      return sns.publish(params).promise();
    });

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully queued the note.' }),
    };
    callback(null, response);
  } catch (error) {
    tracer.error(error);
    console.error(error);
    callback(null, {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t add the note due an internal error. Please try again later.',
    });
  } finally {
    tracer.end();
  }
};
