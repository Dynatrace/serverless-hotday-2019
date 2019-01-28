# HOT Day 2019: Serverless

This repository contains labs for the Serverless Hands-On Training at Perform 2019.

## TOC

1. [Preparing our Environments](/labs/preparation)

2.

## Lab 1: Setup Dynatrace AWS Monitoring Integration

![AWS Monitoring Entry Screen](/assets/dynatrace_aws_screen.png)

Dynatrace can be configure to collect metrics from CloudWatch.
This is a limited but easy way to collect telemetry data about your Lambda
functions, without having to touch any code.

### Instructions

Follow the instructions for
[setting up key-based access from the Dynatrace documentation](https://www.dynatrace.com/support/help/cloud-platforms/amazon-web-services/how-do-i-start-amazon-web-services-monitoring/).

If the connection was successful, the AWS screen should look similar to this:

![AWS Monitoring Success Screen](/assets/dynatrace_aws_cloudwatch.png)

## Lab 2: Creating a Lambda Function using the AWS Console

The AWS Lambda console provides an easy way to create and manage Lambda functions.
We will later explore other ways to create and deploy functions.

In this lab, we will create a function that acts as REST API for a DynamoDB database.

### Stepy-by-step Guide

1. In your AWS dashboard, select `Services -> Lambda`

2. There select `Create function`

3. Select `Blueprints`, search for `microservice-http-endpoint` and select it

4. Click `Configure`

5. Name your function `HotDayRestMicroservice`

6. Choose `Create a new role from one or more templates`

7. Name the role `HotDayRestMicroserviceRole`

8. Under `API Gateway trigger` choose `Create a new  API`

9. For security, choose `Open with API key`

10. Click on `Create function`

![Successfully created Lambda function](/assets/FirstLambdaCreateResult.png)

### Understanding the Lambda Detail Screen

A Lambda function is always invoked via a trigger.
On the left hand side of the console these triggers are listed.
For our Lambda function, the API Gateway ist the only trigger.
In the middle we see the Lambda itself and also the newly introduced layers.
On the right hand side, we see where the Lambda function is allowed to connect to.

### Understanding and Testing the function

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

#### Creating a DynamoDB Table to Store our Data

Before we can test this out, we have to first create the `Music` table in
DynamoDB.

For that we head over to the DynamoDB dashboard in the AWS console.

1. Open the DynaoDB dhasboard in the AWS console in a new tab

2. Click on `Create Table`

3. name the table `Music` and as Primary key enter `Year+Artist+AlbumTitle`

4. Click `Create`

5. Leave the page open in  a separate tab.

### Testing the REST API with Postman

We previously selected, that the function should be reachable viA API Gateway
and that we want to use an autorization key.
To get the endpoint URL as well as the API key, we now click on the API Gateway
section.

With this data, we can now start postman to test this out.

![Postman Setup 1](/assets/postman_1.png)

1. Enter the URL for the endpoint on the API Gateway

2. Click on `Headers`

3. Create a header entry with the key `x-api-key` and the API key from the Lambda
   console as value
![Postman Setup 2](/assets/postman_2.png)

4. Click on `Body`

5. Paste the JSON document below:

    ```json
    {
      "Item": {
        "songId": "Bohemian_Rhapsody_1975",
        "AlbumTitle": "A Night at the Opera",
        "Artist": "Queen",
        "SongTitle": "Bohemian Rhapsody",
        "Year": "1975"
      },
      "ReturnConsumedCapacity": "TOTAL",
      "TableName": "Music"
    }
    ```

6. Select `raw`and `JSON (application/json)`

7. Click `Send`

After the document was successfully created, the response should look similar to
this

```json
{
    "ConsumedCapacity": {
        "TableName": "Music",
        "CapacityUnits": 1
    }
}
```

Let's create a few more entries:

```json
{
  "Item": {
    "songId": "A_Kind_of_Magic_1986",
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
    "songId": "Who_wants_to_live_forever_1986",
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

## Lab 3: Developing a Lambda function locally

So far, we used the web based editor but that's of course not how larger applications
are developed. We want to use a local IDE and then deploy to Lambda.
Usually this is even a necessity as much of Node.js power lies in the huge number
of npm modules available and they can not be installed to a project via AWS console.

To get started, let's create a Node.js project to contain our Lambda function.

#### Step-by-step Guide

1. In a dedicated directory `hot-day-serverless`, let's create a new directory
   called `rest-api`.

2. In Visual Studio Code, open the project folder and the integrated terminal
   `View -> Terminal`

3. Run `npm init -y` in the terminal. This will create a `package.json` file that
   is needed to manage all dependencies of the project.

4. Next we will bring in the Lambda function from before.
   1. Create a file `index.js` in the project directory
   2. Copy the function from this document or directly from the AWS console.

5. The inline version automatically contains the libraries needed to access
   DynamoDB (`dynamo`). To add this functionality to our function, we have to install
   the respective modules.
   1. At the top of `index.js` add

      ```js
      const AWS = require('aws-sdk'); // no need to install it as Lambda already has it
      const dynamo = new AWS.DynamoDB();
      ```

6. While we are at it let's bring in the Dynatrace agent by running `npm install --save @dynatrace/oneagent@next`.
   > By using `@next` we are making sure that we get the very latest agent version.

7. The agent npm module contains pre-compiled versions for many platforms and Node.js
   versions. We should trim it down to what we actually need - and that's
   Node.js 8.10 on Linux. The npm module comes with a script that does exactly that.

   In the integrated terminal, run `npx dt-oneagent-tailor --AwsLambdaV8` to
   trim the agent down. It should terminate with `SUCCEEDED` and the overall project
   size should be around 4 times smaller than before.

8. To upload the package to AWS, we need to ZIP it first.
  A common pitfall is to ZIP the whole folder, which creates a nested folder when
  uploaded to AWS. We have to make sure that the ZIP only contains the files and
  not the folder they are contained in locally.

   **On Mac or Linux**
   * use the integrated terminal and run `zip -r  ../rest-api-deploy.zip .`f
   from the project directory.

   **On Windows**
   1. open the File Explorer
   2. change into the project directory
   3. select all files
   4. click right
   5. choose `Send to` and choose `Compressed (zipped)` folder and enter `rest-api-deploy.zip`
      as filename.

8. Open the AWS console and the previously created `HotDayRestMicroservice` function
   and now choose *Upload a ZIP File* in the `Function code` section.

9. Select the deployment ZIP and click `Save`

10. Let's use postman to do a quick test to see if everything still works

## Lab 4: Monitor a Lambda Function with Dynatrace

So far we have deployed the agent, but we have to add a bit more configuration to
load it with our Lambda function.

While Lambda monitoring is still in Early Access, the provided Dynatrace Environments
already have it enabled.

### Step-by-step Guide

1. Log in to the provided Dynatrace environment

2. Click `Deploy Dynatrace` and `Set up Serverless integration`

   ![Lambda Deployment](/assets/lambda_dt_setup_1.png)

3. On the following screen select Node.js and leave the defaults.

   > Our function is stored in the file `index.js` and the code is exporter
   in `handler`- that's why it is referenced as `index.handler`.
   If the file would be called `lambda.js` and the function would be exported as
   `hello`, the handler function to enter here, would be `lambda.hello`.

   ![Lambda Deployment](/assets/lambda_dt_setup_2.png)

4. Enter the values into the AWS console - as provided by the setup screen
   ![Lambda Deployment](/assets/lambda_dt_setup_3.png)
   This will instruct Lambda to first load the Dynatrace agent which
   instruments and executes the function

5. Click `Save`

6. Let's use Postman to hit the Lambda function a few times.
   Also do some POST requests.
   For that, use this document as the DynamoDB client you install via module
   expects a slightly different format.

   ```js
   "Item": {
     "songId": {"S" : "A_Kind_of_Magic_1986"},
     "AlbumTitle": {"S" :  "A Kind of Magic"},
     "Artist": {"S" : "Queen"},
     "SongTitle": {"S" : "A Kind of Magic"},
     "Year": {"S": "1986"}
   },
   "ReturnConsumedCapacity": "TOTAL",
   "TableName": "Music"
   ```

### Explore the Monitoring Data in Dynatrace

On the deployment screen, click `Show deployment status`.
![Lambda Dynatrace](/assets/lambda_dt_1.png)

When we navigate to the PurePath view, we see that the DynamoDB call is identified
as a call to public networks, which might be missleading.

![Lambda Dynatrace](/assets/lambda_dt_2.png)

Nevertheless, this PurePath already contains valuable information about the request.

![Lambda Dynatrace](/assets/lambda_dt_3.png)

### Excursus

'Request to public networks' isn't ideal - let's change that.

1. Go to `Transactions & services'
2. Click on `Requests to public networks`
3. Click on `View requests`
4. On the bottom of the page, click on the `dynamodb.*.amazonaws.com` link
5. Click again to precisize the filter
6. Click on the three dots at the top right of the page
7. Select 'Monitor as separate service'
   ![Lambda Dynatrace](/assets/separate_service.png)
8. Click on `Transactions and services` again - now the service is shown properly
   with an icon
9. On the Service detail screen, we can now edit and rename the service to DynamoDB
    (us-east).

    ![Lambda Dynatrace](/assets/edit_service.png)

10. Now the Database requests show up properly in the UI

    ![Lambda Dynatrace](/assets/service_flow_servicename.png)

> Please [consult the Dynatrace documentation](https://www.dynatrace.com/support/help/monitor/transactions-and-services/service-monitoring/how-do-i-monitor-3rd-party-service-providers/)
> for more information.

## Lab 5: Using the Serverless Framework

Manually uploading a function is not viable for real life scenarios.
While there are ways to automate deployment using only AWS tooling, today
the [Serverless Framework](https://serverless.com/).
This framwork supports not only AWS but also Azure, Google Cloud and some others.

For this Lab we will check out a sample project from GitHub.

### Setting up the sample project

1. In the terminal, change into your hotday deirectory and run git clone
   git@github.com:danielkhan/lambda-iss-location.git

2. Change into the newly downloaded project `lambda-iss-location`

3. Run `npm install` to install all dependencies

4. Rename env.yml-sample to env.yml and enter the provided credentials
// https://api.nasa.gov/index.html#apply-for-an-api-key
5. Run `npx serverless deploy` - this downloads the serverless command and
   executes it

6. When this process has finished, you will be presented with an URL we can now simply access in the browser

7. In the console run `npx serverless logs -f get-location -t`

8. Load the page a few times

   ![ISS Lambda](/assets/isslocation.png)

### Adding Dynatrace

Dynatrace provides[dedicated npm module](https://www.npmjs.com/package/@dynatrace/serverless-oneagent)
that makes the installation with Serverless very easy.

#### Step-by step

1. Run `npm install --save-dev @dynatrace/serverless-oneagent` to install the
   module as development dependency. **Already done in the sample project**

2. Uncomment the already provided `plugins` section in `serverless.yml`

3. Uncomment the already provided `serverless-oneagent` section in `serverless.yml`

4. Copy the Dynatrace credentials (from the Dynatrace deployment page) and paste
   it into env.yml under `dynatraceCredentials`

5. Run `npx serverless deploy`

6. Reload the page a few times

7. Open Dynatrace and navigate to the Service flow from the service screen
   ![ISS Lambda](/assets/iss-combined-services.png)

We can see that all outbound API calls fall together under 'Request to public networks'.
Again - we can improvde that.

Click on 'View web requests' from any service screen or service flow screen and
from there we will now again mark each of those separate APIs as service on its own.

After that hit the API a few more times and reload the service screen.

![ISS Lambda](/assets/iss-separated-services.png)

Let's explore this further by opening the PurePath view.

![ISS Lambda](/assets/iss-purepath-1.png)

What can be improved here from a runtime perspective?

// Hide
We can see that we are spending a lot of time in those outbound requests.

*Most importantly* we see that they run sequentially.

Let's improve that.
Node.js is asynchronously and there a ways to run things in parallel.

Back in the project open the index.js file.

In any case we have to fetch the current position because later calls rely on it.

```js
const issPosition = await getIssLocation();
const crewMembers = await getIssCrew();

const imagery = await getIssImageryUrl(issPosition.latitude, issPosition.longitude);
const rGeoCode = await reverseGeocode(issPosition.latitude, issPosition.longitude);
```

But we can parallelize the location and the crew call.

```js
const [issPosition, crewMembers] = await Promise.all([getIssLocation(), getIssCrew()]);
```

Similarly, we can also parallelize the imagery and geocode calls.

```js
const [imagery, rGeoCode] = await Promise.all([getIssImageryUrl(
  issPosition.latitude,
  issPosition.longitude),
  reverseGeocode(issPosition.latitude, issPosition.longitude)
]);
```

This is all part of the sample project and just needs to be commented out.

Then let's redeploy. For that hit the cursor up key to get back to the deployment
command that contains Dynatrace.

Let's hit the endpoint a few times.

![ISS Lambda](/assets/iss-purepath-2.png)

We see that we could now save a bit of execution time by paralellizing requests.

// TODO: Separate API keys for NASA