async function loadDashboard() {
    try {
        const report = await getData("/Reports/summary");

        document.getElementById("totalBooks").textContent =
            report.totalBooks;

        document.getElementById("availableBooks").textContent =
            report.availableBooks;

        document.getElementById("borrowedBooks").textContent =
            report.borrowedBooks;

        document.getElementById("totalMembers").textContent =
            report.totalMembers;

    } catch (error) {
        document.getElementById("errorMessage").textContent =
            "Failed to load dashboard data.";

        console.error(error);
    }
}


loadDashboard();