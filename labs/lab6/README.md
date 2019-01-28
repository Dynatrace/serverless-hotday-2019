# Using the Dynatrace SDK to Connect Invocations

A typical use case for Lambda functions is to use them to create evented,
asynchronous applications.

This is a challenge for end-to-end-tracing as the tracing information often gets
lost when traversing components like queues.

In this lab we will deploy and application that uses SNS to queue a message and
which is then consumed and analyzed by another Lambda function.

![Lambda SNS Comprehend](/assets/lambda-sns-comprehend.png)

Additionally, we will use the [Dynatrace SDK](https://github.com/Dynatrace/OneAgent-SDK-for-NodeJs),
to connect the lambda functions as we would lose context when we go througfh SNS.

## Stype by step
1. In your terminal, change into `projects/message-filter`

2. Rename `env-sample.yml` to `env.yml` and copy the dynatrace crendentials from
   our previous example into the env.yml file.

3. We now have to change one configuration option to tell our agent where it
   will find the Dynatrace tag: `"dynatraceTagPropertyPath":"Records.0.Sns.MessageAttributes.x-dynatrace.Value"`
   > **Explanation:** In `queueNote`, we propagate the Dynatrace tag via SNS
   metadata. This metadata is then sent with the event received by the second Lambda
   function.

   ```js
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
   ```

4. Use `npx serverless deploy` to deploy the app

5. In Postman, call the provided endpoint with a POST request:
   ```js
   {
     "note": "Today is a wonderful day!",
   }
   ```

7. Run `npx serverless logs -f queueNote -t` and hit the endpoint with different
   messages and see if it was positive enough

8. Review the results in Dynatrace
   ![SNS Stitched](/assets/sns-stitched.png)

:arrow_up: [Back to TOC](/README.md)