// Локальное сохранение темы
function toggleTheme() {
    const isDarkMode = document.getElementById("switcher-input").checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.querySelector(".calculator").classList.toggle("dark-mode", isDarkMode);
    document.getElementById("history").classList.toggle("dark-mode", isDarkMode); // Применяем темную тему к истории
    localStorage.setItem("darkMode", isDarkMode); // Сохраняем состояние
}

// Загрузка сохраненной темы при загрузке страницы
window.onload = () => {
    const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
    if (isDarkMode) {
        document.getElementById("switcher-input").checked = true;
        toggleTheme();
    }
};

// Валидация входных данных
function validateInputs() {
    const dInner = parseFloat(document.getElementById("dInner").value);
    const dOuter = parseFloat(document.getElementById("dOuter").value);
    const lines = parseFloat(document.getElementById("lines").value);
    const k = parseFloat(document.getElementById("k").value);

    if (isNaN(dInner) || dInner <= 0) {
        alert("Внутренний диаметр должен быть положительным числом.");
        return false;
    }
    if (isNaN(dOuter) || dOuter <= 0) {
        alert("Внешний диаметр должен быть положительным числом.");
        return false;
    }
    if (isNaN(lines) || lines <= 0) {
        alert("Количество линий должно быть положительным числом.");
        return false;
    }
    if (isNaN(k) || k <= 0) {
        alert("Коэффициент (k) должен быть положительным числом.");
        return false;
    }
    return true;
}

// Расчеты
function calculate() {
    if (!validateInputs()) return;

    const loading = document.getElementById("loading");
    loading.style.display = "block"; // Показываем индикатор

    setTimeout(() => {
        try {
            const dInner = parseFloat(document.getElementById("dInner").value) || 80;
            const lines = parseFloat(document.getElementById("lines").value) || 25;
            const k = parseFloat(document.getElementById("k").value) || 0.07;

            const intervalInner = (Math.PI * dInner) / lines;
            const valueInner = intervalInner / k;

            // Получаем дополнительные данные
            const itemName = document.getElementById("itemName").value || "Результат";
            const height = parseFloat(document.getElementById("height").value) || 50;

            // Обновляем результаты
            document.getElementById("valueInner").innerText = valueInner.toFixed(2);
            document.getElementById("distanceInner").innerText = intervalInner.toFixed(2);

            // Сохраняем историю
            const historyList = document.getElementById("history");
            const historyItem = `
                <li>
                    <strong>${itemName}:</strong><br>
                    Значение для программы (внутр.): ${valueInner.toFixed(2)} ед.<br>
                    Расстояние между линиями (внутр.): ${intervalInner.toFixed(2)} мм<br>
                    Высота тора: ${height.toFixed(2)} мм
                </li>
            `;
            historyList.innerHTML += historyItem;

        } catch (error) {
            alert("Произошла ошибка при расчете. Проверьте введенные данные.");
        } finally {
            loading.style.display = "none"; // Скрываем индикатор
        }
    }, 500); // Имитация задержки для демонстрации прогресса
}

// Очистка полей
function clearFields() {
    document.getElementById("dInner").value = "";
    document.getElementById("dOuter").value = "";
    document.getElementById("lines").value = "";
    document.getElementById("height").value = ""; // Очищаем высоту тора
    document.getElementById("itemName").value = ""; // Очищаем название изделия
    document.getElementById("valueInner").innerText = "";
    document.getElementById("distanceInner").innerText = "";
    document.getElementById("history").innerHTML = ""; // Очищаем историю
}

// Кнопка "Очистить" не очищает коэффициент (k)
document.querySelector('button[onclick="clearFields()"]').addEventListener("click", () => {
    const kInput = document.getElementById("k");
    kInput.value = kInput.value || 0.07; // Сохраняем значение коэффициента (k)
});