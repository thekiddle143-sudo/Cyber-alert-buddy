// Global variable to hold all data after fetching
window.allAlerts = []; 
// NOTE: window.allAlerts will store the full array of alert objects.

// --------------------------------------------------------------
// INITIALIZATION AND EVENT LISTENERS
// --------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Start the core function to fetch data and run detection
    fetchAndAnalyzeAlerts();
    
    // 2. Keep existing quick actions handlers for the footer section
    const quickActions = document.querySelectorAll('.actions-grid .action-item');
    quickActions.forEach(action => {
        action.addEventListener('click', (e) => {
            const link = action.getAttribute('href');
            if (link === '#') {
                e.preventDefault(); 
                const actionName = action.querySelector('span').textContent;
                console.log(`${actionName} action triggered.`);
            }
        });
    });

    // 3. Attach filter function to the dropdown (assuming the HTML uses onchange="filterAlerts()")
    const filterDropdown = document.getElementById('scam-type-filter');
    if (filterDropdown) {
        filterDropdown.addEventListener('change', filterAlerts);
    }
});

// --------------------------------------------------------------
// CORE DETECTION AND DISPLAY LOGIC
// --------------------------------------------------------------

async function fetchAndAnalyzeAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = '<p style="text-align:center;">Analyzing data with detection engine...</p>';

    try {
        // Connects to the Netlify function (e.g., netlify/functions/analyze-fraud.js)
        const response = await fetch('/.netlify/functions/analyze-fraud'); 
        
        if (!response.ok) {
            throw new Error(`Detection Engine Error! Status: ${response.status}`);
        }
        
        const analyzedData = await response.json(); 
        
        window.allAlerts = analyzedData; // Save all data to the global variable
        
        renderAlerts(analyzedData);
        
        // Show the overall system accuracy (using the static value from the first item)
        if (analyzedData.length > 0) {
            displayAccuracyMeter(analyzedData[0].system_accuracy);
        }

    } catch (error) {
        console.error("Error fetching/analyzing alerts:", error);
        alertsContainer.innerHTML = '<p style="text-align:center; color: red;">Error: Could not connect to Detection Engine. Check Netlify deployment.</p>';
        // Clear the accuracy meter on a critical error
        const accuracyDisplay = document.getElementById('accuracy-display');
        if (accuracyDisplay) {
            accuracyDisplay.innerHTML = '';
        }
    }
}

function renderAlerts(alerts) {
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = ''; 

    if (alerts.length === 0) {
        alertsContainer.innerHTML = '<p style="text-align:center;">No current alerts found matching the filter.</p>';
        // Clear the accuracy meter display when the resulting alert list is empty
        const accuracyDisplay = document.getElementById('accuracy-display');
        if (accuracyDisplay) {
            accuracyDisplay.innerHTML = '';
        }
        return;
    }
    
    // Ensure the accuracy meter is displayed if the alerts are being rendered
    // If window.systemAccuracy was stored, you would call displayAccuracyMeter(window.systemAccuracy) here.
    // Since it's not, we rely on the initial fetch to set it.
    
    alerts.forEach(alert => {
        // Determine display properties based on detection result
        const statusText = alert.is_fraud ? "FRAUD DETECTED" : "SAFE / UNCERTAIN";
        const statusClass = alert.is_fraud ? "critical" : "low";

        const card = document.createElement('div');
        // Use a unique class for styling
        card.className = `alert-card-item ${alert.type.toLowerCase().replace(/\s/g, '-')}`;

        card.innerHTML = `
            <div class="card-header-dynamic">
                <span class="scam-type-tag">${alert.type}</span>
                <span class="timestamp">${alert.location || 'N/A'}</span>
            </div>
            <div class="card-body-dynamic">
                <h3>Incident: ${alert.type}</h3>
                <p><strong>Keywords:</strong> ${alert.keywords}</p>
                <p>URL: ${alert.url || 'N/A'}</p>
            </div>
            <div class="card-footer-dynamic">
                <span class="status ${statusClass}">${statusText}</span>
                <span class="confidence-score">Confidence: ${alert.confidence_score.toFixed(1)}%</span>
            </div>
        `;
        alertsContainer.appendChild(card);
    });
}

// --------------------------------------------------------------
// UTILITY FUNCTIONS
// --------------------------------------------------------------

// Function triggered by the HTML filter dropdown (either via onchange or addEventListener)
function filterAlerts() {
    // Check if the event was triggered by a change event or if we need to manually get the value
    const filterValue = document.getElementById('scam-type-filter').value;
    
    // Get the original accuracy value if available (to re-display it after filtering)
    let accuracyToRestore = null;
    if (window.allAlerts.length > 0) {
        accuracyToRestore = window.allAlerts[0].system_accuracy;
    }

    if (filterValue === 'all') {
        renderAlerts(window.allAlerts);
    } else {
        const filtered = window.allAlerts.filter(alert => alert.type === filterValue);
        renderAlerts(filtered);
    }
    
    // Restore the accuracy meter if alerts are now present after filtering
    if (document.getElementById('alerts-container').children.length > 0 && accuracyToRestore !== null) {
        displayAccuracyMeter(accuracyToRestore);
    }
}

// Function to display the required overall accuracy number
function displayAccuracyMeter(accuracy) {
    const accuracyElement = document.getElementById('accuracy-display');
    if (!accuracyElement) return;

    const meterHTML = `
        <div class="accuracy-meter-box">
            <h3 class="meter-title">System Performance</h3>
            <p class="meter-score">Overall Accuracy: <strong>${accuracy.toFixed(1)}%</strong></p>
            <p class="meter-note">(Based on Rule-Engine evaluation against synthetic data)</p>
        </div>
    `;
    accuracyElement.innerHTML = meterHTML;
}
// --- Alerts Data (Example Content) ---
const allAlerts = [
    { type: "Phishing", title: "Urgent: Email Login Expired", source: "suspicious@mail.com", date: "2025-10-24", severity: "High" },
    { type: "Investment Fraud", title: "Guaranteed 100% Daily Returns", source: "Social Media Ad", date: "2025-10-23", severity: "High" },
    { type: "Genuine Report", title: "Legitimate Bank Notification", source: "bank-alerts@bank.com", date: "2025-10-23", severity: "Low" },
    { type: "Tech Support Scam", title: "Your PC has a virus, Call Now!", source: "Browser Pop-up", date: "2025-10-22", severity: "Medium" },
    { type: "Phishing", title: "Invoice #1234 Due Today", source: "fake-vendor@corp.net", date: "2025-10-22", severity: "Medium" },
    { type: "Investment Fraud", title: "Crypto Pump Group Invite", source: "Messaging App", date: "2025-10-21", severity: "High" },
    { type: "Genuine Report", title: "Online Order Confirmation", source: "store@retailer.com", date: "2025-10-20", severity: "Low" },
    // Expand this array with your live alert data
];

// --- DOM Elements for Alerts ---
const alertsContainer = document.getElementById('alerts-container');
const scamTypeFilter = document.getElementById('scam-type-filter');

// --- Alert Filtering and Display Functions ---

// Function to generate the HTML for a single alert card
function createAlertCard(alert) {
    let severityClass = '';
    // Determine the color class based on severity for visual distinction
    if (alert.severity === 'High') {
        severityClass = 'alert-high';
    } else if (alert.severity === 'Medium') {
        severityClass = 'alert-medium';
    } else {
        severityClass = 'alert-low';
    }

    return `
        <div class="alert-card ${severityClass}">
            <h4 class="alert-title">${alert.title}</h4>
            <p><strong>Type:</strong> ${alert.type}</p>
            <p><strong>Source:</strong> ${alert.source}</p>
            <p><strong>Date:</strong> ${alert.date}</p>
            <span class="alert-severity">${alert.severity}</span>
        </div>
    `;
}

// Function triggered by the 'onchange' event in the dropdown (available globally)
function filterAlerts() {
    // Only run this function if the required DOM elements exist (i.e., we are on alerts.html)
    if (!alertsContainer || !scamTypeFilter) return;

    const selectedType = scamTypeFilter.value;
    
    // 1. Filter the data based on the selection
    const filteredAlerts = allAlerts.filter(alert => {
        if (selectedType === 'all') {
            return true;
        }
        return alert.type === selectedType;
    });

    // 2. Display the filtered results
    displayAlerts(filteredAlerts);
}

// Function to render the HTML for the alert cards
function displayAlerts(alertsToDisplay) {
    if (alertsContainer) {
        if (alertsToDisplay.length === 0) {
            alertsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">No alerts found for the selected type.</p>';
        } else {
            alertsContainer.innerHTML = alertsToDisplay.map(createAlertCard).join('');
        }
    }
}

// Initial call to load all alerts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if the alert filter elements exist before trying to run the function
    if(alertsContainer && scamTypeFilter) {
        filterAlerts(); 
    }
});
