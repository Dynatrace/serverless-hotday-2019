# Lab 3: Developing a Lambda function locally

So far, we used the web based editor but that's of course not how larger applications
are developed. We want to use a local IDE and then deploy to Lambda.
Usually this is even a necessity as much of Node.js power lies in the huge number
of npm modules available and they can not be installed to a project via AWS console.

In this lab we will prepare, bundle and upload the same REST API we used on the
console before.

## Step-by-step Guide

1. Open Visual Studio Code and this repository.

2. In the integrated terminal, change to `projects/rest-api`

3. While we are at it let's bring in the Dynatrace agent by running `npm install --save @dynatrace/oneagent@next`.
   > By using `@next` we are making sure that we get the very latest agent version.

4. The agent npm module contains pre-compiled versions for many platforms and Node.js
   versions. We should trim it down to what we actually need - and that's
   Node.js 8.10 on Linux. The npm module comes with a script that does exactly that.

   In the integrated terminal, run `npx dt-oneagent-tailor --AwsLambdaV8` to
   trim the agent down. It should terminate with `SUCCEEDED` and the overall project
   size should be around 4 times smaller than before.

5. To upload the package to AWS, we need to ZIP it first.
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

6. Open the AWS console and the previously created `HotDayRestMicroservice` function
   and now choose *Upload a ZIP File* in the `Function code` section.

7. Select the deployment ZIP and click `Save`

8. Let's use postman to do a quick test to see if everything still works

:arrow_up: [Back to TOC](/README.md)