document.addEventListener('DOMContentLoaded', () => {
    const timeRange = document.getElementById('timeRange');
    const timeValue = document.getElementById('timeValue');
    
    // Cập nhật giá trị thời gian
    timeRange.addEventListener('input', () => {
        timeValue.textContent = timeRange.value;
    });

    // Xử lý nút chọn độ khó
    document.querySelectorAll('.difficulty-buttons button').forEach(button => {
        button.addEventListener('click', () => {
            const difficulty = button.dataset.difficulty;
            const time = timeRange.value;
            if (!time || isNaN(time)) {
                alert('Vui lòng chọn thời gian hợp lệ!');
                return;
            }
            window.location.href = `game.html?difficulty=${difficulty}&time=${time}`;
        });
    });
});