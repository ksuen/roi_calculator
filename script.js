// Predefined values from the DTC Matrix sheet
const MANAGEMENT_COST_PER_LOCATION = 12000;
const ADVERTISING_COST_PER_LOCATION = 17200;

// Conversion ratios
const LEADS_TO_CONSULTS = 60 / 156;
const CONSULTS_TO_STARTS = 36 / 60;
const STARTS_TO_LEADS_RATE = 156 / 400;

// New constants
const EOB_PAYOUT = 86;  // EOB Payout constant
const FREQUENCY = 2;    // Frequency constant

// Updated getLocationCount function
function getLocationCount(starts) {
    if (starts < 1) {
        return 0;
    } else if (starts >= 1 && starts < 700) {
        return 1;
    } else if (starts >= 700 && starts < 1200) {
        return 2;
    } else {
        return 3;
    }
}

function updateCosts(locationCount) {
    const managementCost = locationCount * MANAGEMENT_COST_PER_LOCATION;
    const advertisingCost = locationCount * ADVERTISING_COST_PER_LOCATION;

    document.getElementById('managementCost').textContent = managementCost.toLocaleString();
    document.getElementById('advertisingCost').textContent = advertisingCost.toLocaleString();

    return { managementCost, advertisingCost };
}

function calculateDTCLeads(starts) {
    let dtcLeads = starts * STARTS_TO_LEADS_RATE;

    if (starts === 100) {
        dtcLeads *= 1.5;
    }

    dtcLeads = Math.ceil(dtcLeads);
    document.getElementById('dtcLeads').textContent = dtcLeads;

    return dtcLeads;
}

function calculateDTCStarts(starts) {
    const leads = calculateDTCLeads(starts);
    const consults = Math.ceil(leads * LEADS_TO_CONSULTS);
    const dtcStarts = Math.ceil(consults * CONSULTS_TO_STARTS);

    document.getElementById('dtcConsults').textContent = consults;
    document.getElementById('dtcStarts').textContent = dtcStarts;

    return dtcStarts;
}

function calculateDTCRevenue(starts, treatmentFee) {
    const dtcStarts = calculateDTCStarts(starts);
    const dtcRevenue = dtcStarts * treatmentFee;

    document.getElementById('dtcRevenue').textContent = dtcRevenue.toLocaleString();

    return dtcRevenue;
}

function calculatePracticeRevenue(starts, treatmentFee) {
    const practiceRevenue = starts * treatmentFee;

    document.getElementById('practiceRevenue').textContent = practiceRevenue.toLocaleString();

    return practiceRevenue;
}

function calculateTotalStarts(practiceStarts, dtcStarts) {
    const totalStarts = practiceStarts + dtcStarts;

    document.getElementById('totalStarts').textContent = totalStarts;

    // Calculate and display Dental Insurance Bonus
    calculateDentalInsuranceBonus(totalStarts);

    return totalStarts;
}

function calculateTotalRevenue(practiceRevenue, dtcRevenue) {
    const totalRevenue = practiceRevenue + dtcRevenue;

    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString();

    return totalRevenue;
}

function calculateDentalInsuranceBonus(totalStarts) {
    const dentalInsuranceBonus = totalStarts * FREQUENCY * EOB_PAYOUT;

    document.getElementById('dentalInsuranceBonus').textContent = dentalInsuranceBonus.toLocaleString();

    return dentalInsuranceBonus;
}

function calculateDTCROI(dtcRevenue, managementCost, advertisingCost) {
    const totalCost = managementCost + advertisingCost;
    const dtcROI = Math.ceil(((dtcRevenue - totalCost) / totalCost) * 100);

    document.getElementById('dtcROI').textContent = `${dtcROI}%`;

    return dtcROI;
}

// Initialize default values based on initial slider settings
function initializeValues() {
    const startsValue = parseFloat(document.getElementById('starts').value);
    const treatmentFeeValue = parseFloat(document.getElementById('treatmentFee').value);

    document.getElementById('starts-value').textContent = startsValue;
    document.getElementById('treatmentFee-value').textContent = treatmentFeeValue;

    const practiceRevenue = calculatePracticeRevenue(startsValue, treatmentFeeValue);
    const dtcStarts = calculateDTCStarts(startsValue);
    calculateTotalStarts(startsValue, dtcStarts);
    const dtcRevenue = calculateDTCRevenue(startsValue, treatmentFeeValue);
    calculateTotalRevenue(practiceRevenue, dtcRevenue);

    const locationCount = getLocationCount(startsValue);
    document.getElementById('locationCount').textContent = locationCount;

    const { managementCost, advertisingCost } = updateCosts(locationCount);
    calculateDTCROI(dtcRevenue, managementCost, advertisingCost);
}

// Run the initializeValues function on page load
window.addEventListener('DOMContentLoaded', initializeValues);

document.getElementById('starts').addEventListener('input', function () {
    const startsValue = parseFloat(this.value);
    document.getElementById('starts-value').textContent = startsValue;

    const practiceRevenue = calculatePracticeRevenue(startsValue, parseFloat(document.getElementById('treatmentFee').value));
    const dtcStarts = calculateDTCStarts(startsValue);
    calculateTotalStarts(startsValue, dtcStarts);
    const dtcRevenue = calculateDTCRevenue(startsValue, parseFloat(document.getElementById('treatmentFee').value));
    calculateTotalRevenue(practiceRevenue, dtcRevenue);
});

document.getElementById('treatmentFee').addEventListener('input', function () {
    const treatmentFeeValue = parseFloat(this.value);
    document.getElementById('treatmentFee-value').textContent = treatmentFeeValue;

    const startsValue = parseFloat(document.getElementById('starts').value);
    const practiceRevenue = calculatePracticeRevenue(startsValue, treatmentFeeValue);
    const dtcStarts = calculateDTCStarts(startsValue);
    calculateTotalStarts(startsValue, dtcStarts);
    const dtcRevenue = calculateDTCRevenue(startsValue, treatmentFeeValue);
    calculateTotalRevenue(practiceRevenue, dtcRevenue);
});

document.getElementById('roi-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const starts = parseFloat(document.getElementById('starts').value);
    const treatmentFee = parseFloat(document.getElementById('treatmentFee').value);

    if (isNaN(starts) || isNaN(treatmentFee)) {
        displayResult('Please enter valid numbers.');
        return;
    }

    const locationCount = getLocationCount(starts);
    document.getElementById('locationCount').textContent = locationCount;

    const { managementCost, advertisingCost } = updateCosts(locationCount);

    const dtcRevenue = calculateDTCRevenue(starts, treatmentFee);

    calculateDTCROI(dtcRevenue, managementCost, advertisingCost);
});

function displayResult(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
}
