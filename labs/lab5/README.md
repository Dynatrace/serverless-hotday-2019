# Lab 5: Using the Serverless Framework

Manually uploading a function is not viable for real life scenarios.
While there are ways to automate deployment using only AWS tooling, today
the [Serverless Framework](https://serverless.com/).
This framwork supports not only AWS but also Azure, Google Cloud and some others.

In this sample project we will use some free APIs to create an app that shows
the current position of the International Space Station (ISS) along with some
additional data.

## Setting up the sample project

1. In the terminal, change into `projects/iss-location`.

2. Run `npm install` to install all dependencies

3. Rename env.yml-sample to env.yml and enter the provided credentials
   To not run into rate limits, lets get a [dedicated key for the NASA API](https://api.nasa.gov/index.html#apply-for-an-api-key).

4. Take your time to review the contents of `serverless.yml`

5. Run `npx serverless deploy` - this downloads the serverless command and
   executes it

6. When this process has finished, you will be presented with an URL we can now simply access in the browser

7. In the console run `npx serverless logs -f get-location -t`

8. Load the page a few times

   ![ISS Lambda](/assets/isslocation.png)

## Adding Dynatrace

Dynatrace provides[dedicated npm module](https://www.npmjs.com/package/@dynatrace/serverless-oneagent)
that makes the installation with Serverless very easy.

### Step-by step guide

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

:arrow_up: [Back to TOC](/README.md)