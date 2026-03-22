function showQuestion(questions, index) {
    const container = document.getElementById('quiz-container');
    const q = questions[index];

    container.innerHTML = `
        <div class="question">${q.question}</div>
        <div>
            ${q.options.map(option => 
                `<button class="answer">${option}</button>`
            ).join('')}
        </div>
    `;
}