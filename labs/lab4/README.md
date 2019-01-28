# Lab 4: Monitoring a Lambda Function with Dynatrace

So far we have deployed the agent, but we have to add a bit more configuration to
load it with our Lambda function.

While Lambda monitoring is still in Early Access, the provided Dynatrace Environments already have it enabled.

## Step-by-step Guide

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
     "titleId": "A_Kind_of_Magic_1986",
     "AlbumTitle": "A Kind of Magic",
     "Artist": "Queen",
     "SongTitle": "A Kind of Magic",
     "Year": "1986"
   },
   "ReturnConsumedCapacity": "TOTAL",
   "TableName": "Music"
   ```

## Explore the Monitoring Data in Dynatrace

On the deployment screen, click `Show deployment status`.
![Lambda Dynatrace](/assets/lambda_dt_1.png)

When we navigate to the PurePath view, we see that the DynamoDB call is identified
as a call to public networks, which might be missleading.

![Lambda Dynatrace](/assets/lambda_dt_2.png)

Nevertheless, this PurePath already contains valuable information about the request.

![Lambda Dynatrace](/assets/lambda_dt_3.png)

Additionally we get all Node.js metrics that we would get for a regular application.

### Excursus

'Request to public networks' isn't ideal - let's change that.

1. Go to **Transactions & services**
2. Click on **Requests to public networks**
3. Click on **View requests**
4. On the bottom of the page, click on the **dynamodb.*.amazonaws.com** link
5. Click again to precisize the filter
6. Click on the three dots at the top right of the page
7. Select 'Monitor as separate service'
   ![Lambda Dynatrace](/assets/separate_service.png)
8. Click on **Transactions and services** again - now the service is shown properly
   with an icon
9. On the Service detail screen, we can now edit and rename the service to DynamoDB
    (us-east).

    ![Lambda Dynatrace](/assets/edit_service.png)

10. Now the Database requests show up properly in the UI

    ![Lambda Dynatrace](/assets/service_flow_servicename.png)

11. Hit the API a few times until the new endpoint shows up

> Please [consult the Dynatrace documentation](https://www.dynatrace.com/support/help/monitor/transactions-and-services/service-monitoring/how-do-i-monitor-3rd-party-service-providers/)
> for more information.

:arrow_up: [Back to TOC](/README.md)