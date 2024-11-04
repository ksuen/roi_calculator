// Constants for calculations
const LEADS_TO_CONSULTS = 60 / 156;
const CONSULTS_TO_STARTS = 36 / 60;
const STARTS_TO_LEADS_RATE = 156 / 400;
const EOB_PAYOUT = 86;
const FREQUENCY = 2;
const MANAGEMENT_COST = 12000;
const ADVERTISING_COST = 17200;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to determine location count based on starts
function getLocationCount(starts) {
    return starts < 700 ? 1 : starts < 1200 ? 2 : 3;
}

// Calculate the number of leads based on practice starts
function calculateDTCLeads(starts) {
    let dtcLeads = starts * STARTS_TO_LEADS_RATE;
    if (starts === 100) dtcLeads *= 1.5;
    return Math.ceil(dtcLeads);
}

// Calculate the number of consults based on leads
function calculateDTCConsults(leads) {
    return Math.ceil(leads * LEADS_TO_CONSULTS);
}

// Calculate the number of starts based on consults
function calculateDTCStarts(starts) {
    const leads = calculateDTCLeads(starts);
    const consults = calculateDTCConsults(leads);
    return Math.ceil(consults * CONSULTS_TO_STARTS);
}

// Calculate the revenue from starts and treatment fee
function calculateDTCRevenue(starts, treatmentFee) {
    return calculateDTCStarts(starts) * treatmentFee;
}

// Calculate the dental insurance bonus based on starts
function calculateDentalInsuranceBonus(practiceStarts, dtcStarts) {
    return (practiceStarts + dtcStarts) * FREQUENCY * EOB_PAYOUT;
}

// Calculate the Return on Investment (ROI)
function calculateDTCROI(dtcRevenue, managementCost, advertisingCost) {
    const totalCost = managementCost + advertisingCost;
    return Math.ceil(((dtcRevenue - totalCost) / totalCost) * 100);
}

// Update all calculated values and display them in the HTML
function updateAllValues() {
    const practiceStarts = parseFloat(document.getElementById('starts').value);
    const treatmentFeeValue = parseFloat(document.getElementById('treatmentFee').value);
    const locationCount = getLocationCount(practiceStarts);
    const practiceLocationCount = parseFloat(document.getElementById('practiceLocationCount-slider').value);

    const dtcLeads = calculateDTCLeads(practiceStarts);
    const dtcConsults = calculateDTCConsults(dtcLeads);
    const dtcStarts = calculateDTCStarts(practiceStarts);
    const dtcRevenue = calculateDTCRevenue(practiceStarts, treatmentFeeValue);
    const dentalBonus = calculateDentalInsuranceBonus(practiceStarts, dtcStarts);

    document.getElementById('starts-value').textContent = practiceStarts;
    document.getElementById('treatmentFee-value').textContent = treatmentFeeValue.toLocaleString();
    document.getElementById('practiceLocationCount').textContent = practiceLocationCount;
    document.getElementById('dtcLeads').textContent = dtcLeads;
    document.getElementById('dtcConsults').textContent = dtcConsults;
    document.getElementById('dtcStarts').textContent = dtcStarts;
    document.getElementById('dtcRevenue').textContent = dtcRevenue.toLocaleString();
    document.getElementById('dentalInsuranceBonus').textContent = dentalBonus.toLocaleString();

    const adjustedManagementCost = MANAGEMENT_COST * locationCount;
    const adjustedAdvertisingCost = ADVERTISING_COST * locationCount;
    document.getElementById('dtcROI').textContent = `${calculateDTCROI(dtcRevenue, adjustedManagementCost, adjustedAdvertisingCost)}%`;
}

// Validate the email format and send the email summary
function sendEmailSummary() {
    const doctorName = document.getElementById('doctorName').value;
    const practiceName = document.getElementById('practiceName').value;
    const userEmail = document.getElementById('email').value;

    if (!doctorName || !practiceName || !userEmail || !EMAIL_REGEX.test(userEmail)) {
        alert("Please complete all required fields with a valid email.");
        return;
    }

    const emailContent = createEmailContent();
    fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: userEmail, subject: 'Revenue Summary', text: emailContent }),
    })
    .then(response => {
        if (response.ok) alert('Email sent successfully!');
        else throw new Error('Failed to send email');
    })
    .catch(error => console.error('Email send error:', error));
}

// Generate the content for the email
function createEmailContent() {
    const fields = ['doctorName', 'practiceName', 'starts', 'treatmentFee', 'practiceLocationCount', 'managementCost', 'advertisingCost', 'dtcLeads', 'dtcConsults', 'dtcStarts', 'dtcRevenue', 'dtcROI', 'dentalInsuranceBonus'];
    return fields.map(id => `${id}: ${document.getElementById(id).textContent}`).join('\n');
}

// Initialize event listeners for form inputs
window.addEventListener('DOMContentLoaded', updateAllValues);
document.getElementById('starts').addEventListener('input', updateAllValues);
document.getElementById('treatmentFee').addEventListener('input', updateAllValues);
document.getElementById('practiceLocationCount-slider').addEventListener('input', updateAllValues);
