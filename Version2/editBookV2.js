let editBookForm = document.querySelector("#edit-book-form");


//Saving Changes
editBookForm.addEventListener('submit', e => {
    e.preventDefault();
    let bookStr = localStorage.getItem('bookToEdit');
    let bookToEdit = JSON.parse(bookStr);
    let titleVal = document.querySelector('#title').value;
    let authorVal = document.querySelector('#author').value;
    let isbnVal = document.querySelector('#isbn').value;

    if (titleVal === '' || authorVal === '' || isbnVal === '') {
        alert('Please fill all inputs')
    }
    else {
        let books = JSON.parse(localStorage.getItem('localBooks'));
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
    let bookStr = localStorage.getItem('bookToEdit');
    let bookToEdit = JSON.parse(bookStr);
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
    window.location.href = "index.html";
}