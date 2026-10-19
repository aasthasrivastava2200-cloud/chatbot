
const STORAGE_KEY = "booknest-reading-list";

const statuses = [
    "To Read",
    "Reading",
    "Done"
];

let books = loadBooks();

let currentFilter = "All";


const form =
    document.getElementById("bookForm");

const titleInput =
    document.getElementById("bookTitle");

const statusInput =
    document.getElementById("bookStatus");

const formMessage =
    document.getElementById("formMessage");

const bookList =
    document.getElementById("bookList");

const bookCount =
    document.getElementById("bookCount");

const filterButtons =
    document.querySelectorAll(".filter");


/* -----------------------------
   LOAD DATA
----------------------------- */

function loadBooks() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const data = JSON.parse(saved);

        if (!Array.isArray(data)) {
            return [];
        }

        return data.filter(book =>
            book &&
            typeof book.id === "string" &&
            typeof book.title === "string" &&
            statuses.includes(book.status)
        );

    } catch {

        return [];
    }
}


/* -----------------------------
   SAVE DATA
----------------------------- */

function saveBooks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(books)
    );
}


/* -----------------------------
   ID
----------------------------- */

function createId() {

    return (
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2)
    );
}


/* -----------------------------
   STATUS CLASS
----------------------------- */

function getStatusClass(status) {

    return status
        .toLowerCase()
        .replace(" ", "-");
}


/* -----------------------------
   UPDATE COUNTS
----------------------------- */

function updateCounts() {

    const toRead =
        books.filter(
            book => book.status === "To Read"
        ).length;


    const reading =
        books.filter(
            book => book.status === "Reading"
        ).length;


    const done =
        books.filter(
            book => book.status === "Done"
        ).length;


    document.getElementById("countAll")
        .textContent = books.length;


    document.getElementById("countToRead")
        .textContent = toRead;


    document.getElementById("countReading")
        .textContent = reading;


    document.getElementById("countDone")
        .textContent = done;


    document.getElementById("filterAll")
        .textContent = books.length;


    document.getElementById("filterToRead")
        .textContent = toRead;


    document.getElementById("filterReading")
        .textContent = reading;


    document.getElementById("filterDone")
        .textContent = done;
}


/* -----------------------------
   RENDER
----------------------------- */

function renderBooks() {

    updateCounts();


    /* Filter buttons */

    filterButtons.forEach(button => {

        const active =
            button.dataset.filter ===
            currentFilter;

        button.classList.toggle(
            "active",
            active
        );

        button.setAttribute(
            "aria-pressed",
            String(active)
        );
    });


    /* Filter books */

    const visibleBooks =
        currentFilter === "All"
            ? books
            : books.filter(
                book =>
                    book.status ===
                    currentFilter
            );


    /* Count text */

    bookCount.textContent =
        `${visibleBooks.length} ${
            visibleBooks.length === 1
                ? "book"
                : "books"
        } in your collection`;


    bookList.innerHTML = "";


    /* Empty state */

    if (visibleBooks.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";


        const icon =
            document.createElement("div");

        icon.className =
            "empty-icon";

        icon.textContent = "📚";


        const title =
            document.createElement("strong");

        title.textContent =
            books.length === 0
                ? "No books yet. Add your first book."
                : "No books in this category.";


        const text =
            document.createElement("p");

        text.textContent =
            books.length === 0
                ? "Your reading journey starts here."
                : "Try selecting another filter.";


        empty.appendChild(icon);

        empty.appendChild(title);

        empty.appendChild(text);

        bookList.appendChild(empty);

        return;
    }


    /* Create cards */

    visibleBooks.forEach(book => {

        const card =
            document.createElement("article");

        card.className =
            "book-card";


        /* Top */

        const top =
            document.createElement("div");

        top.className =
            "book-top";


        const title =
            document.createElement("h3");

        title.className =
            "book-title";

        title.textContent =
            book.title;


        const badge =
            document.createElement("span");

        badge.className =
            `badge ${getStatusClass(
                book.status
            )}`;

        badge.textContent =
            book.status;


        top.appendChild(title);

        top.appendChild(badge);


        /* Bottom */

        const bottom =
            document.createElement("div");

        bottom.className =
            "book-bottom";


        /* Status select */

        const select =
            document.createElement("select");


        select.setAttribute(
            "aria-label",
            `Change status for ${book.title}`
        );


        statuses.forEach(status => {

            const option =
                document.createElement("option");

            option.value = status;

            option.textContent =
                status;

            option.selected =
                status === book.status;

            select.appendChild(option);
        });


        select.addEventListener(
            "change",
            () => {

                book.status =
                    select.value;

                saveBooks();

                renderBooks();
            }
        );


        /* Delete */

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-btn";

        deleteButton.type =
            "button";

        deleteButton.textContent =
            "Delete";


        deleteButton.addEventListener(
            "click",
            () => {

                books =
                    books.filter(
                        item =>
                            item.id !== book.id
                    );

                saveBooks();

                renderBooks();
            }
        );


        bottom.appendChild(select);

        bottom.appendChild(
            deleteButton
        );


        card.appendChild(top);

        card.appendChild(bottom);


        bookList.appendChild(card);
    });
}


/* -----------------------------
   ADD BOOK
----------------------------- */

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        formMessage.textContent = "";


        const title =
            titleInput.value.trim();

        const status =
            statusInput.value;


        if (!title) {

            formMessage.textContent =
                "Please enter a book title.";

            return;
        }


        /* Duplicate check */

        const exists =
            books.some(
                book =>
                    book.title.toLowerCase() ===
                    title.toLowerCase()
            );


        if (exists) {

            formMessage.textContent =
                "This book is already in your list.";

            return;
        }


        /* Create book */

        books.unshift({

            id: createId(),

            title: title,

            status: status

        });


        saveBooks();


        /* Reset form */

        titleInput.value = "";

        statusInput.value =
            "To Read";


        currentFilter =
            "All";


        renderBooks();


        titleInput.focus();
    }
);


/* -----------------------------
   FILTERS
----------------------------- */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            currentFilter =
                button.dataset.filter;

            renderBooks();
        }
    );
});


/* -----------------------------
   START APP
----------------------------- */

renderBooks();

