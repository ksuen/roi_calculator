function sendEmailSummary() {
    const doctorName = document.getElementById('doctorName').value;
    const practiceName = document.getElementById('practiceName').value;
    const userEmail = document.getElementById('email').value;

    if (!doctorName || !practiceName || !userEmail || !EMAIL_REGEX.test(userEmail)) {
        alert("Please complete all required fields with a valid email.");
        return;
    }

    const emailContent = createEmailContent();

    // Send email to the user
    fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: userEmail, subject: 'Your Synapse Dental ROI Summary', text: emailContent }),
    });

    // Send a copy to yourself
    fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'sales@synapsedental.com', subject: 'Synapse Dental ROI Summary (Copy)', text: emailContent }),
    })
    .then(response => {
        if (response.ok) alert('Email sent successfully!');
        else throw new Error('Failed to send email');
    })
    .catch(error => console.error('Email send error:', error));
}


// Generate HTML content for the user email
function createUserEmailContent() {
    const doctorName = document.getElementById('doctorName').value;
    const practiceName = document.getElementById('practiceName').value;
    const userEmail = document.getElementById('email').value;
    const dtcLeads = document.getElementById('dtcLeads').textContent;
    const dtcConsults = document.getElementById('dtcConsults').textContent;
    const dtcStarts = document.getElementById('dtcStarts').textContent;
    const dtcRevenue = document.getElementById('dtcRevenue').textContent;
    const dtcROI = document.getElementById('dtcROI').textContent;
    const dentalInsuranceBonus = document.getElementById('dentalInsuranceBonus').textContent;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Main color variables */
        :root {
            --primary-bg-color: #f5f7fa;
            --container-bg-color: white;
            --primary-color: #333;
            --secondary-color: #296e94;
            --button-bg-color: #296e94;
            --font-family: 'Open Sans', sans-serif;
        }
        
        /* General reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background-color: var(--primary-bg-color);
            font-family: var(--font-family);
            padding: 20px;
            color: var(--primary-color);
        }
        
        .email-container {
            background-color: var(--container-bg-color);
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
        }
        
        h1, h2, h3 {
            text-align: center;
            color: var(--secondary-color);
            margin-bottom: 15px;
        }
        
        h1 {
            font-size: 24px;
        }
        
        h2, h3 {
            font-size: 20px;
        }
        
        .section-title {
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .output-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        
        .output-table td, .output-table th {
            padding: 10px;
            text-align: left;
            color: var(--primary-color);
        }
        
        .output-table th {
            background-color: var(--secondary-color);
            color: white;
            text-align: center;
        }
        
        .summary-value {
            text-align: right;
            font-weight: bold;
        }
        
    </style>
</head>
<body>
    <div class="email-container">
        <h1>Revenue Summary</h1>
        <h2>For Orthodontic Practice</h2>

        <p>Dear <strong>{{doctorName}}</strong> ({{userEmail}}),</p>
        <p>Here is the revenue summary based on the information provided for your practice, <strong>{{practiceName}}</strong>.</p>

        <h3>Your Dental Pain Eraser Opportunity</h3>
        <table class="output-table">
            <tr>
                <th>Description</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Leads</td>
                <td class="summary-value">{{dtcLeads}}</td>
            </tr>
            <tr>
                <td>Consults</td>
                <td class="summary-value">{{dtcConsults}}</td>
            </tr>
            <tr>
                <td>Starts</td>
                <td class="summary-value">{{dtcStarts}}</td>
            </tr>
            <tr>
                <td>New Revenue from Starts</td>
                <td class="summary-value">${{dtcRevenue}}</td>
            </tr>
        </table>

        <h3>Your Return on Investment (ROI)</h3>
        <table class="output-table">
            <tr>
                <th>Description</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>ROI</td>
                <td class="summary-value">{{dtcROI}}%</td>
            </tr>
            <tr>
                <td>Dental Insurance Bonus</td>
                <td class="summary-value">${{dentalInsuranceBonus}}</td>
            </tr>
        </table>

        <p>Thank you for using the Revenue Calculator. We hope this summary gives you a clear view of the potential financial impact on your practice.</p>

        <p>Best regards,<br>Your ROI Calculator Team</p>
    </div>
</body>
</html>
    `;
}
