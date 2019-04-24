function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join('');
}

let formatDepartmentName = function(agency) {
    switch(agency) {
        case 'Agriculture':
        case 'Commerce':
        case 'Corporation for National and Community Service':
        case 'Defense':
        case 'Education':
        case 'Energy':
        case 'Health and Human Services':
        case 'Homeland Security':
        case 'Housing and Urban Development':
        case 'Justice':
        case 'Labor':
        case 'State':
        case 'Transportation':
        case 'Veterans Affairs':
            return `of the Department of ${agency}`;

        case 'Interior':
        case 'Treasury':
            return `of the Department of the ${agency}`;

        case 'Management and Budget':
        case 'Personnel Management':
            return `for the Office of ${agency}`;

        case 'U.S. Trade Representative':
            return `for the Office of the ${agency}`;

        case 'Health and Human':
            return `of the Department of ${agency} Services`;

        case 'Administrative Conference of the U.S.':
        case 'African Development Bank':
        case 'Air Force':
        case 'Appalachian Regional Commission':
        case 'Army':
        case 'Central Intelligence Agency':
        case 'Environmental Protection Agency':
        case 'European Bank for Reconstruction and Development':
        case 'Export-Import Bank':
        case 'Farm Credit Administration':
        case 'Federal Housing Finance Agency':
        case 'Broadcasting Board of Governors':
        case 'Commission on Civil Rights':
        case 'Commodity Futures Trading Commission':
        case 'Consumer Product Safety Commission':
        case 'Defense Nuclear Facilities Safety Board':
        case 'Equal Employment Opportunity Commission':
        case 'Federal Communications Commission':
        case 'Federal Election Commission':
        case 'Federal Energy Regulatory Commission':
        case "Delta Regional Authority":
        case 'Federal Labor Relations Authority':
        case 'Federal Maritime Commission':
        case 'Federal Mediation and Conciliation Service':
        case 'Federal Mine Safety and Health Review Commission':
        case 'Federal Reserve System':
        case 'Federal Trade Comission':
        case 'Federal Trade Commission':
        case 'General Service Adminstration':
        case 'International Bank for Reconstruction and Development':
        case 'Millennium Challenge Corporation':
        case 'National Aeronautics and Space Administration':
        case 'National Credit Union Administration':
        case 'National Endowment for the Humanities':
        case 'Navy':
        case 'Nuclear Regulatory Commission':
        case 'Occupational Safety and Health Review Commission':
        case 'Overseas Private Investment Corporation':
        case 'Peace Corps':
        case 'Securities and Exchange Commission':
        case 'Selective Service System':
        case 'Small Business Administration':
        case 'White House Office':
            return `of the ${agency}`;

        case 'Trade and Development':
            return `of the ${agency} Agency`;

        case 'National Endowment for the Arts':
        case 'National Science Foundation':
        case 'Office of National Drug Control Policy':
        case 'Office of the Director of National Intelligence':
        case 'Office of the Special Counsel':
        case 'Office of the Vice President':
        case 'President\'s Commission on White House Fellowships':
        case 'U.S. Agency for International Development':
        case 'U.S. International Trade Commission':
            return `for the ${agency}`;

        case 'National Labor Relations Board':
        case 'National Mediation Board':
        case 'National Transportation Safety Board':
            return `on the ${agency}`;
    }
};

module.exports = formatDepartmentName;