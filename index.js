/* 
 * Project: Resistor Calculator
 * Authors: Matthew Ngor, Patrick Phuong, Ryan Tran
 * Date Created: 1/19/19
 * Description: Returns the resistance and tolerance of a 4-band resistor
 * 
 * How to use: This program is intended to be used with the attached .json file.
 * 1. Say: "Alexa, open resistor calculator"
 * 2. Give Alexa 4 valid colors for a 4 band resistor.
 * 
 * "exports.handler" boilerplate code obtained from BlondieBytes and Amazon Github repositories 
 * for educational purposes.
*/

// initialization of string variables for Map  
var black = "black",
    brown = "brown",
    red = "red",
    orange = "orange",
    yellow = "yellow",
    green = "green",
    blue = "blue",
    violet = "violet",
    grey = "grey",
    white = "white",
    gold = "gold",
    silver = "silver";

// insert first and second color and value correspondance
var band = new Map();
band.set(black, 0);
band.set(brown, 1);
band.set(red, 2);
band.set(orange, 3);
band.set(yellow, 4);
band.set(green, 5);
band.set(blue, 6);
band.set(violet, 7);
band.set(grey, 8);
band.set(white, 9);

// multiplier (third band) colors and their values
var multiplier = new Map();
multiplier.set(black, 1);
multiplier.set(brown, 10);
multiplier.set(red, 100);
multiplier.set(orange, 1000);
multiplier.set(yellow, 10000);
multiplier.set(green, 100000);
multiplier.set(blue, 1000000);
multiplier.set(violet, 10000000);
multiplier.set(grey, 100000000);
multiplier.set(white, 1000000000);
multiplier.set(gold, 0.1);
multiplier.set(silver, 0.01);

// tolerance (fourth band) colors and their values
var tolerance = new Map();
tolerance.set(brown, 1);
tolerance.set(red, 2);
tolerance.set(green, 0.5);
tolerance.set(blue, 0.25);
tolerance.set(violet, 0.10);
tolerance.set(grey, 0.05);
tolerance.set(gold, 0.5);
tolerance.set(silver, 0.10);

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                  context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here for customization purposes
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == "GetResistorValue") { 
        handleResistorResponse(intent, session, callback);
    } else if (intentName == "AMAZON.CancelIntent") {
        handleFinishSessionRequest(intent, session, callback);
    } else if (intentName == "AMAZON.HelpIntent") {
        handleGetHelpRequest(intent, session, callback);
    } else if (intentName == "AMAZON.StopIntent") {
        handleFinishSessionRequest(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
   // add any session init logic here for customization purposes
}

// Welcomes users when entering skill
function getWelcomeResponse(callback) {
    var speechOutput = "Hello! What are the 4 resistor band colors?";
    var reprompt = "What are the 4 resistor band colors?";
    var header = "Resistor value calculator!";
    var shouldEndSession = false;
    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    };
    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
}

// Takes user input, matches values with color, returns resistance and tolerance
function handleResistorResponse(intent, session, callback) {
    var band1 = intent.slots.firstband.value;
    var band2 = intent.slots.secondband.value;
    var multiplier_val = intent.slots.multiplier.value;
    var tolerance_val = intent.slots.tolerance.value;  
    
    if (band.has(band1) && band.has(band2) && multiplier.has(multiplier_val) && tolerance.has(tolerance_val)){
      var band1val = band.get(band1);
      var band2val = band.get(band2);
      var multiplierVal = multiplier.get(multiplier_val);
      var toleranceVal = tolerance.get(tolerance_val);

      // calculation of bands 
      var resistance = ((band1val*10) + band2val)*multiplierVal;
      var speechOutput = "The resistance is " + resistance + " ohms with " + toleranceVal + "% tolerance.";
      var repromptText = "What are the 4 resistor bands?";
      var header = "Resistance";
      var shouldEndSession = false;

    } else {
      var speechOutput = "A color does not exist";
        var repromptText = "Try reading values again";
        var header = "Combination not possible";
    }
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText,shouldEndSession));
}

// Outputs help
function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
      session.attributes = {};
      var speechOutput = "I can tell you the resistance of a 4 band resistor.";
      var repromptText = "I can tell you the resistance of a 4 band resistor.";
      var shouldEndSession = false;
      callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText,shouldEndSession));
    }
}

// End session
function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes, buildSpeechletResponseWithoutCard("Good bye!", "", true));
}

// ------- Helper functions to build responses for Alexa -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}