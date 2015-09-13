var rally = require('rally');
var AlexaSkill = require('./AlexaSkill');

var AWS = require('aws-sdk');

var s3 = new AWS.S3();

var params = {
  Bucket : 'alexa-stuff',
  Key : 'rally.json'
};
 
var restAPI, config;
var maxResults = 5;

var APP_ID = "amzn1.echo-sdk-ams.app.[replace-with-your-unique-number]";

var RallySkill = function() {
    AlexaSkill.call(this,APP_ID);
};

RallySkill.prototype = Object.create(AlexaSkill.prototype);
RallySkill.prototype.constructor = RallySkill;

RallySkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    s3.getObject(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else {
            config = JSON.parse(data.Body.toString('ascii'));
        }
    });
};

RallySkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("RallySkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Rally skill, you can ask for current bugs";
    response.ask(speechOutput);
};

RallySkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

RallySkill.prototype.intentHandlers = {
    GetRallyDefectsIntent: function(intent, session, response) {
       s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            response.tell("Couldn't get the rally config from s3");
        } else {
            config = JSON.parse(data.Body.toString('ascii'));
            fetchRallyDefects(config, function(error, result) {
                if(error) {
                    response.tell("Sorry, I couldn't talk to Rally");
                } else {
                    results = result.Results
                    var speechText = "";
                    if (results.length == 0) {
                        response.tell("You don't have anything to fix!");
                    } else {
                        speechText = "OK, I found " + results.length + " defects ";
                        countToSay = results.length;
                        if (results.length > maxResults) {
                            speechText = speechText + " I will only return the first " + maxResults;
                            countToSay = maxResults;
                        }
                        speechText = speechText + " " + "Here are the results. "
                        for (i = 0; i < countToSay; i++) {
                            speechText = speechText + "Number " + (i+1) + ".  " + results[i]['_refObjectName'] + ". "
                        }
                        response.tell(speechText);
                    }
                }
            });
        }
    });
    }
}

function fetchRallyDefects(config, callback) {
    restApi = rally({
        apiKey : config.key
    })
    queryUtils = rally.util.query;
    var completeQuery = queryUtils.where('ScheduleState', '<', 'Completed');
    completeQuery = completeQuery.and('Owner', '=', config.user)
    restApi.query({
        type: 'defect', //the type to query
        start: 1, //the 1-based start index, defaults to 1
        limit: maxResults, //the maximum number of results to return- enables auto paging
        order: 'Rank', //how to sort the results
        fetch: ['Name'], //the fields to retrieve
        query: completeQuery, 
        scope: {
            project: '/project/' + config.projectID, //specify to query a specific project
            up: false, //true to include parent project results, false otherwise
            down: false //true to include child project results, false otherwise
        },
        requestOptions: {} //optional additional options to pass through to request
    }, function(error, result) {
        callback(error,result)
    });
}

exports.handler = function(event, context) {
   var rallySkill = new RallySkill();
   rallySkill.execute(event,context);
}
