// Constants for better maintainability
const VALIDATION_MESSAGES = {
    RETENTION_RATE: 'Please enter a retention rate between 1-100%',
    BASE_SALARY: 'Please enter a valid base salary',
    PRODUCT_LINES: 'Please select at least one product line.'
};

const DEFAULT_VALUES = {
    RETENTION_RATE: 80,
    BASE_SALARY: '35,000',
    OTHER_EXPENSES: '0',
    EMPLOYMENT_TAX_RATE: 7.65,
    SCORECARD_BONUS_RATE: 100,
    PC_ELIGIBLE_RATE: 50,
    LIFE_ELIGIBLE_RATE: 100,
    // Product defaults
    TERM_VOLUME: 5, TERM_PREMIUM: 500, TERM_AGENT_RATE: 20, TERM_TEAM_RATE: 100,
    WHOLE_VOLUME: 1, WHOLE_PREMIUM: 4000, WHOLE_AGENT_RATE: 30, WHOLE_TEAM_RATE: 100,
    ANNUITY_VOLUME: 1, ANNUITY_PREMIUM: 2500, ANNUITY_AGENT_RATE: 25, ANNUITY_TEAM_RATE: 100,
    AUTO_VOLUME: 15, AUTO_PREMIUM: 500, AUTO_AGENT_RATE: 10, AUTO_TEAM_RATE: 100,
    HOME_VOLUME: 10, HOME_PREMIUM: 1200, HOME_AGENT_RATE: 10, HOME_TEAM_RATE: 100,
    COMMERCIAL_VOLUME: 0, COMMERCIAL_PREMIUM: 4500, COMMERCIAL_AGENT_RATE: 10, COMMERCIAL_TEAM_RATE: 100,
    MUTUAL_VOLUME: 1, MUTUAL_PREMIUM: 8000, MUTUAL_AGENT_RATE: 0.5, MUTUAL_TEAM_RATE: 100,
    IRA_VOLUME: 3, IRA_PREMIUM: 100000, IRA_AGENT_RATE: 0.5, IRA_TEAM_RATE: 100,
    PLAN529_VOLUME: 1, PLAN529_PREMIUM: 6000, PLAN529_AGENT_RATE: 0.5, PLAN529_TEAM_RATE: 100
};

// Application state
let currentStep = 1;
const totalSteps = 3;
let currentBasicPage = 1;
const totalBasicPages = 3;
let selectedProductLines = [];

// Main step navigation function
function changeStep(direction) {
    if (direction > 0) {
        // Moving forward
        if (currentStep === 1) {
            // In Basic Info - handle page navigation
            if (currentBasicPage < totalBasicPages) {
                // Validate current page
                if (!validateBasicPage(currentBasicPage)) {
                    return;
                }
                
                // Move to next basic page
                document.getElementById(`basicPage${currentBasicPage}`).style.display = 'none';
                currentBasicPage++;
                document.getElementById(`basicPage${currentBasicPage}`).style.display = 'block';
                updateProgress();
            } else {
                // Move to next step (Production)
                if (!validateBasicPage(currentBasicPage)) {
                    return;
                }
                currentStep = 2;
                currentBasicPage = 1; // Reset for potential return
                document.getElementById('basicPage1').style.display = 'block';
                document.getElementById('basicPage2').style.display = 'none';
                document.getElementById('basicPage3').style.display = 'none';
                updateProgress();
                showStep(currentStep);
            }
        } else if (currentStep < totalSteps) {
            // Moving between Production and Results
            if (currentStep === 2 && !validateStep(2)) {
                return;
            }
            currentStep++;
            updateProgress();
            showStep(currentStep);
        }
    } else {
        // Moving backward
        if (currentStep === 1) {
            // In Basic Info - handle page navigation
            if (currentBasicPage > 1) {
                document.getElementById(`basicPage${currentBasicPage}`).style.display = 'none';
                currentBasicPage--;
                document.getElementById(`basicPage${currentBasicPage}`).style.display = 'block';
                updateProgress();
            }
        } else if (currentStep > 1) {
            // Moving back from Production/Results
            if (currentStep === 2) {
                // Going back to Basic Info - show last page
                currentStep = 1;
                currentBasicPage = totalBasicPages;
                document.getElementById('basicPage1').style.display = 'none';
                document.getElementById('basicPage2').style.display = 'none';
                document.getElementById('basicPage3').style.display = 'block';
            } else {
                currentStep--;
            }
            updateProgress();
            showStep(currentStep);
        }
    }
}

function validateBasicPage(page) {
    switch(page) {
        case 1:
            const retentionRate = getValue('retentionRate');
            if (retentionRate <= 0 || retentionRate > 100) {
                alert(VALIDATION_MESSAGES.RETENTION_RATE);
                return false;
            }
            break;
        case 2:
            const baseSalaryStr = document.getElementById('baseSalary')?.value || '';
            const baseSalary = parseFloat(removeCommas(baseSalaryStr));
            if (isNaN(baseSalary) || baseSalary < 0) {
                alert(VALIDATION_MESSAGES.BASE_SALARY);
                return false;
            }
            break;
        // Page 3 (other expenses) doesn't need validation - it's optional
    }
    return true;
}

function updateProgress() {
    let progress;
    if (currentStep === 1) {
        // In Basic Info - show progress through pages
        progress = (currentBasicPage / totalBasicPages) * (1 / totalSteps) * 100;
    } else {
        // In other steps
        progress = (currentStep / totalSteps) * 100;
    }
    document.getElementById('progressFill').style.width = progress + '%';

    // Update step indicators
    for (let i = 1; i <= totalSteps; i++) {
        const indicator = document.getElementById(`step${i}Indicator`);
        const circle = indicator.querySelector('.step-indicator');
        const label = indicator.querySelector('.step-label');

        circle.classList.remove('active', 'completed');
        label.classList.remove('active', 'completed');

        if (i < currentStep) {
            circle.classList.add('completed');
            label.classList.add('completed');
        } else if (i === currentStep) {
            circle.classList.add('active');
            label.classList.add('active');
        }
    }

    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Previous button logic
    prevBtn.disabled = (currentStep === 1 && currentBasicPage === 1);
    
    // Next button text and visibility logic
    if (currentStep === 1 && currentBasicPage < totalBasicPages) {
        nextBtn.textContent = 'Next →';
        nextBtn.disabled = false;
        nextBtn.style.display = 'block';
    } else if (currentStep === 1 && currentBasicPage === totalBasicPages) {
        nextBtn.textContent = 'Continue to Production →';
        nextBtn.disabled = false;
        nextBtn.style.display = 'block';
    } else if (currentStep === 2) {
        nextBtn.textContent = 'Continue to Results →';
        nextBtn.disabled = false;
        nextBtn.style.display = 'block';
    } else if (currentStep === 3) {
        // Hide the next button completely on Results page
        nextBtn.style.display = 'none';
    }
}

// Number formatting functions
function formatNumberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function removeCommas(str) {
    return str.replace(/,/g, '');
}

function formatCurrencyInput(input) {
    if (!input || !input.value) return;
    
    let value = removeCommas(input.value);
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue)) {
        input.value = formatNumberWithCommas(numericValue.toString());
    }
}

// Add event listeners for currency formatting and initialize
document.addEventListener('DOMContentLoaded', function() {
    const baseSalaryInput = document.getElementById('baseSalary');
    const otherExpensesInput = document.getElementById('otherExpenses');

    if (baseSalaryInput) {
        baseSalaryInput.addEventListener('input', function() {
            formatCurrencyInput(this);
        });

        baseSalaryInput.addEventListener('blur', function() {
            formatCurrencyInput(this);
        });
    }

    if (otherExpensesInput) {
        otherExpensesInput.addEventListener('input', function() {
            formatCurrencyInput(this);
        });

        otherExpensesInput.addEventListener('blur', function() {
            formatCurrencyInput(this);
        });
    }

    // Initialize the calculator
    updateProgress();
    showStep(1);
});

// Product Line Selection
function toggleProductLine(line) {
    const toggle = document.getElementById(`${line}Toggle`);
    const details = document.getElementById(`${line}Details`);
    const detailsSection = document.getElementById('productLineDetails');
    
    if (!toggle || !details || !detailsSection) {
        console.error('Required elements not found for product line:', line);
        return;
    }
    
    if (selectedProductLines.includes(line)) {
        // Remove product line
        selectedProductLines = selectedProductLines.filter(l => l !== line);
        toggle.classList.remove('selected');
        const statusElement = toggle.querySelector('.toggle-status');
        if (statusElement) statusElement.textContent = 'Click to Select';
        details.classList.remove('active');
    } else {
        // Add product line
        selectedProductLines.push(line);
        toggle.classList.add('selected');
        const statusElement = toggle.querySelector('.toggle-status');
        if (statusElement) statusElement.textContent = 'Selected';
        details.classList.add('active');
    }
    
    // Show/hide details section
    detailsSection.style.display = selectedProductLines.length > 0 ? 'block' : 'none';
    
    calculateSummary();
}

function calculateSummary() {
    let totalMonthlyVolume = 0;
    let totalAnnualCommissions = 0;
    let totalTeamCommissions = 0;
    
    // Life Insurance Products
    if (selectedProductLines.includes('life')) {
        // Term Life
        const termVolume = getValue('termVolume');
        const termPremium = getValue('termPremium');
        const termAgentRate = getValue('termAgentRate');
        const termTeamRate = getValue('termTeamRate');
        
        const termAnnualVolume = termVolume * 12;
        const termAgentCommission = termAnnualVolume * termPremium * (termAgentRate / 100);
        const termTeamCommission = termAgentCommission * (termTeamRate / 100);
        
        totalMonthlyVolume += termVolume;
        totalAnnualCommissions += termAgentCommission;
        totalTeamCommissions += termTeamCommission;
        
        // Whole Life
        const wholeVolume = getValue('wholeVolume');
        const wholePremium = getValue('wholePremium');
        const wholeAgentRate = getValue('wholeAgentRate');
        const wholeTeamRate = getValue('wholeTeamRate');
        
        const wholeAnnualVolume = wholeVolume * 12;
        const wholeAgentCommission = wholeAnnualVolume * wholePremium * (wholeAgentRate / 100);
        const wholeTeamCommission = wholeAgentCommission * (wholeTeamRate / 100);
        
        totalMonthlyVolume += wholeVolume;
        totalAnnualCommissions += wholeAgentCommission;
        totalTeamCommissions += wholeTeamCommission;
        
        // Annuities
        const annuityVolume = getValue('annuityVolume');
        const annuityPremium = getValue('annuityPremium');
        const annuityAgentRate = getValue('annuityAgentRate');
        const annuityTeamRate = getValue('annuityTeamRate');
        
        const annuityAnnualVolume = annuityVolume * 12;
        const annuityAgentCommission = annuityAnnualVolume * annuityPremium * (annuityAgentRate / 100);
        const annuityTeamCommission = annuityAgentCommission * (annuityTeamRate / 100);
        
        totalMonthlyVolume += annuityVolume;
        totalAnnualCommissions += annuityAgentCommission;
        totalTeamCommissions += annuityTeamCommission;
    }
    
    // P&C Products
    if (selectedProductLines.includes('pc')) {
        // Auto (Special logic: Agent gets renewal commissions every 6 months, team member only gets first term)
        const autoVolume = getValue('autoVolume');
        const autoPremium = getValue('autoPremium');
        const autoAgentRate = getValue('autoAgentRate');
        const autoTeamRate = getValue('autoTeamRate');
        
        const autoAnnualVolume = autoVolume * 12;
        // Agent earns commission on initial + renewal (2 terms per year)
        const autoAgentCommission = autoAnnualVolume * autoPremium * (autoAgentRate / 100) * 2;
        // Team member only earns on initial term (1 term per policy)
        const autoTeamCommission = autoAnnualVolume * autoPremium * (autoAgentRate / 100) * (autoTeamRate / 100);
        
        totalMonthlyVolume += autoVolume;
        totalAnnualCommissions += autoAgentCommission;
        totalTeamCommissions += autoTeamCommission;
        
        // Home
        const homeVolume = getValue('homeVolume');
        const homePremium = getValue('homePremium');
        const homeAgentRate = getValue('homeAgentRate');
        const homeTeamRate = getValue('homeTeamRate');
        
        const homeAnnualVolume = homeVolume * 12;
        const homeAgentCommission = homeAnnualVolume * homePremium * (homeAgentRate / 100);
        const homeTeamCommission = homeAgentCommission * (homeTeamRate / 100);
        
        totalMonthlyVolume += homeVolume;
        totalAnnualCommissions += homeAgentCommission;
        totalTeamCommissions += homeTeamCommission;
        
        // Commercial
        const commercialVolume = getValue('commercialVolume');
        const commercialPremium = getValue('commercialPremium');
        const commercialAgentRate = getValue('commercialAgentRate');
        const commercialTeamRate = getValue('commercialTeamRate');
        
        const commercialAnnualVolume = commercialVolume * 12;
        const commercialAgentCommission = commercialAnnualVolume * commercialPremium * (commercialAgentRate / 100);
        const commercialTeamCommission = commercialAgentCommission * (commercialTeamRate / 100);
        
        totalMonthlyVolume += commercialVolume;
        totalAnnualCommissions += commercialAgentCommission;
        totalTeamCommissions += commercialTeamCommission;
    }
    
    // Financial Products
    if (selectedProductLines.includes('financial')) {
        // Mutual Funds
        const mutualVolume = getValue('mutualVolume');
        const mutualPremium = getValue('mutualPremium');
        const mutualAgentRate = getValue('mutualAgentRate');
        const mutualTeamRate = getValue('mutualTeamRate');
        
        const mutualAnnualVolume = mutualVolume * 12;
        const mutualAgentCommission = mutualAnnualVolume * mutualPremium * (mutualAgentRate / 100);
        const mutualTeamCommission = mutualAgentCommission * (mutualTeamRate / 100);
        
        totalMonthlyVolume += mutualVolume;
        totalAnnualCommissions += mutualAgentCommission;
        totalTeamCommissions += mutualTeamCommission;
        
        // IRA
        const iraVolume = getValue('iraVolume');
        const iraPremium = getValue('iraPremium');
        const iraAgentRate = getValue('iraAgentRate');
        const iraTeamRate = getValue('iraTeamRate');
        
        const iraAnnualVolume = iraVolume * 12;
        const iraAgentCommission = iraAnnualVolume * iraPremium * (iraAgentRate / 100);
        const iraTeamCommission = iraAgentCommission * (iraTeamRate / 100);
        
        totalMonthlyVolume += iraVolume;
        totalAnnualCommissions += iraAgentCommission;
        totalTeamCommissions += iraTeamCommission;
        
        // 529 Plans
        const plan529Volume = getValue('plan529Volume');
        const plan529Premium = getValue('plan529Premium');
        const plan529AgentRate = getValue('plan529AgentRate');
        const plan529TeamRate = getValue('plan529TeamRate');
        
        const plan529AnnualVolume = plan529Volume * 12;
        const plan529AgentCommission = plan529AnnualVolume * plan529Premium * (plan529AgentRate / 100);
        const plan529TeamCommission = plan529AgentCommission * (plan529TeamRate / 100);
        
        totalMonthlyVolume += plan529Volume;
        totalAnnualCommissions += plan529AgentCommission;
        totalTeamCommissions += plan529TeamCommission;
    }
    
    // Update summary display
    const monthlyVolumeElement = document.getElementById('totalMonthlyVolume');
    const annualCommissionsElement = document.getElementById('totalAnnualCommissions');
    const teamCommissionsElement = document.getElementById('totalTeamCommissions');
    
    if (monthlyVolumeElement) monthlyVolumeElement.textContent = totalMonthlyVolume.toLocaleString();
    if (annualCommissionsElement) annualCommissionsElement.textContent = formatCurrency(totalAnnualCommissions);
    if (teamCommissionsElement) teamCommissionsElement.textContent = formatCurrency(totalTeamCommissions);
}

// Utility functions
function formatCurrency(value) {
    if (value < 0) {
        return `-${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getValue(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
        return 0;
    }
    
    let value = element.value;
    
    // Handle formatted currency inputs
    if (id === 'baseSalary' || id === 'otherExpenses') {
        value = removeCommas(value);
    }
    
    const numericValue = parseFloat(value);
    return isNaN(numericValue) ? 0 : numericValue;
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
        return;
    }
    element.textContent = formatCurrency(value);
}

function jumpToStep(step) {
    if (step >= 1 && step <= totalSteps) {
        currentStep = step;
        if (step === 1) {
            // When jumping to step 1, show first page
            currentBasicPage = 1;
            // Hide all pages first
            for (let i = 1; i <= totalBasicPages; i++) {
                document.getElementById(`basicPage${i}`).style.display = 'none';
            }
            // Show page 1
            document.getElementById('basicPage1').style.display = 'block';
        }
        updateProgress();
        showStep(currentStep);
    }
}

function showStep(step) {
    // Hide all steps
    for (let i = 1; i <= totalSteps; i++) {
        document.getElementById(`step${i}`).classList.remove('active');
    }
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Calculate results if on results step
    if (step === 3) {
        calculateResults();
    }
}

function validateStep(step) {
    // Remove existing error styling
    document.querySelectorAll('.validation-error').forEach(el => {
        el.classList.remove('validation-error');
    });
    document.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
    
    switch(step) {
        case 2:
            if (selectedProductLines.length === 0) {
                alert(VALIDATION_MESSAGES.PRODUCT_LINES);
                return false;
            }
            break;
    }
    
    return true;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('validation-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
}

function calculateResults() {
    try {
        // Get all input values
        const baseSalaryStr = document.getElementById('baseSalary')?.value || '0';
        const baseSalary = parseFloat(removeCommas(baseSalaryStr)) || 0;
        const retentionRate = getValue('retentionRate');
        const otherExpensesStr = document.getElementById('otherExpenses')?.value || '0';
        const otherExpensesAmount = parseFloat(removeCommas(otherExpensesStr)) || 0;
        const employmentTaxRate = getValue('employmentTaxRate') || DEFAULT_VALUES.EMPLOYMENT_TAX_RATE;
        const scorecardBonusRate = getValue('scorecardBonusRate') || DEFAULT_VALUES.SCORECARD_BONUS_RATE;
        const pcEligibleRate = getValue('pcEligibleRate') || DEFAULT_VALUES.PC_ELIGIBLE_RATE;
        const lifeEligibleRate = getValue('lifeEligibleRate') || DEFAULT_VALUES.LIFE_ELIGIBLE_RATE;

        // Calculate commissions using the summary function
        calculateSummary();
        
        // Get totals from summary with safe parsing
        const totalAnnualCommissions = parseFloat(
            document.getElementById('totalAnnualCommissions')?.textContent?.replace(/[$,]/g, '') || '0'
        ) || 0;
        
        const totalTeamMemberCommissions = parseFloat(
            document.getElementById('totalTeamCommissions')?.textContent?.replace(/[$,]/g, '') || '0'
        ) || 0;
        
        // Calculate P&C and Life commissions separately
        const { pcCommissions, lifeCommissions } = calculateCommissionsByCategory();
        
        // Calculate eligible commissions for each category
        const pcEligibleCommissions = pcCommissions * (pcEligibleRate / 100);
        const lifeEligibleCommissions = lifeCommissions * (lifeEligibleRate / 100);
        const totalEligibleCommissions = pcEligibleCommissions + lifeEligibleCommissions;
        
        // Calculate expenses
        const totalCompensation = baseSalary + totalTeamMemberCommissions;
        const employmentTaxes = totalCompensation * (employmentTaxRate / 100);
        const totalSupportCosts = otherExpensesAmount;
        const totalExpenses = totalCompensation + employmentTaxes + totalSupportCosts;
        
        // Calculate scorecard bonus using eligible commissions
        const scorecardBonus = totalEligibleCommissions * (scorecardBonusRate / 100);
        const totalIncome = totalAnnualCommissions + scorecardBonus;
        
        // Calculate net
        const netROI = totalIncome - totalExpenses;
        
        // Calculate projected revenue (commissions only, no bonus) with declining retention
        const projectedRevenue = calculateProjectedRevenue(totalAnnualCommissions, retentionRate);
        
        // Update UI with calculated values
        updateResultsUI({
            totalExpenses,
            totalIncome,
            netROI,
            baseSalary,
            totalTeamMemberCommissions,
            employmentTaxes,
            totalSupportCosts,
            totalAnnualCommissions,
            pcCommissions,
            lifeCommissions,
            pcEligibleCommissions,
            lifeEligibleCommissions,
            totalEligibleCommissions,
            scorecardBonus,
            projectedRevenue
        });
        
    } catch (error) {
        console.error('Error calculating results:', error);
        alert('An error occurred while calculating results. Please check your inputs and try again.');
    }
}

function calculateProjectedRevenue(baseCommissions, finalRetentionRate) {
    // Year 1 is 100% retention
    // Year 5 is the final retention rate
    // Years 2-4 decline linearly
    const retentionDecline = (100 - finalRetentionRate) / 4;
    
    let totalProjectedRevenue = 0;
    
    for (let year = 1; year <= 5; year++) {
        let yearRetention;
        if (year === 1) {
            yearRetention = 100;
        } else {
            yearRetention = 100 - (retentionDecline * (year - 1));
        }
        
        const yearRevenue = baseCommissions * (yearRetention / 100);
        totalProjectedRevenue += yearRevenue;
    }
    
    return totalProjectedRevenue;
}

function calculateCommissionsByCategory() {
    let pcCommissions = 0;
    let lifeCommissions = 0;
    
    // P&C Products
    if (selectedProductLines.includes('pc')) {
        pcCommissions += calculateProductCommissions('auto', 2); // Agent gets renewal
        pcCommissions += calculateProductCommissions('home', 1);
        pcCommissions += calculateProductCommissions('commercial', 1);
    }
    
    // Life Insurance Products
    if (selectedProductLines.includes('life')) {
        lifeCommissions += calculateProductCommissions('term', 1);
        lifeCommissions += calculateProductCommissions('whole', 1);
        lifeCommissions += calculateProductCommissions('annuity', 1);
    }
    
    // Financial Products (added to life commissions for bonus calculation)
    if (selectedProductLines.includes('financial')) {
        lifeCommissions += calculateProductCommissions('mutual', 1);
        lifeCommissions += calculateProductCommissions('ira', 1);
        lifeCommissions += calculateProductCommissions('plan529', 1);
    }
    
    return { pcCommissions, lifeCommissions };
}

function calculateProductCommissions(productType, multiplier = 1) {
    const volume = getValue(`${productType}Volume`);
    const premium = getValue(`${productType}Premium`);
    const agentRate = getValue(`${productType}AgentRate`);
    
    const annualVolume = volume * 12;
    return annualVolume * premium * (agentRate / 100) * multiplier;
}

function updateResultsUI(results) {
    // Update summary cards
    setValue('summaryExpenses', results.totalExpenses);
    setValue('summaryIncome', results.totalIncome);
    setValue('summaryROI', results.netROI);
    
    // Update detailed breakdowns
    setValue('detailSalary', results.baseSalary);
    setValue('detailCommissions', results.totalTeamMemberCommissions);
    setValue('detailTaxes', results.employmentTaxes);
    setValue('detailCosts', results.totalSupportCosts);
    setValue('detailAgentCommissions', results.totalAnnualCommissions);
    setValue('detailPCCommissions', results.pcCommissions);
    setValue('detailLifeCommissions', results.lifeCommissions);
    
    // Handle 0% eligible rates - clear the dollar amounts if rate is 0
    if (results.pcEligibleCommissions === 0) {
        document.getElementById('detailPCEligible').textContent = '-';
    } else {
        setValue('detailPCEligible', results.pcEligibleCommissions);
    }
    
    if (results.lifeEligibleCommissions === 0) {
        document.getElementById('detailLifeEligible').textContent = '-';
    } else {
        setValue('detailLifeEligible', results.lifeEligibleCommissions);
    }
    
    if (results.totalEligibleCommissions === 0) {
        document.getElementById('detailEligibleCommissions').textContent = '-';
    } else {
        setValue('detailEligibleCommissions', results.totalEligibleCommissions);
    }
    
    if (results.scorecardBonus === 0) {
        document.getElementById('detailScorecardBonus').textContent = '-';
    } else {
        setValue('detailScorecardBonus', results.scorecardBonus);
    }
    
    // Update projected revenue (5-year total)
    setValue('futureProjection', results.projectedRevenue);
}

function exportResults() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get current values
    const baseSalaryStr = document.getElementById('baseSalary').value;
    const baseSalary = parseFloat(removeCommas(baseSalaryStr)) || 0;
    const otherExpensesStr = document.getElementById('otherExpenses').value;
    const supportCosts = parseFloat(removeCommas(otherExpensesStr)) || 0;
    const retentionRate = getValue('retentionRate');
    
    // Calculate totals
    const totalAnnualCommissions = parseFloat(document.getElementById('totalAnnualCommissions').textContent.replace(/[$,]/g, '')) || 0;
    const totalTeamMemberCommissions = parseFloat(document.getElementById('totalTeamCommissions').textContent.replace(/[$,]/g, '')) || 0;
    
    // Brand colors
    const brandRed = [237, 19, 27];
    const brandDark = [16, 17, 19];
    const lightGray = [74, 85, 104];
    
    // Header with branding
    doc.setFillColor(...brandRed);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('AgentInsider Toolkit', 20, 20);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text('Team Member ROI Analysis Report', 20, 25);
    
    // Reset text color
    doc.setTextColor(...brandDark);
    
    // Report date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const today = new Date().toLocaleDateString();
    doc.text(`Generated: ${today}`, 150, 40);
    
    let yPosition = 50;
    
    // Executive Summary Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandRed);
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...brandDark);
    
    const summaryExpenses = parseFloat(document.getElementById('summaryExpenses').textContent.replace(/[$,-]/g, '')) || 0;
    const summaryIncome = parseFloat(document.getElementById('summaryIncome').textContent.replace(/[$,-]/g, '')) || 0;
    const summaryROI = parseFloat(document.getElementById('summaryROI').textContent.replace(/[$,-]/g, '')) || 0;
    
    doc.text(`Total Annual Investment: ${summaryExpenses.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total Annual Income: ${summaryIncome.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Net ROI (First Year): ${summaryROI.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Client Retention Rate: ${retentionRate}%`, 20, yPosition);
    yPosition += 15;
    
    // Compensation Package Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandRed);
    doc.text('Compensation Package', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...brandDark);
    
    doc.text(`Base Salary: ${baseSalary.toLocaleString()}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Commission Potential: ${totalTeamMemberCommissions.toLocaleString()}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Additional Benefits: ${supportCosts.toLocaleString()}`, 30, yPosition);
    yPosition += 15;
    
    // Save the PDF
    const filename = `Team-Member-ROI-Analysis-${today.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
}

function startOver() {
    try {
        // Reset to step 1
        currentStep = 1;
        currentBasicPage = 1;
        updateProgress();
        showStep(1);
        
        // Reset basic info values using constants
        const retentionRateEl = document.getElementById('retentionRate');
        const baseSalaryEl = document.getElementById('baseSalary');
        const otherExpensesEl = document.getElementById('otherExpenses');
        
        if (retentionRateEl) retentionRateEl.value = DEFAULT_VALUES.RETENTION_RATE;
        if (baseSalaryEl) baseSalaryEl.value = DEFAULT_VALUES.BASE_SALARY;
        if (otherExpensesEl) otherExpensesEl.value = DEFAULT_VALUES.OTHER_EXPENSES;
        
        // Reset basic pages display - show page 1, hide others
        for (let i = 1; i <= totalBasicPages; i++) {
            const pageEl = document.getElementById(`basicPage${i}`);
            if (pageEl) {
                pageEl.style.display = i === 1 ? 'block' : 'none';
            }
        }
        
        // Reset product selection
        selectedProductLines = [];
        document.querySelectorAll('.product-line-toggle').forEach(toggle => {
            toggle.classList.remove('selected');
        });
        document.querySelectorAll('.toggle-status').forEach(status => {
            status.textContent = 'Click to Select';
        });
        document.querySelectorAll('.product-line-details').forEach(section => {
            section.classList.remove('active');
        });
        
        const productLineDetailsEl = document.getElementById('productLineDetails');
        if (productLineDetailsEl) productLineDetailsEl.style.display = 'none';
        
        // Reset adjustable settings to defaults
        const settingsInputs = [
            { id: 'employmentTaxRate', value: DEFAULT_VALUES.EMPLOYMENT_TAX_RATE },
            { id: 'scorecardBonusRate', value: DEFAULT_VALUES.SCORECARD_BONUS_RATE },
            { id: 'pcEligibleRate', value: DEFAULT_VALUES.PC_ELIGIBLE_RATE },
            { id: 'lifeEligibleRate', value: DEFAULT_VALUES.LIFE_ELIGIBLE_RATE }
        ];
        
        settingsInputs.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
        
        // Reset product line input fields to defaults
        const productMappings = [
            { prefix: 'term', defaults: [DEFAULT_VALUES.TERM_VOLUME, DEFAULT_VALUES.TERM_PREMIUM, DEFAULT_VALUES.TERM_AGENT_RATE, DEFAULT_VALUES.TERM_TEAM_RATE] },
            { prefix: 'whole', defaults: [DEFAULT_VALUES.WHOLE_VOLUME, DEFAULT_VALUES.WHOLE_PREMIUM, DEFAULT_VALUES.WHOLE_AGENT_RATE, DEFAULT_VALUES.WHOLE_TEAM_RATE] },
            { prefix: 'annuity', defaults: [DEFAULT_VALUES.ANNUITY_VOLUME, DEFAULT_VALUES.ANNUITY_PREMIUM, DEFAULT_VALUES.ANNUITY_AGENT_RATE, DEFAULT_VALUES.ANNUITY_TEAM_RATE] },
            { prefix: 'auto', defaults: [DEFAULT_VALUES.AUTO_VOLUME, DEFAULT_VALUES.AUTO_PREMIUM, DEFAULT_VALUES.AUTO_AGENT_RATE, DEFAULT_VALUES.AUTO_TEAM_RATE] },
            { prefix: 'home', defaults: [DEFAULT_VALUES.HOME_VOLUME, DEFAULT_VALUES.HOME_PREMIUM, DEFAULT_VALUES.HOME_AGENT_RATE, DEFAULT_VALUES.HOME_TEAM_RATE] },
            { prefix: 'commercial', defaults: [DEFAULT_VALUES.COMMERCIAL_VOLUME, DEFAULT_VALUES.COMMERCIAL_PREMIUM, DEFAULT_VALUES.COMMERCIAL_AGENT_RATE, DEFAULT_VALUES.COMMERCIAL_TEAM_RATE] },
            { prefix: 'mutual', defaults: [DEFAULT_VALUES.MUTUAL_VOLUME, DEFAULT_VALUES.MUTUAL_PREMIUM, DEFAULT_VALUES.MUTUAL_AGENT_RATE, DEFAULT_VALUES.MUTUAL_TEAM_RATE] },
            { prefix: 'ira', defaults: [DEFAULT_VALUES.IRA_VOLUME, DEFAULT_VALUES.IRA_PREMIUM, DEFAULT_VALUES.IRA_AGENT_RATE, DEFAULT_VALUES.IRA_TEAM_RATE] },
            { prefix: 'plan529', defaults: [DEFAULT_VALUES.PLAN529_VOLUME, DEFAULT_VALUES.PLAN529_PREMIUM, DEFAULT_VALUES.PLAN529_AGENT_RATE, DEFAULT_VALUES.PLAN529_TEAM_RATE] }
        ];
        
        const suffixes = ['Volume', 'Premium', 'AgentRate', 'TeamRate'];
        
        productMappings.forEach(({ prefix, defaults }) => {
            suffixes.forEach((suffix, index) => {
                const element = document.getElementById(`${prefix}${suffix}`);
                if (element) {
                    element.value = defaults[index];
                }
            });
        });
        
    } catch (error) {
        console.error('Error resetting calculator:', error);
        alert('An error occurred while resetting the calculator. Please refresh the page.');
    }
}
