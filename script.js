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
    const height = parseFloat(document.getElementById("height").value);
    const wireDiameter = parseFloat(document.getElementById("wireDiameter").value);

    if (isNaN(dInner) || dInner <= 0) {
        alert("Внутренний диаметр должен быть положительным числом.");
        return false;
    }
    if (isNaN(dOuter) || dOuter <= 0) {
        alert("Внешний диаметр должен быть положительным числом.");
        return false;
    }
    if (isNaN(lines) || lines <= 0) {
        alert("Количество витков должно быть положительным числом.");
        return false;
    }
    if (isNaN(k) || k <= 0) {
        alert("Коэффициент (k) должен быть положительным числом.");
        return false;
    }
    if (isNaN(height) || height <= 0) {
        alert("Высота тора должна быть положительным числом.");
        return false;
    }
    if (isNaN(wireDiameter) || wireDiameter <= 0) {
        alert("Диаметр провода должен быть положительным числом.");
        return false;
    }
    if (dInner >= dOuter) {
        alert("Внешний диаметр должен быть больше внутреннего.");
        return false;
    }
    return true;
}

// Расчет базовых параметров тора
function calculateBasicParams() {
    const dInner = parseFloat(document.getElementById("dInner").value) || 80;
    const lines = parseFloat(document.getElementById("lines").value) || 25;
    const k = parseFloat(document.getElementById("k").value) || 0.07;

    const intervalInner = (Math.PI * dInner) / lines;
    const valueInner = intervalInner / k;

    document.getElementById("valueInner").innerText = valueInner.toFixed(2);
    document.getElementById("distanceInner").innerText = intervalInner.toFixed(2);

    return { valueInner, intervalInner };
}

// Расчет длины провода
function calculateWireLength() {
    const dInner = parseFloat(document.getElementById("dInner").value);
    const dOuter = parseFloat(document.getElementById("dOuter").value);
    const N = parseFloat(document.getElementById("lines").value);
    const H = parseFloat(document.getElementById("height").value);
    const dпровод = parseFloat(document.getElementById("wireDiameter").value);

    if (
        isNaN(dInner) || isNaN(dOuter) || isNaN(N) || isNaN(H) || isNaN(dпровод) ||
        dInner >= dOuter || H <= 0 || N <= 0 || dпровод <= 0
    ) {
        document.getElementById("error").textContent = "Пожалуйста, проверьте введенные данные.";
        return null;
    }

    const Dсред = (dInner + dOuter) / 2; // Средний диаметр тора
    const Nслой = Math.floor(H / dпровод); // Количество витков в одном слое
    const Kслоев = Math.ceil(N / Nслой); // Количество слоев

    const kплотн = 0.21; // Коэффициент плотности намотки
    const Lвитка = Math.PI * (Dсред + ((Kслоев - 1) * dпровод) / 2); // Средняя длина одного витка
    const Lобщ = kплотн * N * Lвитка; // Общая длина провода
    const LобщМетры = Lобщ / 1000; // Перевод в метры

    document.getElementById("wireLength").textContent = LобщМетры.toFixed(2);
    return LобщМетры;
}

// Основная функция расчета
function calculate() {
    if (!validateInputs()) return;

    const loading = document.getElementById("loading");
    loading.style.display = "block";

    setTimeout(() => {
        try {
            const basicParams = calculateBasicParams(); // Базовые параметры
            const wireLength = calculateWireLength(); // Расчет длины провода

            if (basicParams && wireLength !== null) {
                saveToHistory(basicParams, wireLength); // Сохраняем историю
            }
        } catch (error) {
            alert("Произошла ошибка при расчете. Проверьте введенные данные.");
        } finally {
            loading.style.display = "none"; // Скрываем индикатор загрузки
        }
    }, 500);
}

// Сохранение истории расчетов
function saveToHistory(basicParams, wireLength) {
    const itemName = document.getElementById("itemName").value || "Результат";
    const height = parseFloat(document.getElementById("height").value) || 50;

    const historyItem = `
        <li>
            <strong>${itemName}:</strong><br>
            Значение для программы (внутр.): ${basicParams.valueInner.toFixed(2)} ед.<br>
            Расстояние между линиями (внутр.): ${basicParams.intervalInner.toFixed(2)} мм<br>
            Высота тора: ${height.toFixed(2)} мм<br>
            Общая длина провода: ${wireLength.toFixed(2)} м
        </li>
    `;

    const historyList = document.getElementById("history");
    historyList.innerHTML += historyItem;
}

// Очистка полей
function clearFields() {
    document.getElementById("dInner").value = "";
    document.getElementById("dOuter").value = "";
    document.getElementById("lines").value = "";
    document.getElementById("height").value = "";
    document.getElementById("itemName").value = "";
    document.getElementById("wireDiameter").value = "";

    document.getElementById("valueInner").innerText = "";
    document.getElementById("distanceInner").innerText = "";
    document.getElementById("wireLength").innerText = "";
    document.getElementById("error").textContent = "";
    document.getElementById("history").innerHTML = "";

    const kInput = document.getElementById("k");
    kInput.value = kInput.value || 0.07; // Сохраняем значение коэффициента (k)
}
