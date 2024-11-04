
// Constants for calculations
const LEADS_TO_CONSULTS = 60 / 156;
const CONSULTS_TO_STARTS = 36 / 60;
const STARTS_TO_LEADS_RATE = 156 / 400;
const EOB_PAYOUT = 86;
const FREQUENCY = 2;
const MANAGEMENT_COST = 12000;
const ADVERTISING_COST = 17200;

// Determine location count based on starts
function getLocationCount(starts) {
    return starts < 700 ? 1 : starts < 1200 ? 2 : 3;
}

// Update Location Count display
function updateLocationCountSlider(locationCount) {
    document.getElementById('locationCount-slider').value = locationCount;
    document.getElementById('locationCount').textContent = locationCount;
}

// Calculate leads from starts
function calculateDTCLeads(starts) {
    let dtcLeads = starts * STARTS_TO_LEADS_RATE;
    dtcLeads = starts === 100 ? dtcLeads * 1.5 : dtcLeads;
    document.getElementById('dtcLeads').textContent = Math.ceil(dtcLeads);
    return Math.ceil(dtcLeads);
}

// Calculate consults and starts based on leads
function calculateDTCStarts(starts) {
    const leads = calculateDTCLeads(starts);
    const consults = Math.ceil(leads * LEADS_TO_CONSULTS);
    document.getElementById('dtcConsults').textContent = consults;

    const dtcStarts = Math.ceil(consults * CONSULTS_TO_STARTS);
    document.getElementById('dtcStarts').textContent = dtcStarts;

    return dtcStarts;
}

// Calculate revenue based on starts and treatment fee
function calculateDTCRevenue(starts, treatmentFee) {
    const dtcStarts = calculateDTCStarts(starts);
    const dtcRevenue = dtcStarts * treatmentFee;
    document.getElementById('dtcRevenue').textContent = dtcRevenue.toLocaleString();
    return dtcRevenue;
}

// Calculate dental insurance bonus using total starts (practice + DTC starts)
function calculateDentalInsuranceBonus(practiceStarts, dtcStarts) {
    const totalStarts = practiceStarts + dtcStarts;
    const bonus = totalStarts * FREQUENCY * EOB_PAYOUT;
    document.getElementById('dentalInsuranceBonus').textContent = bonus.toLocaleString();
    return bonus;
}

// Calculate ROI including practice and DTC revenue
function calculateDTCROI(dtcRevenue, treatmentFee, managementCost, advertisingCost) {
    // Calculate the total annual cost
    const totalCost = managementCost + advertisingCost;

    // Calculate ROI as a percentage and round to the nearest integer
    const dtcROI = Math.ceil(((dtcRevenue - totalCost) / totalCost) * 100);
    document.getElementById('dtcROI').textContent = `${dtcROI}%`;
    return dtcROI;
}

// Update all calculated values
function updateAllValues() {
    const practiceStarts = parseFloat(document.getElementById('starts').value);
    const treatmentFeeValue = parseFloat(document.getElementById('treatmentFee').value);

    document.getElementById('starts-value').textContent = practiceStarts;
    document.getElementById('treatmentFee-value').textContent = treatmentFeeValue;

    const dtcRevenue = calculateDTCRevenue(practiceStarts, treatmentFeeValue);
    const dtcStarts = calculateDTCStarts(practiceStarts);

    // Calculate bonus using the total starts (practice + DTC)
    calculateDentalInsuranceBonus(practiceStarts, dtcStarts);

    const locationCount = getLocationCount(practiceStarts);
    updateLocationCountSlider(locationCount);

    const adjustedManagementCost = MANAGEMENT_COST * locationCount;
    const adjustedAdvertisingCost = ADVERTISING_COST * locationCount;

    // Calculate ROI using total revenue (DTC revenue + practice revenue)
    calculateDTCROI(dtcRevenue, treatmentFeeValue, adjustedManagementCost, adjustedAdvertisingCost);
}

window.addEventListener('DOMContentLoaded', updateAllValues);
document.getElementById('starts').addEventListener('input', updateAllValues);
document.getElementById('treatmentFee').addEventListener('input', updateAllValues);

function sendEmailSummary() {
    const doctorName = document.getElementById('doctorName').value;
    const userEmail = document.getElementById('email').value;

    if (!doctorName || !userEmail) {
        alert("Please fill in both the Doctor's Name and Email fields.");
        return;
    }

    const practiceName = document.getElementById('practiceName').value;
    const starts = document.getElementById('starts-value').textContent;
    const treatmentFee = document.getElementById('treatmentFee-value').textContent;
    const locationCount = document.getElementById('locationCount').textContent;
    const managementCost = document.getElementById('managementCost-value').textContent;
    const advertisingCost = document.getElementById('advertisingCost-value').textContent;
    const dtcLeads = document.getElementById('dtcLeads').textContent;
    const dtcConsults = document.getElementById('dtcConsults').textContent;
    const dtcStarts = document.getElementById('dtcStarts').textContent;
    const dtcRevenue = document.getElementById('dtcRevenue').textContent;
    const dtcROI = document.getElementById('dtcROI').textContent;
    const dentalInsuranceBonus = document.getElementById('dentalInsuranceBonus').textContent;
    const totalRevenue = document.getElementById('totalRevenue').textContent;
    const totalCost = document.getElementById('totalCost').textContent;

    const emailContent = `
        Doctor's Name: ${doctorName}
        Practice Name: ${practiceName}
        Practice Starts: ${starts}
        Treatment Fee: $${treatmentFee}
        Locations: ${locationCount}
        Management Fee (Monthly): $${managementCost}
        Advertising (Monthly): $${advertisingCost}

        Your Dental Pain Eraser Opportunity:
        - Leads: ${dtcLeads}
        - Consults: ${dtcConsults}
        - Starts: ${dtcStarts}
        - Your Starts New Revenue: $${dtcRevenue}
        - Total Revenue: $${totalRevenue}
        - Total Cost (Annual): $${totalCost}

        Your Return on Investment (ROI):
        - ROI: ${dtcROI}
        - Dental Insurance Bonus: $${dentalInsuranceBonus}
    `;

    fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: userEmail, subject: 'Revenue Summary', text: emailContent }),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to send email');
        return response.json();
    })
    .then(() => alert('Email sent successfully!'))
    .catch(error => console.error('Email send error:', error));
}
