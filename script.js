// ===== Currency Data =====
const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  // Add more currencies as needed...
];

// ===== Exchange Rate Simulation =====
const baseRates = {
  USD: { EUR: 0.93, GBP: 0.79, JPY: 144.50, AUD: 1.52, CAD: 1.35, CHF: 0.89, CNY: 7.25, INR: 83.12, SGD: 1.35 },
  EUR: { USD: 1.07, GBP: 0.85, JPY: 155.20, AUD: 1.63, CAD: 1.45, CHF: 0.96, CNY: 7.80, INR: 89.45, SGD: 1.45 },
  GBP: { USD: 1.26, EUR: 1.18, JPY: 183.40, AUD: 1.92, CAD: 1.71, CHF: 1.13, CNY: 9.20, INR: 105.60, SGD: 1.71 },
  // Add more base rates...
};

function getMarketRate(base, target) {
  // Simulate real market with slight fluctuations
  const baseRate = baseRates[base]?.[target] || 1;
  const variance = (Math.random() * 0.1) - 0.05; // -5% to +5%
  return baseRate * (1 + variance);
}

// ===== DOM Elements =====
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const amountInput = document.getElementById('amount');
const resultCard = document.getElementById('result');
const conversionResult = document.getElementById('conversion-result');
const exchangeRate = document.getElementById('exchange-rate');
const lastUpdated = document.getElementById('last-updated');
const historyList = document.getElementById('history-list');
const loadingOverlay = document.getElementById('loading-overlay');

// ===== State =====
let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];

// ===== Initialize =====
function init() {
  populateCurrencyDropdowns();
  loadConversionHistory();
  setDefaultCurrencies();
  
  // Add sample history if empty
  if (conversionHistory.length === 0) {
    addToHistory('USD', 'EUR', 100, 93.45, 0.9345);
    addToHistory('EUR', 'GBP', 200, 170.80, 0.8540);
    addToHistory('JPY', 'USD', 10000, 69.20, 0.00692);
  }
}

function populateCurrencyDropdowns() {
  currencies.forEach(currency => {
    const option1 = createCurrencyOption(currency);
    const option2 = createCurrencyOption(currency);
    
    fromCurrencySelect.appendChild(option1);
    toCurrencySelect.appendChild(option2);
  });
}

function createCurrencyOption(currency) {
  const option = document.createElement('option');
  option.value = currency.code;
  option.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
  return option;
}

function setDefaultCurrencies() {
  fromCurrencySelect.value = 'USD';
  toCurrencySelect.value = 'EUR';
}

// ===== Conversion Functions =====
function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const fromCurrency = fromCurrencySelect.value;
  const toCurrency = toCurrencySelect.value;
  
  if (isNaN(amount) || amount <= 0) {
    showError('Please enter a valid amount');
    return;
  }
  
  showLoading();
  
  // Simulate API delay
  setTimeout(() => {
    try {
      const rate = getMarketRate(fromCurrency, toCurrency);
      const convertedAmount = amount * rate;
      
      displayResult(fromCurrency, toCurrency, amount, convertedAmount, rate);
      addToHistory(fromCurrency, toCurrency, amount, convertedAmount, rate);
      
      hideLoading();
    } catch (error) {
      hideLoading();
      showError('Failed to fetch exchange rates');
    }
  }, 1000);
}

function displayResult(from, to, amount, result, rate) {
  const fromCurrency = currencies.find(c => c.code === from);
  const toCurrency = currencies.find(c => c.code === to);
  
  conversionResult.innerHTML = `
    <span class="from-amount">${formatCurrency(amount, from)}</span>
    <i class="fas fa-arrow-right"></i>
    <span class="to-amount">${formatCurrency(result, to)}</span>
  `;
  
  exchangeRate.textContent = `1 ${from} = ${rate.toFixed(6)} ${to}`;
  lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  
  resultCard.style.display = 'block';
}

function swapCurrencies() {
  const temp = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = temp;
}

// ===== History Functions =====
function addToHistory(from, to, amount, result, rate) {
  const historyItem = {
    from,
    to,
    amount,
    result,
    rate,
    timestamp: new Date().toISOString()
  };
  
  conversionHistory.unshift(historyItem);
  if (conversionHistory.length > 10) conversionHistory.pop();
  
  saveHistory();
  updateHistoryUI();
}

function loadConversionHistory() {
  updateHistoryUI();
}

function updateHistoryUI() {
  historyList.innerHTML = '';
  
  conversionHistory.slice(0, 5).forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const fromCurrency = currencies.find(c => c.code === item.from);
    const toCurrency = currencies.find(c => c.code === item.to);
    
    historyItem.innerHTML = `
      <span>${fromCurrency?.flag || ''} ${item.from} → ${toCurrency?.flag || ''} ${item.to}</span>
      <span>${formatCurrency(item.amount, item.from)}</span>
      <span>${formatCurrency(item.result, item.to)} @ ${item.rate.toFixed(6)}</span>
    `;
    
    historyList.appendChild(historyItem);
  });
}

function saveHistory() {
  localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
}

// ===== Helper Functions =====
function formatCurrency(amount, currencyCode) {
  const currency = currencies.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || currencyCode;
  
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount).replace(currencyCode, symbol);
}

function showLoading() {
  loadingOverlay.style.display = 'flex';
  convertBtn.disabled = true;
  convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing';
}

function hideLoading() {
  loadingOverlay.style.display = 'none';
  convertBtn.disabled = false;
  convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convert';
}

function showError(message) {
  alert(message); // In production, replace with a proper error display
}

// ===== Event Listeners =====
convertBtn.addEventListener('click', convertCurrency);
swapBtn.addEventListener('click', swapCurrencies);

// Initialize the app
init();