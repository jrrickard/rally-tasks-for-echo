# rally-tasks-for-echo

This is a example project that shows how to connect an Alexa Skill implemented using AWS Lambda to an S3 document and an external API. The example shows fetching a list of defects from Rally using the [Rally Web Services API](https://rally1.rallydev.com/slm/doc/webservice/)

## Getting started

This example is build using a Node.js code running on AWS Lambda. If you aren't familiar with Node.js and Lambda, see their [getting started](http://docs.aws.amazon.com/lambda/latest/dg/getting-started.html).

Assuming you already have node installed, use NPM to install the [rally-node dependency](https://github.com/RallyTools/rally-node) into the src directory in this project. 

```
fermat:rally-tasks-for-echo jeremy$ npm install --prefix=src rally
rally@0.2.0 src/node_modules/rally
├── q@1.1.2
├── lodash@2.4.2
└── request@2.51.0 (caseless@0.8.0, forever-agent@0.5.2, aws-sign2@0.5.0, stringstream@0.0.4, oauth-sign@0.5.0, tunnel-agent@0.4.1, json-stringify-safe@5.0.1, node-uuid@1.4.3, qs@2.3.3, mime-types@1.0.2, combined-stream@0.0.7, http-signature@0.10.1, tough-cookie@2.0.0, form-data@0.2.0, bl@0.9.4, hawk@1.1.1)
```

Next, fill out the rally.json file with a valid key for Rally's SaaS hosted service, your project ID and the username to fetch defects for. Create an S3 bucket named alexa-stuff and upload the rally.json file to that folder.

Now, create a zip of everything in the src directory:

```
fermat:src jeremy$ zip -r rally.zip *
```

This should create a file with the example and the node modules for rally-node. You can upload this to rally.


## Configure AWS Lambda

1. From the AWS Console click on the Lambda link. Make sure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function.
3. Name the Lambda Function "rally-echo-skill".
4. Upload the .zip file to the Lambda
5. Keep the Handler as index.handler (this refers to the main js file in the zip).
6. Create an S3 execution role and click create.
7. Click on "Actions" then "Add Event Source"
8. Choose Alexa Skills Kit and click submit.
9. Click on your Lambda function name and copy the ARN to be used later in the Alexa Skill Setup

## Configure Alexa Skill

1. Go to the Alexa Console (https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set "Rally" for the skill name and "rally" as the invocation name, this is what is used to activate your skill. For example you would say: "Alexa, Ask Rally For My Current Bugs."
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the Intent Schema from the included IntentSchema.json in speechAssets.
5. Copy the Sample Utterances from the included SampleUtterances.txt in speechAssets. Click Next.
6. Go back to the skill Information tab and copy the appId. Paste the appId into the index.js file where it says replace-with-your-unique-number. Rezip the code and upload it to the lambda again. This will make sure the lambda is only invoked by that skill. 

***It's important to note that this will only be availble to the profile linked to your account. If you have multiple profiles, make sure you are in your own on the Echo***

## Using the skill

Walk up to your Echo and say "Alexa, Ask Rally for my current bugs".
