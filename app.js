// Use dotenv to read .env vars into Node
require('dotenv').config();
let tweetBody = require('./formatTweet.js');
let docs = require('./formatDocs.js');

const Twit = require('twit');
const pg = require('pg');

const config = require('./config.js');

const T = new Twit(config.twitter);

// !!!!!! IMPORTANT !!!!!!!

// SET THESE BEFORE DEPLOYMENT

const sendTweets    = true;                // @testing = false | @deploy = true
const sslOn         = false;                // @testing = false | @deploy = true
let resetNumTweeted = false;               // @testing = false | @deploy = false

// Tweet once every six hours
// (6 hr. * 60 min. * 60 sec. * 1000 ms.)
const timeout       = 6 * 60 * 60 * 1000;  // @testing = n/a | @deploy = 6 * 60 * 60 * 1000

const tweetNow      = true;               // @testing = true | @deploy = false
const autoTweet     = false;                // @testing = false | @deploy = true

function tweeted(err, data, response) {
    if (err) {
        console.log(`Attempt to post Tweet failed with an error. ${err}`)
    }
    else {
        console.log("Tweet posted successfully.")
    }
}

function sendTweet(tweetText) {
    T.post('statuses/update', { status: `${tweetText}` }, tweeted);
}

let pgClient = null;

const randomRow = 'SELECT * FROM staffers WHERE end_date IS NULL ' +
    'AND name IS NOT NULL ' +
    'AND start_date IS NOT NULL ' +
    'AND agency_name IS NOT NULL ' +
    'AND position_title_1 IS NOT NULL ' +
    'AND num_times_tweeted = ( SELECT MIN (num_times_tweeted) FROM staffers )' + // select from among the untweeted
    'ORDER BY random() limit 1';

let stafferInfo     = {};
let tweetString     = '';
let idOfTweeted     = 0;

function tweeter() {

    stafferInfo = {};
    tweetString = '';

    let pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: sslOn
    } || config.db);

    pool.connect()

        // (1) GET INFO FROM DB AND SET VARIABLE
        .then(client => {
            pgClient = client;
            return pgClient.query(randomRow)
                .then(res => {
                    stafferInfo = res.rows[0];
                    idOfTweeted = res.rows[0].id;
                    // console.log(stafferInfo);
                })
                .catch(err => console.error('Error executing first psql query', err.stack));
        })

        // (2) RESET "TWEETED" COUNT - RUNS ONLY THE FIRST TIME THE FUNCTION IS CALLED
        .then(() => {
            if (resetNumTweeted) {
                return pgClient.query('UPDATE staffers SET num_times_tweeted=0')
                    .then(res => {
                        // console.log(res);
                    })
                    .catch(err => console.error('Error resetting num_times_tweeted', err.stack));
            }
        })

        // (3) UPDATE "TWEETED" COUNT of SELECTED
        .then(() => {
            return pgClient.query('UPDATE staffers SET num_times_tweeted=num_times_tweeted+1 WHERE id=' + idOfTweeted)
                .then(res => {
                    // console.log(res);
                })
                .catch(err => console.error('Error updating tweeted count', err.stack));
        })

        // (4) FOR TESTING - CHECK IF num_times_tweeted IS UPDATED
        .then(() => {
            return pgClient.query('SELECT * FROM staffers WHERE id=' + idOfTweeted)
                .then(res => {
                    // console.log("test: ", res.rows[0]);
                })
                .catch(err => console.error('Error updating tweeted count', err.stack));
        })

        // (5) POST TWEET
        .then(() => {

            tweetString = tweetBody.formatText(stafferInfo, tweetString);

            if ((`${tweetString} (data from ProPublica's Trump Town dataset)`).length <= (280)) {
                tweetString += ` (data from ProPublica's Trump Town dataset)`;
                console.log(tweetString);
                if (sendTweets) { sendTweet(tweetString); }
            }
            else if (tweetString.length <= 280) {
                console.log(tweetString);
                if (sendTweets) { sendTweet(tweetString); }
            }
            else {
                console.log(`Tweet is longer than 280 characters: ${tweetString}`);
            }

            if (stafferInfo.linkedin_url) {
                console.log(docs.formatLinkedIn(stafferInfo));
                if (sendTweets) { sendTweet(docs.formatLinkedIn(stafferInfo)); }
            }
            if (stafferInfo.resume_document_url) {
                console.log(docs.formatResume(stafferInfo));
                if (sendTweets) { sendTweet(docs.formatResume(stafferInfo)); }
            }
            if (stafferInfo.financial_disclosure_url) {
                console.log(docs.formatFinancialDisclosure(stafferInfo));
                if (sendTweets) { sendTweet(docs.formatFinancialDisclosure(stafferInfo)); }
            }
            if (stafferInfo.ethics_waiver_url) {
                console.log(docs.formatEthicsWaiver(stafferInfo));
                if (sendTweets) { sendTweet(docs.formatEthicsWaiver(stafferInfo)); }
            }
        })

        // IF ERROR THROW TO CONSOLE
        .catch(err => {
            console.error('Error acquiring client: ', err.stack);
        })

        // EITHER WAY SHUT DOWN CLIENT & POOL AFTER
        .finally(() => {
            resetNumTweeted = false; // we don't want to reset the numTweeted column after the first run
            if (pgClient) {
                pgClient.release();
            }
            pool.end(); // pool shutdown
        });
}

// For testing
if (tweetNow) {
    tweeter();
}

// To setup bot for deployment
if (autoTweet) {
    setInterval(tweeter, timeout);
}
