// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const pdfFileInput = document.getElementById('pdfFile');
const fileNameDisplay = document.getElementById('fileName');
const generateBtn = document.getElementById('generateBtn');
const btnText = generateBtn.querySelector('.btn-text');
const loader = generateBtn.querySelector('.loader');
const resultsSection = document.getElementById('resultsSection');
const questionsContainer = document.getElementById('questionsContainer');
const errorMessage = document.getElementById('errorMessage');
const downloadBtn = document.getElementById('downloadBtn');
const demoBtn = document.getElementById('demoBtn');

let currentQuestions = [];

// Demo button handler
demoBtn.addEventListener('click', async () => {
    const numQuestions = document.getElementById('numQuestions').value;
    
    hideError();
    hideResults();
    setDemoLoading(true);
    
    try {
        const response = await fetch(`/api/demo?numQuestions=${numQuestions}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate demo questions');
        }
        
        if (data.success && data.questions) {
            currentQuestions = data.questions;
            displayQuestions(data.questions);
            showResults();
        } else {
            throw new Error('No demo questions were generated');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An error occurred while generating demo questions');
    } finally {
        setDemoLoading(false);
    }
});

// File input change handler
pdfFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
    }
});

// Drag and drop functionality
const fileLabel = document.querySelector('.file-label');

fileLabel.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileLabel.style.borderColor = '#764ba2';
    fileLabel.style.background = '#f7fafc';
});

fileLabel.addEventListener('dragleave', () => {
    fileLabel.style.borderColor = '#667eea';
    fileLabel.style.background = 'white';
});

fileLabel.addEventListener('drop', (e) => {
    e.preventDefault();
    fileLabel.style.borderColor = '#667eea';
    fileLabel.style.background = 'white';
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        pdfFileInput.files = files;
        fileNameDisplay.textContent = files[0].name;
    }
});

// Form submit handler
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const file = pdfFileInput.files[0];
    const numQuestions = document.getElementById('numQuestions').value;
    
    if (!file) {
        showError('Please select a PDF file');
        return;
    }
    
    formData.append('pdf', file);
    formData.append('numQuestions', numQuestions);
    
    // Show loading state
    setLoadingState(true);
    hideError();
    hideResults();
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate questions');
        }
        
        if (data.success && data.questions) {
            currentQuestions = data.questions;
            displayQuestions(data.questions);
            showResults();
        } else {
            throw new Error('No questions were generated');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An error occurred while processing the PDF');
    } finally {
        setLoadingState(false);
    }
});

// Display questions in the UI
function displayQuestions(questions) {
    questionsContainer.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index + 1);
        questionsContainer.appendChild(questionCard);
    });
}

// Create a question card element
function createQuestionCard(question, number) {
    const card = document.createElement('div');
    card.className = 'question-card';
    
    if (question.type === 'multiple_choice') {
        card.innerHTML = `
            <div class="question-header">
                <span class="question-type type-mc">Multiple Choice</span>
                <span style="color: #718096; font-weight: 600;">Question ${number}</span>
            </div>
            <div class="question-text">${question.question}</div>
            <ul class="options-list">
                ${Object.entries(question.options).map(([key, value]) => `
                    <li class="option-item ${key === question.correct_answer ? 'correct' : ''}">
                        <span class="option-label">${key}.</span>
                        <span>${value}</span>
                        ${key === question.correct_answer ? '<span class="correct-indicator">✓ Correct Answer</span>' : ''}
                    </li>
                `).join('')}
            </ul>
        `;
    } else if (question.type === 'short_answer') {
        card.innerHTML = `
            <div class="question-header">
                <span class="question-type type-sa">Short Answer</span>
                <span style="color: #718096; font-weight: 600;">Question ${number}</span>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="sample-answer">
                <div class="sample-answer-label">Sample Answer:</div>
                <div class="sample-answer-text">${question.sample_answer}</div>
            </div>
        `;
    }
    
    return card;
}

// Download questions as a text file
downloadBtn.addEventListener('click', () => {
    if (currentQuestions.length === 0) return;
    
    let content = 'AI Generated Questions\n';
    content += '='.repeat(50) + '\n\n';
    
    currentQuestions.forEach((question, index) => {
        content += `Question ${index + 1}:\n`;
        content += `Type: ${question.type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}\n`;
        content += `Q: ${question.question}\n\n`;
        
        if (question.type === 'multiple_choice') {
            Object.entries(question.options).forEach(([key, value]) => {
                const marker = key === question.correct_answer ? ' ✓' : '';
                content += `   ${key}. ${value}${marker}\n`;
            });
            content += `\nCorrect Answer: ${question.correct_answer}\n`;
        } else {
            content += `Sample Answer: ${question.sample_answer}\n`;
        }
        
        content += '\n' + '-'.repeat(50) + '\n\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-questions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// UI Helper Functions
function setLoadingState(isLoading) {
    generateBtn.disabled = isLoading;
    if (isLoading) {
        btnText.style.display = 'none';
        loader.style.display = 'block';
    } else {
        btnText.style.display = 'block';
        loader.style.display = 'none';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showResults() {
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResults() {
    resultsSection.style.display = 'none';
}

function setDemoLoading(isLoading) {
    demoBtn.disabled = isLoading;
    if (isLoading) {
        demoBtn.textContent = 'Loading...';
    } else {
        demoBtn.textContent = 'Try Demo (No PDF Required)';
    }
}
