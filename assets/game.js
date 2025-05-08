// File: game.js

class Game {
    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.difficulty = params.get('difficulty');
        this.timePerQuestion = parseInt(params.get('time'));
        this.score = 0;
        this.timeLeft = 0;
        this.timerId = null;
        this.isGameOver = false;
        this.currentQuestion = null;

        // Gán this.initialize với bind để không mất ngữ cảnh "this"
        this.initialize = this.initialize.bind(this);

        // Chờ DOM tải xong rồi mới khởi tạo trò chơi
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initialize);
        } else {
            window.requestAnimationFrame(this.initialize);
        }
    }

    initialize() {
        // Lấy các phần tử DOM
        this.elements = {
            questionBox: document.getElementById('questionBox'),
            answerInput: document.getElementById('answerInput'),
            timeBar: document.getElementById('timeBar'),
            currentScore: document.getElementById('currentScore'),
            loseScreen: document.querySelector('.lose-screen'),
            finalScore: document.getElementById('finalScore'),
            correctAnswer: document.getElementById('correctAnswerValue'),
            restartButton: document.getElementById('restartButton'),
            backButton: document.getElementById('backButton')
        };

        // Kiểm tra xem các phần tử thiết yếu có tồn tại không
        if (!this.elements.questionBox || !this.elements.answerInput || !this.elements.timeBar) {
            console.error("Một số phần tử DOM không tìm thấy!");
            return;
        }

        // Validate tham số từ URL
        if (!this.validateParams()) return;

        // Thiết lập sự kiện và bắt đầu trò chơi
        this.setupEventListeners();
        this.startGame();
    }

    validateParams() {
        if (!['easy', 'medium', 'hard'].includes(this.difficulty)) {
            alert('Chế độ không hợp lệ!');
            window.location.href = 'index.html';
            return false;
        }
        if (isNaN(this.timePerQuestion) || this.timePerQuestion < 5) {
            alert('Thời gian không hợp lệ!');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    startGame() {
        this.resetGameState();
        this.generateNewQuestion();
        this.startTimer();
    }

    resetGameState() {
        this.score = 0;
        this.timeLeft = this.timePerQuestion;
        this.isGameOver = false;
        this.elements.currentScore.textContent = '0';
        this.elements.answerInput.disabled = false;
        this.elements.answerInput.value = '';
        if (this.elements.loseScreen) this.elements.loseScreen.classList.remove('active');
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) gameContainer.classList.remove('blur');
    }

    setupEventListeners() {
        // Xử lý phím Enter trong input
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isGameOver) {
                this.checkAnswer();
            }
        });

        // Sự kiện nút Trở Về
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Sự kiện nút Chơi lại
        if (this.elements.restartButton) {
            this.elements.restartButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }

    generateNewQuestion() {
        let a, b, operator;
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        switch (this.difficulty) {
            case 'easy':
                a = rand(1, 10);
                b = rand(1, 10);
                operator = ['+', '-'][rand(0, 1)];
                break;
            case 'medium':
                a = rand(10, 50);
                b = rand(10, 50);
                operator = ['+', '-', '×', '÷'][rand(0, 3)];
                if (operator === '÷') a = a * b; // Đảm bảo chia hết
                break;
            case 'hard':
                a = rand(50, 100);
                b = rand(50, 100);
                operator = ['+', '-', '×', '÷'][rand(0, 3)];
                if (operator === '÷') a = a * b;
                break;
        }

        this.currentQuestion = { a, b, operator };
        this.displayQuestion();
    }

    displayQuestion() {
        this.elements.questionBox.textContent =
            `${this.currentQuestion.a} ${this.currentQuestion.operator} ${this.currentQuestion.b}`;
    }

    checkAnswer() {
        const inputValue = this.elements.answerInput.value.trim();
        if (!inputValue) return;

        const userAnswer = parseFloat(inputValue);
        if (isNaN(userAnswer)) {
            alert('Vui lòng nhập một số hợp lệ!');
            return;
        }

        const correctAnswer = this.calculateCorrectAnswer();

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    calculateCorrectAnswer() {
        const { a, b, operator } = this.currentQuestion;
        switch (operator) {
            case '+': return a + b;
            case '-': return a - b;
            case '×': return a * b;
            case '÷': return a / b;
        }
    }

    handleCorrectAnswer() {
        this.score++;
        this.elements.currentScore.textContent = this.score;
        this.resetTimer();
        this.generateNewQuestion();
        this.elements.answerInput.value = '';
    }

    handleWrongAnswer() {
        this.endGame();
    }

    startTimer() {
        this.timeLeft = this.timePerQuestion;
        this.timerId = setInterval(() => {
            if (this.isGameOver) return;

            this.timeLeft--;
            this.elements.timeBar.style.width = `${(this.timeLeft / this.timePerQuestion) * 100}%`;

            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    resetTimer() {
        clearInterval(this.timerId);
        this.startTimer();
    }

    endGame() {
        this.isGameOver = true;
        clearInterval(this.timerId);

        this.elements.answerInput.disabled = true;
        this.elements.finalScore.textContent = this.score;
        this.elements.correctAnswer.textContent = this.formatCorrectAnswer();

        setTimeout(() => {
            if (this.elements.loseScreen) this.elements.loseScreen.classList.add('active');
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) gameContainer.classList.add('blur');
        }, 100);
    }

    formatCorrectAnswer() {
        const { a, b, operator } = this.currentQuestion;
        const result = this.calculateCorrectAnswer();
        return `${a} ${operator} ${b} = ${Number.isInteger(result) ? result : result.toFixed(2)}`;
    }
}

// Khởi tạo Game khi trang tải xong
window.addEventListener('load', () => {
    new Game();
});