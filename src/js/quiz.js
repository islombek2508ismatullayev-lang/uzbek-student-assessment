// This file contains the logic for the quiz functionality. It manages the questions, user answers, scoring, and displaying results for the assessments in Math, mother tongue, and English.

const quizData = {
    math: [],
    motherTongue: [],
    english: []
};

let currentQuestionIndex = 0;
let score = {
    math: 0,
    motherTongue: 0,
    english: 0
};

function loadQuiz(subject) {
    fetch(`./data/${subject}.json`)
        .then(response => response.json())
        .then(data => {
            quizData[subject] = data;
            displayQuestion(subject);
        })
        .catch(error => console.error('Error loading quiz data:', error));
}

function displayQuestion(subject) {
    const questionContainer = document.getElementById('question-container');
    const question = quizData[subject][currentQuestionIndex];
    
    if (question) {
        questionContainer.innerHTML = `
            <h2>${question.question}</h2>
            ${question.options.map((option, index) => `
                <button onclick="submitAnswer('${subject}', '${option}', ${index})">${option}</button>
            `).join('')}
        `;
    } else {
        showResults(subject);
    }
}

function submitAnswer(subject, selectedOption, index) {
    const correctAnswer = quizData[subject][currentQuestionIndex].correctAnswer;
    
    if (selectedOption === correctAnswer) {
        score[subject]++;
    }
    
    currentQuestionIndex++;
    displayQuestion(subject);
}

function showResults(subject) {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = `
        <h2>${subject} Quiz Finished!</h2>
        <p>Your score: ${score[subject]} out of ${quizData[subject].length}</p>
    `;
}

function resetQuiz() {
    currentQuestionIndex = 0;
    score = {
        math: 0,
        motherTongue: 0,
        english: 0
    };
}

// Event listeners for starting quizzes
document.getElementById('start-math').addEventListener('click', () => loadQuiz('math'));
document.getElementById('start-mother-tongue').addEventListener('click', () => loadQuiz('mother-tongue'));
document.getElementById('start-english').addEventListener('click', () => loadQuiz('english'));