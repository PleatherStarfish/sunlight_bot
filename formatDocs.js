const formatLinkedIn = function(person) {
    return `${person.name} has a profile on LinkedIn which can be found here: ${person.linkedin_url}`;
};

const formatFinancialDisclosure = function(person) {
    return `${person.name}'s financial disclosure form can be found here: ${person.financial_disclosure_url}`;
};

const formatResume = function(person) {
    return `${person.name}'s resume can be found here: ${person.resume_document_url}`;
};

const formatEthicsWaiver = function(person) {
    return `${person.name}'s ethics waiver can be found here: ${person.ethics_waiver_url}. (An ethics waiver allows 
    appointees to bypass anti-nepotism rules against working with former colleagues or clients.)`;
};

module.exports = {
    formatLinkedIn,
    formatFinancialDisclosure,
    formatResume,
    formatEthicsWaiver,
};
