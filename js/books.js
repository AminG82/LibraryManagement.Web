let editingBookId = null;


async function loadBooks() {

    try {

        const books = await getData("/Books");

        const tableBody =
            document.getElementById("booksTableBody");

        tableBody.innerHTML = "";

        books.forEach(book => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn ?? "-"}</td>
                <td>${book.categoryName}</td>
                <td>${book.totalCount}</td>
                <td>${book.availableCount}</td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="btn btn-edit"
                            onclick="editBook(${book.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-danger"
                            onclick="deleteBook(${book.id})">
                            Delete
                        </button>

                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {

        showMessage(
            "Failed to load books.",
            true
        );

        console.error(error);
    }
}
//Categories--Get
async function loadCategories() {

    try {

        const categories = await getData("/Categories");

        const select =
            document.getElementById("categoryId");

        select.innerHTML =
            '<option value="">Select Category</option>';

        categories.forEach(category => {

            const option = document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            select.appendChild(option);
        });

    } catch (error) {

        showMessage(
            "Failed to load categories.",
            true
        );

        console.error(error);
    }
}
//Opening--Form
function openBookForm() {

    editingBookId = null;

    document.getElementById("formTitle").textContent =
        "Add Book";

    document.getElementById("bookForm").reset();

    document.getElementById("bookFormContainer")
        .classList.remove("hidden");
}
//Closeing--Form
function closeBookForm() {

    document.getElementById("bookFormContainer")
        .classList.add("hidden");

    editingBookId = null;
}
//Add--book
document.getElementById("bookForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const book = {

            title: document.getElementById("title").value,

            author: document.getElementById("author").value,

            isbn:
                document.getElementById("isbn").value || null,

            categoryId:
                Number(
                    document.getElementById("categoryId").value
                ),

            totalCount:
                Number(
                    document.getElementById("totalCount").value
                )
        };


        try {

            if (editingBookId === null) {

                await postData("/Books", book);

                showMessage(
                    "Book added successfully."
                );

            } else {

                await putData(
                    `/Books/${editingBookId}`,
                    book
                );

                showMessage(
                    "Book updated successfully."
                );
            }

            closeBookForm();

            await loadBooks();

        } catch (error) {

            showMessage(
                error.message,
                true
            );

            console.error(error);
        }

    });

//Edit--Book
async function editBook(id) {

    try {

        const book = await getData(`/Books/${id}`);

        editingBookId = id;

        document.getElementById("formTitle").textContent =
            "Edit Book";

        document.getElementById("title").value =
            book.title;

        document.getElementById("author").value =
            book.author;

        document.getElementById("isbn").value =
            book.isbn ?? "";

        document.getElementById("categoryId").value =
            book.categoryId;

        document.getElementById("totalCount").value =
            book.totalCount;

        document.getElementById("bookFormContainer")
            .classList.remove("hidden");

    } catch (error) {

        showMessage(
            "Failed to load book.",
            true
        );

        console.error(error);
    }
}

//DELETE--Book
async function deleteBook(id) {

    const confirmed =
        confirm("Are you sure you want to delete this book?");

    if (!confirmed)
        return;


    try {

        await deleteData(`/Books/${id}`);

        showMessage(
            "Book deleted successfully."
        );

        await loadBooks();

    } catch (error) {

        showMessage(
            error.message,
            true
        );

        console.error(error);
    }
}

//Message--Helper
function showMessage(message, isError = false) {

    const element =
        document.getElementById("message");

    element.textContent = message;

    element.style.color =
        isError ? "#dc2626" : "#16a34a";

    setTimeout(() => {

        element.textContent = "";

    }, 3000);
}

async function initializeBooksPage() {

    await loadCategories();

    await loadBooks();
}


initializeBooksPage();