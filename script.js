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
// --- Quiz Data (12 Questions) ---
const quizData = [
    {
      question: "What is the primary goal of a phishing attack?",
      options: [
        "To crash your computer's operating system.",
        "To manipulate a user into revealing sensitive information.",
        "To monitor your network traffic without authorization.",
        "To permanently delete all files on your hard drive."
      ],
      answer: 1 // Index of the correct answer (0-based)
    },
    {
      question: "Which characteristic is most important for creating a strong and secure password?",
      options: [
        "Using a combination of your name and birthday.",
        "Ensuring it is at least 15 characters long and includes a random mix of characters.",
        "Changing it frequently, such as every two weeks.",
        "Using the same password across all your accounts for ease of recall."
      ],
      answer: 1
    },
    {
      question: "What type of malicious software encrypts a user's files and demands payment to restore access?",
      options: [
        "Spyware",
        "Adware",
        "Ransomware",
        "Trojan Horse"
      ],
      answer: 2
    },
    {
      question: "What security measure requires a user to provide two or more different verification factors to gain access to a resource?",
      options: [
        "Single Sign-On (SSO)",
        "Biometric Authentication",
        "Multi-Factor Authentication (MFA)",
        "CAPTCHA"
      ],
      answer: 2
    },
    {
      question: "What does the 's' in https:// stand for in a web address, and why is it important?",
      options: [
        "Search, meaning the site is optimized for search engines.",
        "Secure, meaning the connection is encrypted with SSL/TLS.",
        "Server, meaning the site is hosted on a high-end web server.",
        "Source, meaning the original source code is available."
      ],
      answer: 1
    },
    {
      question: "An attacker calls an employee pretending to be an IT technician to gain their password. This is an example of what kind of threat?",
      options: [
        "Denial of Service (DoS)",
        "Social Engineering",
        "SQL Injection",
        "Zero-Day Exploit"
      ],
      answer: 1
    },
    {
      question: "What is the primary reason for regularly updating your operating system and applications?",
      options: [
        "To improve aesthetic appeal with new themes and icons.",
        "To install patches for newly discovered security vulnerabilities.",
        "To reduce the amount of memory (RAM) used by the system.",
        "To increase compatibility with older, outdated hardware."
      ],
      answer: 1
    },
    {
      question: "When connecting to public Wi-Fi, what tool should you always use to protect your data, especially when banking or shopping?",
      options: [
        "A standard anti-virus program.",
        "An extra-long password.",
        "A Virtual Private Network (VPN).",
        "A physical firewall device."
      ],
      answer: 2
    },
    {
      question: "Why is maintaining offline or cloud backups of your important files a vital part of cyber security?",
      options: [
        "It helps prevent all types of malware from infecting your computer.",
        "It allows you to restore your data after an incident like ransomware or hardware failure.",
        "It automatically detects phishing emails before you open them.",
        "It is required for all modern operating systems to function."
      ],
      answer: 1
    },
    {
      question: "Before clicking a link in an email, which part of the URL should you most closely examine to verify the link's legitimacy?",
      options: [
        "The protocol prefix (http:// or https://).",
        "The file name or path after the domain (/login.php).",
        "The domain name (e.g., google.com in mail.google.com).",
        "The first two characters of the link."
      ],
      answer: 2
    },
    {
      question: "If you receive an unexpected email from your bank asking you to click a link to verify your account immediately, what is the best immediate action?",
      options: [
        "Click the link and quickly enter your login information before the site expires.",
        "Reply to the email asking for confirmation of the request.",
        "Open a new browser window and navigate to the bank's official website directly.",
        "Forward the email to a friend to see if they received the same message."
      ],
      answer: 2
    },
    {
      question: "When setting up a new Internet of Things (IoT) device (e.g., a smart camera), what is the most important initial security step?",
      options: [
        "Changing the factory default username and password.",
        "Connecting it to a guest Wi-Fi network.",
        "Downloading a mobile anti-virus application.",
        "Enabling the Bluetooth function."
      ],
      answer: 0
    }
];

// --- Quiz Variables ---
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = -1;

// --- DOM Elements ---
// Ensure these elements exist in your index.html!
const quizModal = document.getElementById('quiz-modal');
const startQuizBtn = document.getElementById('start-quiz-btn');
const closeQuizBtn = document.getElementById('close-quiz-btn');
const questionArea = document.getElementById('question-area');
const optionsArea = document.getElementById('options-area');
const nextBtn = document.getElementById('next-btn');
const resultSection = document.getElementById('result-section');
const quizSection = document.getElementById('quiz-section');
const scoreDisplay = document.getElementById('score-display');
const ratingDisplay = document.getElementById('rating-display');
const retakeBtn = document.getElementById('retake-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');


// --- Event Listeners to Control the Modal ---
if (startQuizBtn) {
    startQuizBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        quizModal.style.display = 'block';
        startQuiz();
    });
}

if (closeQuizBtn) {
    closeQuizBtn.addEventListener('click', () => {
        quizModal.style.display = 'none';
    });
}

window.addEventListener('click', (event) => {
    if (event.target === quizModal) {
        quizModal.style.display = 'none';
    }
});

if (nextBtn) nextBtn.addEventListener('click', handleNextButton);
if (retakeBtn) retakeBtn.addEventListener('click', startQuiz);


// --- Quiz Logic Functions ---

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    
    // Reset views
    if(quizSection) quizSection.style.display = 'block';
    if(resultSection) resultSection.style.display = 'none';
    if(nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = 'Next Question';
    }
    
    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= quizData.length) return; // Prevent error if logic is skipped
    const q = quizData[currentQuestionIndex];
    selectedOptionIndex = -1; // Reset selection

    // 1. Update Question Text
    if(questionArea) questionArea.innerHTML = ${currentQuestionIndex + 1}. ${q.question};

    // 2. Update Options
    if(optionsArea) {
        optionsArea.innerHTML = ''; // Clear previous options
        q.options.forEach((optionText, index) => {
            const button = document.createElement('button');
            button.classList.add('option-btn');
            button.textContent = optionText;
            button.dataset.index = index;
            button.addEventListener('click', selectAnswer);
            optionsArea.appendChild(button);
        });
    }

    // 3. Update Progress Bar
    updateProgressBar();
}

function updateProgressBar() {
    const total = quizData.length;
    const progress = currentQuestionIndex;
    
    if(progressBar && progressText) {
        const percentage = (progress / total) * 100;
        
        progressBar.style.width = percentage + '%';
        progressText.textContent = ${progress + 1} of ${total};
    }
    
    // Special case for last question
    if (progress === total - 1) {
        if(nextBtn) nextBtn.textContent = 'Finish Quiz';
    } else {
        if(nextBtn) nextBtn.textContent = 'Next Question';
    }
}

function selectAnswer(e) {
    if (nextBtn && nextBtn.disabled) {
        // Clear existing selections
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));

        // Mark current selection
        const selectedBtn = e.target;
        selectedBtn.classList.add('selected');
        selectedOptionIndex = parseInt(selectedBtn.dataset.index);
        
        nextBtn.disabled = false; // Enable next button after selection
    }
}

function checkAnswer() {
    // Disable all option buttons after answer is checked
    document.querySelectorAll('.option-btn').forEach(btn => btn.removeEventListener('click', selectAnswer));
    
    const q = quizData[currentQuestionIndex];
    const correctIndex = q.answer;
    const allOptions = document.querySelectorAll('.option-btn');

    // Highlight correct answer
    if(allOptions[correctIndex]) allOptions[correctIndex].classList.add('correct');

    if (selectedOptionIndex === correctIndex) {
        score++;
    } else if (selectedOptionIndex !== -1 && allOptions[selectedOptionIndex]) {
        // Highlight incorrect selection in red
        allOptions[selectedOptionIndex].classList.remove('selected'); 
        allOptions[selectedOptionIndex].classList.add('incorrect'); 
    }
}

function handleNextButton() {
    if (currentQuestionIndex < quizData.length) {
        checkAnswer();
        
        // Wait a moment so the user can see the correction before moving on
        setTimeout(() => {
            currentQuestionIndex++;
            if(nextBtn) nextBtn.disabled = true; // Re-disable for the next question
            
            if (currentQuestionIndex < quizData.length) {
                showQuestion();
            } else {
                showResults();
            }
        }, 800);
        
    }
}

function showResults() {
    if(quizSection) quizSection.style.display = 'none';
    if(resultSection) resultSection.style.display = 'block';

    const totalQuestions = quizData.length;
    const finalScore = score;
    const percentage = (finalScore / totalQuestions) * 100;

    if(scoreDisplay) scoreDisplay.innerHTML = You answered **${finalScore} out of ${totalQuestions}** questions correctly! (${percentage.toFixed(0)}%);

    // --- Evaluation Logic ---
    let rating = '';
    let ratingClass = '';

    if (finalScore >= 11) {
        rating = "Excellent! You are a Cyber Security Buddy!";
        ratingClass = 'rating-excellent';
    } else if (finalScore >= 8) {
        rating = "Good! You have a solid understanding of online safety.";
        ratingClass = 'rating-good';
    } else if (finalScore >= 5) {
        rating = "Fair. Keep learning, and review the safety tips!";
        ratingClass = 'rating-fair';
    } else {
        rating = "Needs Improvement. Time to hit the 'Learn Safety' section!";
        ratingClass = 'rating-poor';
    }

    if(ratingDisplay) {
        ratingDisplay.textContent = rating;
        ratingDisplay.className = rating-box ${ratingClass};
    }
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
    // You would expand this array with your actual, live alert data
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

// Function triggered by the 'onchange' event in the dropdown
function filterAlerts() {
    const selectedType = scamTypeFilter.value;
    
    // 1. Filter the data based on the selection
    const filteredAlerts = allAlerts.filter(alert => {
        if (selectedType === 'all') {
            return true; // Show all alerts
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
