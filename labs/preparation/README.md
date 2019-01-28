# Preparing our Environments

In this lab, we will set up everything that we need throughout the following
labs.

## Create an AWS Account

If you haven't done so already, please [create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html).
We recommend that you use a dedicated account to not interfere with existing
setups you may have. A new account, also gives you full access to all free tiers.

## Install GIT

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

## Install AWS CLI and its dependencies

We will need the AWS CLI (command line interface) to interact with AWS.

* [Windows (Use MSI Installer)](https://docs.aws.amazon.com/cli/latest/userguide/install-windows.html)
* [Mac (Use the Bundled Installer)](https://docs.aws.amazon.com/cli/latest/userguide/install-macos.html)
* [Linux](https://docs.aws.amazon.com/cli/latest/userguide/install-linux.html)

Try it by running `aws` on your console.

### Creating an AWS user and logging in

To authenticate the AWS CLI, we will create a dedicated user that only
has programmatic access.

1. Open the AWS Dashboard and select __Services -> IAM__
2. Click **Users** and **Add user**
3. Name the user **hotday-cli**
4. Select **Programmatic access**
5. Click **Next: Permissions**
6. Select **Administrators**
   > Note: In production scenarios, you may want to trim down the permissions to
   > exactly the privileges a given user needs
7. Click **Next** until the user is created
8. Click **Download .csv** to download the users credentials - and store it safely
9. In your systems terminal, enter `aws configure`
10. Enter the credentials we just created
11. As default region name, enter `us-east-2` and leave the defaults for the rest

## Install Node.js

Our Lambda samples will be based on Node.js.
This is also the platform that is currently supported by our EAP version.

* [Windows](https://nodejs.org/dist/v10.15.0/node-v10.15.0-x86.msi)
* [Mac](https://nodejs.org/dist/v10.15.0/node-v10.15.0.pkg)
* [Linux](https://github.com/nodesource/distributions/blob/master/README.md)

Try it out by running `node -v` and `npm -v`.

## Install Postman

To interact with REST APIs, let's [install Postman](https://www.getpostman.com/downloads/).
No need to sign-in - just go straight to the app.

## Install Visual Studio Code

We will need to edit some code and it's recommended to
[install Visual Studio Code](https://code.visualstudio.com/download) for that.

:arrow_up: [Back to TOC](/README.md)