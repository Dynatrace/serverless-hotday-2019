# Lab 1: Log in to Dynatrace & Set up Dynatrace AWS Monitoring Integration

Dynatrace can be configure to collect metrics from CloudWatch.
This is a limited but easy way to collect telemetry data about your Lambda
functions, without having to touch any code.

In this lab, we will set up this integration.

## Instructions

1. Use the provided credentials to log in to your Dynatrace environment.
2. Click on the *AWS* link on the left menu.

![AWS Monitoring Entry Screen](/assets/dynatrace_aws_screen.png)

3. Follow the instructions for
[setting up key-based access from the Dynatrace documentation](https://www.dynatrace.com/support/help/cloud-platforms/amazon-web-services/how-do-i-start-amazon-web-services-monitoring/).

If the connection was successful, Dynatrace will start collecting CloudWatch metrics and the AWS screen should look similar to this (can take a few minutes):

![AWS Monitoring Success Screen](/assets/dynatrace_aws_cloudwatch.png)

:arrow_up: [Back to TOC](/README.md)