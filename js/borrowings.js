let books = [];
let members = [];


async function initializeBorrowingsPage() {
    await loadBooks();
    await loadMembers();
    await loadBorrowings();
}


// -----------------------------
// Load Books
// -----------------------------

async function loadBooks() {
    try {
        books = await getData("/Books");

        const select = document.getElementById("bookId");

        select.innerHTML = `
            <option value="">Select a book</option>
        `;

        books
            .filter(book => book.availableCount > 0)
            .forEach(book => {

                const option = document.createElement("option");

                option.value = book.id;

                option.textContent =
                    `${book.title} (${book.availableCount} available)`;

                select.appendChild(option);
            });

    } catch (error) {
        showMessage("Failed to load books.", true);
        console.error(error);
    }
}


// -----------------------------
// Load Members
// -----------------------------

async function loadMembers() {
    try {
        members = await getData("/Members");

        const select = document.getElementById("memberId");

        select.innerHTML = `
            <option value="">Select a member</option>
        `;

        members.forEach(member => {

            const option = document.createElement("option");

            option.value = member.id;

            option.textContent =
                `${member.firstName} ${member.lastName} - ${member.nationalCode}`;

            select.appendChild(option);
        });

    } catch (error) {
        showMessage("Failed to load members.", true);
        console.error(error);
    }
}


// -----------------------------
// Load Borrowings
// -----------------------------

async function loadBorrowings() {

    try {

        const borrowings = await getData("/Borrowings");

        const tableBody =
            document.getElementById("borrowingsTableBody");

        tableBody.innerHTML = "";

        borrowings.forEach(borrowing => {

            const row = document.createElement("tr");

            const status =
                borrowing.isReturned
                    ? "Returned"
                    : "Active";

            let actions = "";

            if (!borrowing.isReturned) {

                actions = `
                    <button
                        class="btn btn-secondary"
                        onclick="returnBook(${borrowing.id})">
                        Return
                    </button>
                `;

            } else {

                actions = `
                    <button
                        class="btn btn-danger"
                        onclick="deleteBorrowing(${borrowing.id})">
                        Delete
                    </button>
                `;
            }

            row.innerHTML = `
                <td>${borrowing.id}</td>

                <td>${borrowing.bookTitle}</td>

                <td>${borrowing.memberName}</td>

                <td>${formatDate(borrowing.borrowDate)}</td>

                <td>
                    ${
                        borrowing.returnDate
                            ? formatDate(borrowing.returnDate)
                            : "-"
                    }
                </td>

                <td>${status}</td>

                <td>
                    <div class="action-buttons">
                        ${actions}
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {

        showMessage("Failed to load borrowings.", true);

        console.error(error);
    }
}


// -----------------------------
// Create Borrowing
// -----------------------------

document
    .getElementById("borrowingForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const bookId =
            parseInt(document.getElementById("bookId").value);

        const memberId =
            parseInt(document.getElementById("memberId").value);

        try {

            await postData("/Borrowings", {
                bookId: bookId,
                memberId: memberId
            });

            showMessage(
                "Book borrowed successfully.",
                false
            );

            document.getElementById("borrowingForm").reset();

            await loadBooks();
            await loadBorrowings();

        } catch (error) {

            showMessage(
                error.message || "Failed to borrow book.",
                true
            );

            console.error(error);
        }
    });


// -----------------------------
// Return Book
// -----------------------------

async function returnBook(id) {

    const confirmed =
        confirm("Are you sure you want to return this book?");

    if (!confirmed)
        return;

    try {

        await putData(`/Borrowings/${id}/return`);

        showMessage(
            "Book returned successfully.",
            false
        );

        await loadBooks();
        await loadBorrowings();

    } catch (error) {

        showMessage(
            error.message || "Failed to return book.",
            true
        );

        console.error(error);
    }
}


// -----------------------------
// Delete Borrowing
// -----------------------------

async function deleteBorrowing(id) {

    const confirmed =
        confirm("Are you sure you want to delete this borrowing record?");

    if (!confirmed)
        return;

    try {

        await deleteData(`/Borrowings/${id}`);

        showMessage(
            "Borrowing deleted successfully.",
            false
        );

        await loadBorrowings();

    } catch (error) {

        showMessage(
            error.message || "Failed to delete borrowing.",
            true
        );

        console.error(error);
    }
}


// -----------------------------
// Format Date
// -----------------------------

function formatDate(dateString) {

    if (!dateString)
        return "-";

    return new Date(dateString).toLocaleDateString();
}


// -----------------------------
// Show Message
// -----------------------------

function showMessage(message, isError = false) {

    const element =
        document.getElementById("message");

    element.textContent = message;

    element.classList.remove("hidden");

    if (isError) {
        element.classList.add("error-message");
    } else {
        element.classList.remove("error-message");
    }

    setTimeout(() => {
        element.classList.add("hidden");
    }, 3000);
}


// -----------------------------
// Initialize
// -----------------------------

initializeBorrowingsPage();