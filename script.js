// Conversion ratios and constants for calculations
const LEADS_TO_CONSULTS = 60 / 156;
const CONSULTS_TO_STARTS = 36 / 60;
const STARTS_TO_LEADS_RATE = 156 / 400;
const EOB_PAYOUT = 86;  // EOB Payout constant
const FREQUENCY = 2;    // Frequency constant

function getLocationCount(starts) {
    if (starts < 1) {
        return 1;
    } else if (starts >= 1 && starts < 700) {
        return 1;
    } else if (starts >= 700 && starts < 1200) {
        return 2;
    } else {
        return 3;
    }
}

// Update Locations slider (read-only) and display
function updateLocationCountSlider(locationCount) {
    const locationSlider = document.getElementById('locationCount-slider');
    locationSlider.value = locationCount;
    document.getElementById('locationCount').textContent = locationCount;
}

function updateCosts() {
    const managementCost = parseFloat(document.getElementById('managementCost-slider').value) || 12000;
    const advertisingCost = parseFloat(document.getElementById('advertisingCost-slider').value) || 17200;

    // Update the displayed values next to the sliders
    document.getElementById('managementCost-value').textContent = managementCost.toLocaleString();
    document.getElementById('advertisingCost-value').textContent = advertisingCost.toLocaleString();

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

// Function to initialize and update all values
function updateAllValues() {
    const startsValue = parseFloat(document.getElementById('starts').value) || 100;
    const treatmentFeeValue = parseFloat(document.getElementById('treatmentFee').value) || 6500;

    document.getElementById('starts-value').textContent = startsValue;
    document.getElementById('treatmentFee-value').textContent = treatmentFeeValue;

    const dtcRevenue = calculateDTCRevenue(startsValue, treatmentFeeValue);
    const dtcStarts = calculateDTCStarts(startsValue);
    calculateDentalInsuranceBonus(dtcStarts);

    const locationCount = getLocationCount(startsValue);
    updateLocationCountSlider(locationCount);

    const { managementCost, advertisingCost } = updateCosts();
    calculateDTCROI(dtcRevenue, managementCost, advertisingCost);
}

// Run the updateAllValues function on page load
window.addEventListener('DOMContentLoaded', updateAllValues);

// Add event listeners to each slider to trigger updates when adjusted
document.getElementById('starts').addEventListener('input', updateAllValues);
document.getElementById('treatmentFee').addEventListener('input', updateAllValues);
document.getElementById('managementCost-slider').addEventListener('input', updateAllValues);
document.getElementById('advertisingCost-slider').addEventListener('input', updateAllValues);

function sendEmailSummary() {
    const doctorName = document.getElementById('doctorName').value;
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
    const userEmail = document.getElementById('email').value;

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
        
        Your Return on Investment (ROI):
        - ROI: ${dtcROI}
        - Dental Insurance Bonus: $${dentalInsuranceBonus}
    `;

    // Backend call to send email (requires server-side setup)
    // For example, using fetch to post data to a backend service
    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: userEmail,
            cc: 'your-email@example.com', // replace with your own email address
            subject: 'Orthodontic Practice Revenue Summary',
            text: emailContent,
        }),
    })
    .then(response => response.json())
    .then(data => {
        alert('Email sent successfully!');
    })
    .catch(error => {
        alert('Failed to send email.');
        console.error('Error:', error);
    });
}
