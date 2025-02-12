// Сохраняем ссылки на элементы
const elements = {
    dInner: document.getElementById("dInner"),
    dOuter: document.getElementById("dOuter"),
    lines: document.getElementById("lines"),
    k: document.getElementById("k"),
    height: document.getElementById("height"),
    wireDiameter: document.getElementById("wireDiameter"),
    lotkaVitki: document.getElementById("lotkaVitki"), // Новое поле
    itemName: document.getElementById("itemName"),
    valueInner: document.getElementById("valueInner"),
    distanceInner: document.getElementById("distanceInner"),
    wireLength: document.getElementById("wireLength"),
    stationWireCount: document.getElementById("stationWireCount"), // Новый результат
    error: document.getElementById("error"),
    history: document.getElementById("history"),
    loading: document.getElementById("loading")
};

// Локальное сохранение темы
function toggleTheme() {
    const isDarkMode = document.getElementById("switcher-input").checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.querySelector(".calculator").classList.toggle("dark-mode", isDarkMode);
    document.getElementById("history").classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode);
}

// Загрузка сохраненной темы при загрузке страницы
window.onload = () => {
    const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
    if (isDarkMode) {
        document.getElementById("switcher-input").checked = true;
        toggleTheme();
    }
};

// Общая функция для валидации числовых полей
function validateNumberField(fieldId, fieldName, minValue = 0) {
    const value = parseFloat(elements[fieldId].value);
    if (isNaN(value) || value <= minValue) {
        alert(`${fieldName} должен быть положительным числом.`);
        return false;
    }
    return true;
}

// Валидация входных данных
function validateInputs() {
    if (!validateNumberField("dInner", "Внутренний диаметр")) return false;
    if (!validateNumberField("dOuter", "Внешний диаметр")) return false;
    if (!validateNumberField("lines", "Количество витков")) return false;
    if (!validateNumberField("k", "Коэффициент (k)")) return false;
    if (!validateNumberField("height", "Высота тора")) return false;
    if (!validateNumberField("wireDiameter", "Диаметр провода")) return false;
    if (!validateNumberField("lotkaVitki", "Расчетные витки на один оборот лотка", 0.0001)) return false;

    if (parseFloat(elements.dInner.value) >= parseFloat(elements.dOuter.value)) {
        alert("Внешний диаметр должен быть больше внутреннего.");
        return false;
    }

    return true;
}

// Расчет базовых параметров тора
function calculateBasicParams() {
    const dInner = parseFloat(elements.dInner.value) || 80;
    const lines = parseFloat(elements.lines.value) || 25;
    const k = parseFloat(elements.k.value) || 0.07;

    const intervalInner = (Math.PI * dInner) / lines;
    const valueInner = intervalInner / k;

    elements.valueInner.innerText = valueInner.toFixed(2);
    elements.distanceInner.innerText = intervalInner.toFixed(2);

    return { valueInner, intervalInner };
}

// Расчет длины провода
function calculateWireLength() {
    const dOuter = parseFloat(elements.dOuter.value);
    const dInner = parseFloat(elements.dInner.value);
    const H = parseFloat(elements.height.value);
    const N = parseFloat(elements.lines.value);

    if (
        isNaN(dOuter) || isNaN(dInner) || isNaN(H) || isNaN(N) ||
        dOuter <= dInner || H <= 0 || N <= 0
    ) {
        elements.error.textContent = "Пожалуйста, проверьте введенные данные.";
        return null;
    }

    const Lvitka = 2 * (dOuter - dInner) + 2 * H;
    const Lobsch = N * Lvitka;
    const LobschMeters = Lobsch / 1000;

    elements.wireLength.textContent = `${LobschMeters.toFixed(2)}`;
    return LobschMeters;
}

// Расчет количества провода для станка
function calculateStationWireCount() {
    const lines = parseFloat(elements.lines.value);
    const lotkaVitki = parseFloat(elements.lotkaVitki.value);

    if (isNaN(lines) || isNaN(lotkaVitki) || lotkaVitki === 0) {
        elements.error.textContent = "Пожалуйста, проверьте введенные данные.";
        return null;
    }

    // Новая формула: (lines / lotkaVitki) * 800
    const stationWireCount = ((lines / lotkaVitki) * 800).toFixed(2);
    elements.stationWireCount.textContent = stationWireCount;
    return stationWireCount;
}

// Основная функция расчета
function calculate() {
    if (!validateInputs()) return;

    const loading = elements.loading;
    loading.style.display = "block";

    setTimeout(() => {
        try {
            const basicParams = calculateBasicParams();
            const wireLength = calculateWireLength();
            const stationWireCount = calculateStationWireCount();

            if (basicParams && wireLength !== null && stationWireCount !== null) {
                saveToHistory(basicParams, wireLength, stationWireCount);
            }
        } catch (error) {
            alert("Произошла ошибка при расчете. Проверьте введенные данные.");
        } finally {
            loading.style.display = "none";
        }
    }, 500);
}

// Сохранение истории расчетов
function saveToHistory(basicParams, wireLength, stationWireCount) {
    if (!basicParams || wireLength === null || stationWireCount === null) return;

    const itemName = elements.itemName.value || "Результат";
    const height = parseFloat(elements.height.value) || 50;

    const historyItem = `
        <li>
            <strong>${itemName}:</strong><br>
            Значение для программы (внутр.): ${basicParams.valueInner.toFixed(2)} ед.<br>
            Расстояние между линиями (внутр.): ${basicParams.intervalInner.toFixed(2)} мм<br>
            Высота тора: ${height.toFixed(2)} мм<br>
            Внешний диаметр: ${parseFloat(elements.dOuter.value).toFixed(2)} мм<br>
            Внутренний диаметр: ${parseFloat(elements.dInner.value).toFixed(2)} мм<br>
            Общая длина провода: ${wireLength.toFixed(2)}<br>
            Количество провода для станка: ${stationWireCount}
        </li>
    `;
    elements.history.innerHTML += historyItem;
}

// Очистка полей
function clearFields() {
    elements.dInner.value = "";
    elements.dOuter.value = "";
    elements.lines.value = "";
    elements.height.value = "";
    elements.itemName.value = "";
    elements.wireDiameter.value = "";
    elements.lotkaVitki.value = ""; // Очищаем новое поле
    elements.valueInner.innerText = "";
    elements.distanceInner.innerText = "";
    elements.wireLength.innerText = "";
    elements.stationWireCount.innerText = ""; // Очищаем новый результат
    elements.error.textContent = "";
    elements.history.innerHTML = "";

    const kInput = elements.k;
    kInput.value = kInput.value || 0.07;
}
