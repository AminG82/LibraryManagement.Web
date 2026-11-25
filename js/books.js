let editingBookId = null;
const bookFormModal = document.getElementById('bookFormModal');
const bookForm = document.getElementById('bookForm');
const booksTableBody = document.getElementById('booksTableBody');
const booksEmptyState = document.getElementById('booksEmptyState');
const bookFormTitle = document.getElementById('bookFormTitle');
const bookFormSubmitText = document.getElementById('bookFormSubmitText');


async function loadBooks() {
    try {
        const books = await getData('/Books');
        renderBooksTable(books);
    } catch (error) {
        showMessage('Failed to load books.', true);
        console.error(error);
    }
}

function renderBooksTable(books) {
    booksTableBody.innerHTML = '';

    if (books.length === 0) {
        booksTableBody.style.display = 'none';
        booksEmptyState.classList.remove('hidden');
        booksEmptyState.setAttribute('aria-hidden', 'false');
        return;
    }

    booksTableBody.style.display = '';
    booksEmptyState.classList.add('hidden');
    booksEmptyState.setAttribute('aria-hidden', 'true');

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td><strong>${escapeHtml(book.title)}</strong></td>
            <td>${escapeHtml(book.author)}</td>
            <td class="table__cell--muted">${escapeHtml(book.isbn ?? '—')}</td>
            <td>${escapeHtml(book.categoryName)}</td>
            <td>${book.totalCount}</td>
            <td>${book.availableCount}</td>
            <td>
                <div class="table__actions">
                    <button class="btn btn--ghost btn--sm btn-edit" onclick="editBook(${book.id})" aria-label="Edit ${escapeHtml(book.title)}">
                        <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn btn--ghost btn--sm btn-danger" onclick="deleteBook(${book.id})" aria-label="Delete ${escapeHtml(book.title)}">
                        <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        booksTableBody.appendChild(row);
    });
}

async function loadCategories() {
    try {
        const categories = await getData('/Categories');
        const select = document.getElementById('categoryId');
        select.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    } catch (error) {
        showMessage('Failed to load categories.', true);
        console.error(error);
    }
}

function openBookForm() {
    editingBookId = null;
    bookFormTitle.textContent = 'Add Book';
    bookFormSubmitText.textContent = 'Save';
    bookForm.reset();
    bookFormModal.classList.add('modal-overlay--open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('title').focus(), 100);
}

function closeBookForm() {
    bookFormModal.classList.remove('modal-overlay--open');
    document.body.style.overflow = '';
    editingBookId = null;
}

bookForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const book = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        isbn: document.getElementById('isbn').value.trim() || null,
        categoryId: Number(document.getElementById('categoryId').value),
        totalCount: Number(document.getElementById('totalCount').value)
    };

    if (!book.title || !book.author || !book.categoryId || !book.totalCount) {
        showMessage('Please fill in all required fields.', true);
        return;
    }

    try {
        if (editingBookId === null) {
            await postData('/Books', book);
            showMessage('Book added successfully.');
        } else {
            await putData(`/Books/${editingBookId}`, book);
            showMessage('Book updated successfully.');
        }

        closeBookForm();
        await loadBooks();
    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
});

async function editBook(id) {
    try {
        const book = await getData(`/Books/${id}`);
        editingBookId = id;
        bookFormTitle.textContent = 'Edit Book';
        bookFormSubmitText.textContent = 'Update';
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn ?? '';
        document.getElementById('categoryId').value = book.categoryId;
        document.getElementById('totalCount').value = book.totalCount;
        bookFormModal.classList.add('modal-overlay--open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('title').focus(), 100);
    } catch (error) {
        showMessage('Failed to load book.', true);
        console.error(error);
    }
}

async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        await deleteData(`/Books/${id}`);
        showMessage('Book deleted successfully.');
        await loadBooks();
    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
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

async function initializeBooksPage() {
    await loadCategories();
    await loadBooks();
}

bookFormModal.addEventListener('click', (e) => {
    if (e.target === bookFormModal) closeBookForm();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookFormModal.classList.contains('modal-overlay--open')) {
        closeBookForm();
    }
});

initializeBooksPage();