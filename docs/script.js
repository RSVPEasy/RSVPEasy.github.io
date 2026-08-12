const form = document.getElementById('eventForm');
const dateFields = document.getElementById('dateFields');
const addDateBtn = document.getElementById('addDateBtn');
const statusMessage = document.getElementById('statusMessage');

function formatTimeTo12Hour(timeValue) {
    if (!timeValue) return '';

    const [hoursString, minutes] = timeValue.split(':');
    const hours = Number(hoursString);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const adjustedHour = hours % 12 || 12;

    return `${adjustedHour}:${minutes} ${suffix}`;
}

function buildBasePayload() {
    const formData = new FormData(form);
    return {
        title: formData.get('title').trim(),
        time: formatTimeTo12Hour(formData.get('time')),
        description: formData.get('description').trim(),
        name: formData.get('name').trim()
    };
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    if (type) {
        statusMessage.classList.add(type);
    }
}

function sendEvent(payload) {
    return fetch('https://calendar.iaa-api.workers.dev/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(async (response) => {
        const responseData = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(responseData?.message || `Request failed (${response.status})`);
        }

        return responseData;
    });
}

function createAdditionalDateRow() {
    const row = document.createElement('div');
    row.className = 'date-row';

    const input = document.createElement('input');
    input.type = 'date';
    input.name = 'date';
    input.required = true;
    row.appendChild(input);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'icon-btn remove-btn';
    removeBtn.textContent = '–';
    removeBtn.title = 'Remove this date';
    removeBtn.addEventListener('click', () => row.remove());

    row.appendChild(removeBtn);
    return row;
}

function resetDateFields() {
    const rows = Array.from(dateFields.querySelectorAll('.date-row'));
    rows.slice(1).forEach((row) => row.remove());
    const firstInput = dateFields.querySelector('.date-row input[type="date"]');
    if (firstInput) {
        firstInput.value = '';
    }
}

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const dateInputs = Array.from(dateFields.querySelectorAll('input[type="date"]'));
    const dates = dateInputs.map((input) => input.value.trim()).filter(Boolean);

    if (!dates.length) {
        showStatus('Please add at least one date before sending.', 'error');
        return;
    }

    const basePayload = buildBasePayload();
    const requests = dates.map((date) => sendEvent({ ...basePayload, date }));

    showStatus('Sending your events...');

    Promise.all(requests)
        .then(() => {
            showStatus('Thanks! All events have been sent.', 'success');
            form.reset();
            resetDateFields();
        })
        .catch((error) => {
            console.error('Error:', error);
            showStatus('Sorry, something went wrong. Please try again.', 'error');
        });
});

addDateBtn.addEventListener('click', function () {
    const newRow = createAdditionalDateRow();
    dateFields.appendChild(newRow);
});
