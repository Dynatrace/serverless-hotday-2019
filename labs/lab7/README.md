# Monitor and Chart Coldstarts

In the intro, we learned that coldstarts impact the response time.

Wouldn't it be interesting to see them in Dynatrace?

While this is not (yet) available out-of-the-box, we can use the
[Dynatrace OneAgent SDK](https://www.npmjs.com/package/@dynatrace/oneagent-sdk)
to annotate the data.

This SDK comes via npm and was already used to connect the PurePath in previous examples,
so we don't have to install it now.

All we have to do, is to add a bit of code.

How can we detect coldstarts?
We can use the fact, that Lambda functions in Node.js have a global scope as well.
It's everything that's not in the handler function.

So if we store a flag there, its status can tell use if the whole function was
newly deployed.

For your convenience, the code is already in place and just needs to be uncommented.

So in `queueNote.js` we add:

```js
let isColdStart = true;
```

Now in the function we have to check this flag and send the data to the Dynatrace:

```js
if (isColdStart) {
  console.log('This is a coldstart');
  dsdk.addCustomRequestAttribute('coldstart', 'yes');
  isColdStart = false;
} else {
  dsdk.addCustomRequestAttribute('coldstart', 'no');
}
```

That's it - let's also do that in `addNote.js`.
Here we also have to uncomment the initialization of the SDK as we didn't need
it in the previous example:

```js
const DSDK = require('@dynatrace/oneagent-sdk');
const dsdk = DSDK.createInstance();
```

Additionally, let's also track the detected sentiment.

Now, all that's left to do is to deploy the function with `npx serverless deploy`.

To make the data available in Dynatrace, we have to add a bit of Configuration to it:

## Step-by-step Guide

1. In Dynatrace go to **Settings -> Serverside monitoring -> Request attributes**

2. Click on **Create new request attribute**

3. Fill out the form as shown on the screenshot and don't forget to save at the end
   ![Sentiment Request](/assets/sentiment_request.png)

4. Do the same for the request attribute `coldstart` and call it `Lambda Coldstart`

5. Now hit the API a few times and soon the data will show up as separate tab
   on service requests (Service -> Show requests)
   ![Request Attributes](/assets/request-attributes.png)

6. Click on **Create Chart** to create a chart for this service and its attributes


:arrow_up: [Back to TOC](/README.md)