# Lab 2: Creating a Lambda Function using the AWS Console

The AWS Lambda console provides an easy way to create and manage Lambda functions.
We will later explore other ways to create and deploy functions.

In this lab, we will create a function that acts as REST API for a DynamoDB database.

## Stepy-by-step Guide

1. In your AWS dashboard, select **Services -> Lambda**

2. There select **Create function**

3. Select **Blueprints**, search for **microservice-http-endpoint** and select it

4. Click **Configure**

5. Name your function **HotDayRestMicroservice**

6. Choose **Create a new role from one or more templates**

7. Name the role **HotDayRestMicroserviceRole**

8. Under **API Gateway trigger** choose **Create a new  API**

9. For security, choose **Open with API key**

10. Click on **Create function**

![Successfully created Lambda function](/assets/FirstLambdaCreateResult.png)

## Understanding the Lambda Detail Screen

A Lambda function is always invoked via a trigger.
On the left hand side of the console these triggers are listed.
For our Lambda function, the API Gateway ist the only trigger.
In the middle we see the Lambda itself and also the newly introduced layers.
On the right hand side, we see where the Lambda function is allowed to connect to.

## Understanding and Testing the function

The function we created provides a REST API for DynamoDB.

```js
console.log('Loading function');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB();
exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'DELETE':
            dynamo.deleteItem(JSON.parse(event.body), done);
            break;
        case 'GET':
            dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            break;
        case 'POST':
            dynamo.putItem(JSON.parse(event.body), done);
            break;
        case 'PUT':
            dynamo.updateItem(JSON.parse(event.body), done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
```

Using the newly created endpoint we can now store and retrieve data to and from
DynamoDB using the JSON format that DynamoDB expects.

### Creating a DynamoDB Table to Store our Data

Before we can test this out, we have to first create the **Music** table in
DynamoDB.

For that we head over to the DynamoDB dashboard in the AWS console.

1. Open the DynaoDB dhasboard in the AWS console in a new tab

2. Click on **Create Table**

3. name the table `Music` and as Primary key enter `titleId`

4. Click **Create**

5. Leave the page open in  a separate tab.

## Testing the REST API with Postman

We previously selected, that the function should be reachable via API Gateway
and that we want to use an autorization key.
To get the endpoint URL as well as the API key, we now click on the API Gateway
section.

With this data, we can now start postman to test this out.

![Postman Setup 1](/assets/postman_1.png)

1. Enter the URL for the endpoint on the API Gateway

2. Click on **Headers**

3. Create a header entry with the key `x-api-key` and the API key from the Lambda
   console as value
![Postman Setup 2](/assets/postman_2.png)

4. Click on **Body**

5. Paste the JSON document below:

    ```json
    {
      "Item": {
        "titleId": "Bohemian_Rhapsody_1975",
        "AlbumTitle": "A Night at the Opera",
        "Artist": "Queen",
        "SongTitle": "Bohemian Rhapsody",
        "Year": "1975"
      },
      "ReturnConsumedCapacity": "TOTAL",
      "TableName": "Music"
    }
    ```

6. Select **raw** and **JSON (application/json)**

7. Click **Send**
   After the document was successfully created, the response should look similar to this

    ```json
    {
        "ConsumedCapacity": {
            "TableName": "Music",
            "CapacityUnits": 1
        }
    }
    ```
  > **Note:** If anything goes wrong, you can always click on **Monitoring -> View logs in CloudWatch** to get an error log.

8. Let's create a few more entries:

    ```json
    {
      "Item": {
        "titleId": "A_Kind_of_Magic_1986",
        "AlbumTitle": "A Kind of Magic",
        "Artist": "Queen",
        "SongTitle": "A Kind of Magic",
        "Year": "1986"
      },
      "ReturnConsumedCapacity": "TOTAL",
      "TableName": "Music"
    }
    ```

    ```json
    {
      "Item": {
        "titleId": "Who_wants_to_live_forever_1986",
        "AlbumTitle": "A Kind of Magic",
        "Artist": "Queen",
        "SongTitle": "Who Wants to Live Forever",
        "Year": "1986"
      },
      "ReturnConsumedCapacity": "TOTAL",
      "TableName": "Music"
    }
    ```

Similarly to creating a document, we can now fetch documents.

This is provided by our Lambda function in the following code block:

```js
case 'GET':
    dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
    break;
```

To try that, we just have to send a GET request to `https://<your_endpoint>?TableName=Music`.

As we can see, we now have a fully featured REST based backed to save and
retrieve data from.

Let's review, what the AWS dashboard gives us by now.
![Lambda Dynatrace](/assets/cloudwatch.png)
We see that the Dynatrace CloudWatch integration is already collecting key metrics.

Additionally, as we are using DynamoDB, we also get insights into it.
![Lambda Dynatrace](/assets/cloudwatch_2.png)

:arrow_up: [Back to TOC](/README.md)