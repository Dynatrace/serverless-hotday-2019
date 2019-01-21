# HOT Day 2019: Serverless

This repository contains labs for the Serverless Hands-On Training at Perform 2019.

## Preparing our environments

In this section, we will set up everything that we need throughout the following
labs.

### Create an AWS Account
If you haven't done so already, please [create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html).
We recommend that you use a dedicated account to not interfere with existing
setups you may have. A new account, also gives you full access to all free tiers.


### Install GIT

We will need GIT to clone some repositories later.
If you haven't git on your system already, please install it now.

* [Windows](https://git-scm.com/download/win)
* [Mac](https://git-scm.com/download/mac)
* Linux:

  ```bash
  # Debian
  sudo apt-get update
  sudo apt-get upgrade
  sudo apt-get install git

  # RedHat
  sudo yum upgrade
  sudo yum install git
  ```

Try it by running `git --version` on your console.

### Install AWS CLI and its dependencies

We will need the AWS CLI (command line interface) to interact with AWS.

* [Windows (Use MSI Installer)](https://docs.aws.amazon.com/cli/latest/userguide/install-windows.html)
* [Mac (Use the Bundled Installer)](https://docs.aws.amazon.com/cli/latest/userguide/install-macos.html)
* [Linux](https://docs.aws.amazon.com/cli/latest/userguide/install-linux.html)

Try it by running `aws` on your console.

### Install Node.js

Our Lambda samples will be based on Node.js.
This is also the platform that is currently supported by our EAP version.

* [Windows](https://nodejs.org/dist/v10.15.0/node-v10.15.0-x86.msi)
* [Mac](https://nodejs.org/dist/v10.15.0/node-v10.15.0.pkg)
* [Linux](https://github.com/nodesource/distributions/blob/master/README.md)

Try it out by running `node -v` and `npm -v`.

### Install Postman

To interact with REST APIs, let's [install Postman](https://www.getpostman.com/downloads/).
No need to sign-in - just go straight to the app.

### Install Visual Studio Code

We will need to edit some code and it's recommended to
[install Visual Studio Code](https://code.visualstudio.com/download) for that.

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
We will later explore other ways to create and deployLambda functions.

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
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();


/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
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
   1. Run `npm install --save aws-sdk`
   2. At the top of `index.js` add

      ```js
      const AWS = require('aws-sdk');
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