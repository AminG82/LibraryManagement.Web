async function loadDashboard() {
    try {
        const report = await getData('/Reports/summary');

        document.getElementById('totalBooks').textContent = report.totalBooks ?? '—';
        document.getElementById('availableBooks').textContent = report.availableBooks ?? '—';
        document.getElementById('borrowedBooks').textContent = report.borrowedBooks ?? '—';
        document.getElementById('totalMembers').textContent = report.totalMembers ?? '—';
    } catch (error) {
        const errorEl = document.getElementById('errorMessage');
        const errorTextEl = document.getElementById('errorMessageText');
        errorTextEl.textContent = 'Failed to load dashboard data.';
        errorEl.classList.remove('alert--hidden');
        console.error(error);
    }
}

loadDashboard();