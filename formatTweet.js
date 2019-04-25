let agency = require('./formatAgency.js');

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function formatDate(date) {
    const dateArray = date.split('-');
    const startDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2].split(' ')[0]);
    let dateString = startDate.toDateString();
    const dateStringArray = dateString.split(' ');

    // May is the only 3-letter month, so doesn't need punctuation
    return (dateStringArray[1] !== 'May') ?
        `${dateStringArray[1]}. ${dateStringArray[2]}, ${dateStringArray[3]}` :
        `${dateStringArray[1]} ${dateStringArray[2]}, ${dateStringArray[3]}`;
}

const formatText = function(person, tweetString) {

    tweetString += `Trump Administration appointee `;

    if (!person.name) { console.error("No staffer name given to formatText function."); }
    const stafferName = person.name.replace(/[^a-zA-Z-. ]/, '');

    if ( person.position_title_1 && person.position_title_2 && person.position_title_3)
    {
        tweetString += `${stafferName} has served as ${person.position_title_1.replace(/[^a-zA-Z0-9-.;:,'"() ]/, '')}, 
        ${person.position_title_2.replace(/[^a-zA-Z0-9-.;:,'"() ]/, '')}, and 
        ${person.position_title_3.replace(/[^a-zA-Z0-9-.;:,'"() ]/, '')}`;
    }
    else if ( person.position_title_1 && person.position_title_2 )
    {
        tweetString += `${stafferName} has served as ${person.position_title_1.replace(/[^a-zA-Z0-9-.;:,'"() ]/, '')} 
        and ${person.position_title_2.replace(/[^a-zA-Z0-9-.;:,'"() ]/, '')}`;
    }
    else if ( person.position_title_1 )
    {
        tweetString += `${stafferName} has served as ${person.position_title_1.replace(/[^a-zA-Z0-9-.;:,'"() ]/, '')}`
    }
    else {
        console.error(`formatTweet function input error `, person);
    }

    tweetString += ` ${agency.formatAgency(person.agency_name.replace(/[^a-zA-Z0-9-.;:,'"() ]/, ''))}`;

    if (person.start_date) {tweetString += ` since ${formatDate(person.start_date)}`}

    if (person.grade_level) {tweetString += ` with a salary of ${formatter.format(person.grade_level).slice(0, -3)}`}

    return tweetString;
};

module.exports = { formatText, };
