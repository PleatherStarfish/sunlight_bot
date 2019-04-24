// Use dotenv to read .env vars into Node
require('dotenv').config();
let formatDepartmentName = require('./formatDepartmentName');

const Twit = require('twit');
const pg = require('pg');

const config = require('./config.js');

const T = new Twit(config.twitter);

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

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function formatTweet(person) {

    tweetString += `Trump Administration appointee `;

    if ( person.name && person.position_title_1 && person.position_title_2 && person.position_title_3)
    {
        tweetString += `${person.name} has served as ${person.position_title_1}, ${person.position_title_2}, and ${person.position_title_3}`
    }
    else if ( person.name && person.position_title_1 && person.position_title_2 )
    {
        tweetString += `${person.name} has served as ${person.position_title_1} and ${person.position_title_2}`
    }
    else if ( person.name && person.position_title_1 )
    {
        tweetString += `${person.name} has served as ${person.position_title_1}`
    }
    else {
        console.error(`formatTweet function input error `, person);
    }

    tweetString += ` ${formatDepartmentName(person.agency_name)}`;

    let startDate = person.start_date;
    let parts = startDate.split('-');
    startDate = new Date(parts[0], parts[1] - 1, parts[2].split(' ')[0]);
    let dateString = startDate.toDateString();
    const dateStringArray = dateString.split(' ');
    if (dateStringArray[1] !== 'May') {
        dateString = `${dateStringArray[1]}. ${dateStringArray[2]}, ${dateStringArray[3]}`;
    } else {
        dateString = `${dateStringArray[1]} ${dateStringArray[2]}, ${dateStringArray[3]}`
    }

    if (person.start_date) {tweetString += ` since ${dateString}`}

    if (person.grade_level) {tweetString += ` with a salary of ${formatter.format(person.grade_level).slice(0, -3)}`}

    return tweetString;
}

function formatLinkedIn(person) {
    return `${person.name} has a profile on LinkedIn which can be found here: ${person.linkedin_url}`;
}

function formatFinancialDisclosure(person) {
    return `${person.name}'s financial disclosure form can be found here: ${person.financial_disclosure_url}`;
}

function formatResume(person) {
    return `${person.name}'s resume can be found here: ${person.resume_document_url}`;
}

function formatEthicsWaiver(person) {
    return `${person.name}'s ethics waiver can be found here: ${person.ethics_waiver_url}. (An ethics waiver allows 
    appointees to bypass anti-nepotism rules against working with former colleagues or clients.)`;
}

let pgClient = null;

const randomRow = 'SELECT * FROM staffers WHERE end_date IS NULL ' +
    'AND name IS NOT NULL ' +
    'AND start_date IS NOT NULL ' +
    'AND agency_name IS NOT NULL ' +
    'AND position_title_1 IS NOT NULL ' +
    'AND num_times_tweeted = ( SELECT MIN (num_times_tweeted) FROM staffers )' + // select from among the untweeted
    'ORDER BY random() limit 1';

const updateTweeted =  'UPDATE staffers SET num_times_tweeted=num_times_tweeted + 1 WHERE id=800';

let stafferInfo = {};
let tweetString = '';

function tweeter() {

    stafferInfo = {};
    tweetString = '';

    let pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true
    } || config.db);

    pool.connect()

        .then(client => {
            pgClient = client;
            return pgClient.query(randomRow)
                .then(res => {
                    stafferInfo = res.rows[0];   // (1) GET INFO FROM DB AND SET VARIABLE
                    // console.log(stafferInfo);

                })
                .catch(err => console.error('Error executing first psql query', err.stack));
        })

        .then(() => {
            return pgClient.query(updateTweeted) // (2) UPDATE "TWEETED" COUNT
                .then(res => {
                    // console.log(res);
                })
                .catch(err => console.error('Error executing second psql query', err.stack));
        })
        .then(() => {                       // (3) POST TWEET
            tweetString = formatTweet(stafferInfo);

            if ((`${tweetString} (data from ProPublica's Trump Town dataset)`).length <= (280)) {
                tweetString += ` (data from ProPublica's Trump Town dataset)`
            }
            else if (tweetString.length <= 280) {

                console.log(tweetString);

                sendTweet(tweetString);

                if (stafferInfo.linkedin_url) {
                    console.log(formatLinkedIn(stafferInfo));
                    sendTweet(formatLinkedIn(stafferInfo));
                }
                if (stafferInfo.resume_document_url) {
                    console.log(formatResume(stafferInfo));
                    sendTweet(formatResume(stafferInfo));
                }
                if (stafferInfo.financial_disclosure_url) {
                    console.log(formatFinancialDisclosure(stafferInfo));
                    sendTweet(formatFinancialDisclosure(stafferInfo));
                }
                if (stafferInfo.ethics_waiver_url) {
                    console.log(formatEthicsWaiver(stafferInfo));
                    sendTweet(formatEthicsWaiver(stafferInfo));
                }
            }
            else {
                console.log(`Tweet is longer than 280 characters: ${tweetString}`);
            }
        })
        .catch(err => {
            console.error('Error acquiring client: ', err.stack);  // IF ERROR THROW TO CONSOLE
        })
        .finally(() => {                                // EITHER WAY SHUT DOWN CLIENT & POOL AFTER
            if (pgClient) {
                pgClient.release();
            }
            pool.end(); // pool shutdown
        });
}

// tweeter(); // For testing

setInterval(tweeter, 6*60*60*1000); // Tweet once every six hours (6 hr. * 60 min. * 60 sec. * 1000 ms.)