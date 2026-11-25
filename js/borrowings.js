let books = [];
let members = [];

const borrowingsTableBody = document.getElementById('borrowingsTableBody');
const borrowingsEmptyState = document.getElementById('borrowingsEmptyState');


async function initializeBorrowingsPage() {
    await loadBooks();
    await loadMembers();
    await loadBorrowings();
}

// Load Books for dropdown
async function loadBooks() {
    try {
        books = await getData('/Books');
        const select = document.getElementById('bookId');
        select.innerHTML = '<option value="">Select a book</option>';

        books
            .filter(book => book.availableCount > 0)
            .forEach(book => {
                const option = document.createElement('option');
                option.value = book.id;
                option.textContent = `${book.title} (${book.availableCount} available)`;
                select.appendChild(option);
            });

        if (books.filter(b => b.availableCount > 0).length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No available books';
            option.disabled = true;
            select.appendChild(option);
        }
    } catch (error) {
        showMessage('Failed to load books.', true);
        console.error(error);
    }
}

// Load Members for dropdown
async function loadMembers() {
    try {
        members = await getData('/Members');
        const select = document.getElementById('memberId');
        select.innerHTML = '<option value="">Select a member</option>';

        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.firstName} ${member.lastName} — ${member.nationalCode}`;
            select.appendChild(option);
        });
    } catch (error) {
        showMessage('Failed to load members.', true);
        console.error(error);
    }
}

// Load Borrowings Table
async function loadBorrowings() {
    try {
        const borrowings = await getData('/Borrowings');
        renderBorrowingsTable(borrowings);
    } catch (error) {
        showMessage('Failed to load borrowings.', true);
        console.error(error);
    }
}

function renderBorrowingsTable(borrowings) {
    borrowingsTableBody.innerHTML = '';

    if (borrowings.length === 0) {
        borrowingsTableBody.style.display = 'none';
        borrowingsEmptyState.classList.remove('hidden');
        borrowingsEmptyState.setAttribute('aria-hidden', 'false');
        return;
    }

    borrowingsTableBody.style.display = '';
    borrowingsEmptyState.classList.add('hidden');
    borrowingsEmptyState.setAttribute('aria-hidden', 'true');

    borrowings.forEach(borrowing => {
        const row = document.createElement('tr');
        const isReturned = borrowing.isReturned;
        const statusBadge = isReturned
            ? '<span class="badge badge--success">Returned</span>'
            : '<span class="badge badge--warning">Active</span>';

        let actions = '';
        if (!isReturned) {
            actions = `
                <button class="btn btn--ghost btn--sm btn--secondary" onclick="returnBook(${borrowing.id})" aria-label="Return ${escapeHtml(borrowing.bookTitle)}">
                    <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Return
                </button>
            `;
        } else {
            actions = `
                <button class="btn btn--ghost btn--sm btn-danger" onclick="deleteBorrowing(${borrowing.id})" aria-label="Delete borrowing record">
                    <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            `;
        }

        row.innerHTML = `
            <td>${borrowing.id}</td>
            <td>${escapeHtml(borrowing.bookTitle)}</td>
            <td>${escapeHtml(borrowing.memberName)}</td>
            <td>${formatDate(borrowing.borrowDate)}</td>
            <td class="table__cell--muted">${borrowing.returnDate ? formatDate(borrowing.returnDate) : '—'}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="table__actions">
                    ${actions}
                </div>
            </td>
        `;
        borrowingsTableBody.appendChild(row);
    });
}

// Create Borrowing
document.getElementById('borrowingForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const bookId = parseInt(document.getElementById('bookId').value);
    const memberId = parseInt(document.getElementById('memberId').value);

    if (!bookId || !memberId) {
        showMessage('Please select both a book and a member.', true);
        return;
    }

    try {
        await postData('/Borrowings', { bookId, memberId });
        showMessage('Book borrowed successfully.', false);
        document.getElementById('borrowingForm').reset();
        await loadBooks();
        await loadBorrowings();
    } catch (error) {
        showMessage(error.message || 'Failed to borrow book.', true);
        console.error(error);
    }
});

// Return Book
async function returnBook(id) {
    if (!confirm('Are you sure you want to return this book?')) return;

    try {
        await putData(`/Borrowings/${id}/return`);
        showMessage('Book returned successfully.', false);
        await loadBooks();
        await loadBorrowings();
    } catch (error) {
        showMessage(error.message || 'Failed to return book.', true);
        console.error(error);
    }
}

// Delete Borrowing
async function deleteBorrowing(id) {
    if (!confirm('Are you sure you want to delete this borrowing record?')) return;

    try {
        await deleteData(`/Borrowings/${id}`);
        showMessage('Borrowing deleted successfully.', false);
        await loadBorrowings();
    } catch (error) {
        showMessage(error.message || 'Failed to delete borrowing.', true);
        console.error(error);
    }
}

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
}

function showMessage(message, isError = false) {
    const element = document.getElementById('message');
    element.textContent = message;
    element.className = 'alert ' + (isError ? 'alert--error' : 'alert--success');
    element.classList.remove('alert--hidden');

    setTimeout(() => {
        element.classList.add('alert--hidden');
    }, 4000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

initializeBorrowingsPage();