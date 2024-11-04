// Constants for calculations
const LEADS_TO_CONSULTS = 60 / 156;
const CONSULTS_TO_STARTS = 36 / 60;
const STARTS_TO_LEADS_RATE = 156 / 400;
const EOB_PAYOUT = 86;
const FREQUENCY = 2;
const MANAGEMENT_COST = 12000;
const ADVERTISING_COST = 17200;

// Email format validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (starts === 100) dtcLeads *= 1.5;
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

// Calculate dental insurance bonus using total starts
function calculateDentalInsuranceBonus(practiceStarts, dtcStarts) {
    const totalStarts = practiceStarts + dtcStarts;
    const bonus = totalStarts * FREQUENCY * EOB_PAYOUT;
    document.getElementById('dentalInsuranceBonus').textContent = bonus.toLocaleString();
    return bonus;
}

// Calculate ROI including practice and DTC revenue
function calculateDTCROI(dtcRevenue, managementCost, advertisingCost) {
    const totalCost = managementCost + advertisingCost;
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

    calculateDentalInsuranceBonus(practiceStarts, dtcStarts);

    const locationCount = getLocationCount(practiceStarts);
    updateLocationCountSlider(locationCount);

    const adjustedManagementCost = MANAGEMENT_COST * locationCount;
    const adjustedAdvertisingCost = ADVERTISING_COST * locationCount;

    calculateDTCROI(dtcRevenue, adjustedManagementCost, adjustedAdvertisingCost);
}

// Event listeners
window.addEventListener('DOMContentLoaded', updateAllValues);
document.getElementById('starts').addEventListener('input', updateAllValues);
document.getElementById('treatmentFee').addEventListener('input', updateAllValues);

// Send email summary function
function sendEmailSummary() {
    const doctorName = document.getElementById('doctorName').value;
    const practiceName = document.getElementById('practiceName').value;
    const userEmail = document.getElementById('email').value;

    if (!doctorName || !practiceName || !userEmail) {
        alert("Please fill in the Doctor's Name, Practice Name, and Email fields.");
        return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(userEmail)) {
        alert("Please enter a valid email address.");
        return;
    }

    const emailContent = createEmailContent();
    fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: userEmail, subject: 'Revenue Summary', text: emailContent }),
    })
    .then(response => response.ok ? alert('Email sent successfully!') : Promise.reject('Failed to send email'))
    .catch(error => console.error('Email send error:', error));
}

// Create email content
function createEmailContent() {
    const fields = ['doctorName', 'practiceName', 'starts', 'treatmentFee', 'locationCount', 'managementCost', 'advertisingCost', 'dtcLeads', 'dtcConsults', 'dtcStarts', 'dtcRevenue', 'dtcROI', 'dentalInsuranceBonus'];
    const content = fields.map(id => `${id}: ${document.getElementById(id).textContent}`).join('\n');
    return content;
}
