// Conversion ratios and constants for calculations
const LEADS_TO_CONSULTS = 60 / 156;
const CONSULTS_TO_STARTS = 36 / 60;
const STARTS_TO_LEADS_RATE = 156 / 400;
const EOB_PAYOUT = 86;  // EOB Payout constant
const FREQUENCY = 2;    // Frequency constant

// Determine location count based on starts
function getLocationCount(starts) {
    return starts < 700 ? 1 : starts < 1200 ? 2 : 3;
}

// Update the Location Count slider and display
function updateLocationCountSlider(locationCount) {
    document.getElementById('locationCount-slider').value = locationCount;
    document.getElementById('locationCount').textContent = locationCount;
}

// Retrieve and update management and advertising costs
function updateCosts() {
    const managementCost = parseFloat(document.getElementById('managementCost-slider').value) || 12000;
    const advertisingCost = parseFloat(document.getElementById('advertisingCost-slider').value) || 17200;

    document.getElementById('managementCost-value').textContent = managementCost.toLocaleString();
    document.getElementById('advertisingCost-value').textContent = advertisingCost.toLocaleString();

    return { managementCost, advertisingCost };
}

// Calculate leads from starts
function calculateDTCLeads(starts) {
    let dtcLeads = starts * STARTS_TO_LEADS_RATE;
    dtcLeads = starts === 100 ? dtcLeads * 1.5 : dtcLeads;
    dtcLeads = Math.ceil(dtcLeads);
    document.getElementById('dtcLeads').textContent = dtcLeads;
    return dtcLeads;
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

// Calculate dental insurance bonus
function calculateDentalInsuranceBonus(totalStarts) {
    const bonus = totalStarts * FREQUENCY * EOB_PAYOUT;
    document.getElementById('dentalInsuranceBonus').textContent = bonus.toLocaleString();
    return bonus;
}

// Calculate ROI
function calculateDTCROI(dtcRevenue, managementCost, advertisingCost) {
    const totalCost = managementCost + advertisingCost;
    const dtcROI = Math.ceil(((dtcRevenue - totalCost) / totalCost) * 100);
    document.getElementById('dtcROI').textContent = `${dtcROI}%`;
    return dtcROI;
}

// Function to update all calculated values
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

// Run updateAllValues on page load and on slider input changes
window.addEventListener('DOMContentLoaded', updateAllValues);
document.getElementById('starts').addEventListener('input', updateAllValues);
document.getElementById('treatmentFee').addEventListener('input', updateAllValues);
document.getElementById('managementCost-slider').addEventListener('input', updateAllValues);
document.getElementById('advertisingCost-slider').addEventListener('input', updateAllValues);

// Function to send email summary
function sendEmailSummary() {
    const doctorName = document.getElementById('doctorName').value;
    const userEmail = document.getElementById('email').value;

    if (!doctorName || !userEmail) {
        alert("Please fill in both the Doctor's Name and Email fields.");
        return; // Stop the function if either field is empty
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send email');
        }
        return response.json();
    })
    .then(() => {
        alert('Email sent successfully!');
    })
    .catch(error => {
        alert('Failed to send email. Please try again.');
        console.error('Error:', error);
    });
}
