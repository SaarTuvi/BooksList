let editBookForm = document.querySelector("#edit-book-form");
let bookToEdit = {};
let books = [];

//Saving Changes
editBookForm.addEventListener('submit', e => {
    e.preventDefault();
    let titleVal = document.querySelector('#title').value;
    let authorVal = document.querySelector('#author').value;
    let isbnVal = document.querySelector('#isbn').value;

    if (titleVal === '' || authorVal === '' || isbnVal === '') {
        alert('Please fill all inputs')
    }
    else {
        let bookIndex = books.findIndex(book => book.isbn == bookToEdit.isbn)
        books.splice(bookIndex, 1);
        bookToEdit.title = titleVal;
        bookToEdit.author = authorVal;
        bookToEdit.isbn = isbnVal;
        books.push(bookToEdit);
        localStorage.setItem('localBooks', JSON.stringify(books));
        alert("Edited Successfuly");
        returnToMain();
    }
})

//Setting the form inputs according to the book to edit
window.addEventListener('DOMContentLoaded', (event) => {
         books = JSON.parse(localStorage.getItem('localBooks'));
    let bookIsbn = localStorage.getItem('bookToEdit');
 bookToEdit = books.find(book => book.isbn == bookIsbn)
    document.querySelector('#title').value = bookToEdit.title;
    document.querySelector('#author').value = bookToEdit.author;
    document.querySelector('#isbn').value = bookToEdit.isbn;
});

//Confirmation alert for loss of data
function cancleChanges() {
    let confirmation = confirm("You Are Now Leaving This Page\r\nAll Data Will Be Lost\r\nAre You Sure You Wish To Continue?");
    if (confirmation == true) {
        returnToMain();
    }
}

//Redirects to Books.html
function returnToMain() {
    localStorage.removeItem('bookToEdit');
    window.location.href = "indexV1.html";
}