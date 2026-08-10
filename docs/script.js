const form = document.getElementById('eventForm');
const statusMessage = document.getElementById('statusMessage');

function formatTimeTo12Hour(timeValue) {
    if (!timeValue) return '';

    const [hoursString, minutes] = timeValue.split(':');
    const hours = Number(hoursString);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const adjustedHour = hours % 12 || 12;

    return `${adjustedHour}:${minutes} ${suffix}`;
}

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
        title: formData.get('title').trim(),
        time: formatTimeTo12Hour(formData.get('time')),
        date: formData.get('date'),
        description: formData.get('description').trim(),
        name: formData.get('name').trim()
    };

    statusMessage.textContent = 'Sending your event...';
    statusMessage.className = 'status-message';

    fetch('https://calendar.iaa-api.workers.dev/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(async (response) => {
            const responseData = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(responseData?.message || `Request failed (${response.status})`);
            }

            statusMessage.textContent = 'Thanks! Your event has been sent.';
            statusMessage.classList.add('success');
            form.reset();
        })
        .catch((error) => {
            console.error('Error:', error);
            statusMessage.textContent = 'Sorry, something went wrong. Please try again.';
            statusMessage.classList.add('error');
        });
});
