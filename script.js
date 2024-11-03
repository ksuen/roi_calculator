// Predefined values from the DTC Matrix sheet
const LEADS_TO_CONSULTS = (60 / 156);
const CONSULTS_TO_STARTS = (36 / 60);
const MANAGEMENT_COST_PER_LOCATION = 12000;
const ADVERTISING_COST_PER_LOCATION = 17200;

function getLocationCount(starts) {
    if (starts < 1) {
        return 0;
    } else if (starts >= 1 && starts < 700) {
        return 1;
    } else if (starts >= 700 && starts < 1100) {
        return 2;
    } else {
        return 3;
    }
}

function updateCosts(locationCount) {
    const managementCost = locationCount * MANAGEMENT_COST_PER_LOCATION;
    const advertisingCost = locationCount * ADVERTISING_COST_PER_LOCATION;

    // Display updated costs on the page
    document.getElementById('managementCost').textContent = managementCost.toLocaleString();
    document.getElementById('advertisingCost').textContent = advertisingCost.toLocaleString();

    return { managementCost, advertisingCost };
}

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

    const totalCost = managementCost + advertisingCost;
    const revenue = starts * treatmentFee;
    const roi = ((revenue - totalCost) / totalCost) * 100;

    displayResult(`ROI: ${roi.toFixed(2)}%`);
});

function displayResult(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
}
