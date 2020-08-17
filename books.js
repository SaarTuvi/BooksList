//Book Model Item
let remoteBooks = [];
class Book {
    constructor(title, author, isbn, isLocal) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.isLocal = isLocal;
    }
}

//Access books from storage
class BooksStorage {
    static BOOKSKEY = "localBooks";
    //Return Array of Book


    static getbooksFromLocalStorage() {
        let books;
        if (localStorage.getItem(BooksStorage.BOOKSKEY) === null) {
            books = [];
        }
        else {
            //Get torage Value as JSON String
            let booksArrTxt = localStorage.getItem(BooksStorage.BOOKSKEY);

            //Convert the string to real JSON Object
            books = JSON.parse(booksArrTxt);
        }
        return books;
    }


    static addBookToStorage(book) {
        //1.Read All Books as Object (getBooks())
        let books = BooksStorage.getbooksFromLocalStorage();

        //2.push to array
        books.push(book);
        //3. Save array to storage

        let booksJsonText = JSON.stringify(books);
        localStorage.setItem(BooksStorage.BOOKSKEY, booksJsonText);
    }
    static getSelectedBook(isbn) {
        let books = BooksStorage.getbooksFromLocalStorage();
        let book = books.find(book => book.isbn == isbn);
        return book;
    }
    //Remove item from storage by isbn code
    static removeBookFromStorage(isbn) {
        //1.Read All Books as Object (getBooks())
        let books = BooksStorage.getbooksFromLocalStorage();

        //2.Remove book from array
        let bookIndex = books.findIndex(book => book.isbn == isbn)
        books.splice(bookIndex, 1);

        //3. Save array to storage
        let booksJsonText = JSON.stringify(books);
        localStorage.setItem(BooksStorage.BOOKSKEY, booksJsonText);
    }

    static updateFromRemoteStorage() {
        return new Promise((resolve, reject) => {
            
            fetch('books.json').then(response => response.json()).then(data => {
                remoteBooks = data;
                resolve();
                });
        });
    }
}


//Display Data
//Read data from inputs for new book Item
//Delete item
//UI Alrets
class UI {
    //Add Item of book to table
    static addBookToList(book) {
        //  this.books.push(book);
        let listTableBody = document.querySelector("#books-list");
        let row = document.createElement("tr");
        row.innerHTML = `<td>${book.title}</td>  
                         <td>${book.author}</td>  
                         <td>${book.isbn}</td>`;
        if (book.isLocal === true) {
            row.innerHTML += `<td><a href="#" id="b-${book.isbn}" onclick = 'removeBook(this,${book.isbn});'>
            <span class="badge badge-pill badge-danger">X</span> </a></td><td>
            <a href='editBook.html' onclick='passBookToNextPage(this,${book.isbn});'>
            <span class="badge badge-pill badge-info">Edit</span></a></td>`;
        }
        else {
            row.innerHTML += "<td>Remote Storage</td><td>Can't Edit</td>"
            row.classList.add('table-secondary');
        }
        listTableBody.appendChild(row);
    }

    //Read data from storage and display books in list
    static displayBooks() {
        UI.ClearTableList();
        let sortingCondition;
        let booksArr = BooksStorage.getbooksFromLocalStorage();
        let allBooks = (booksArr.concat(remoteBooks));
        allBooks.sort(function (a, b) {
            let sortingConditionStr = localStorage.getItem('sortBy');
            if (sortingConditionStr) {
                sortingCondition = JSON.parse(sortingConditionStr)['value'];
            }
            else {
                sortingCondition = 'title';
            }
            if (a != null && b != null) {

                let valA = a[sortingCondition];
                let valB = b[sortingCondition];
                if (valA < valB) {
                    return -1;
                }
                if (valA > valB) {
                    return 1;
                }
            }
            return 0;
        });
        allBooks.forEach(book => {
            if (book != null)
                UI.addBookToList(book);
        });
    }

    static removeBookFromList(element) {
        let elementTr = element.parentElement.parentElement;
        elementTr.remove();
    }

    static ClearTableList() {
        let listTableBody = document.querySelector("#books-list");
        listTableBody.innerHTML = '';
    }
}

//All DOM Elements ready
window.addEventListener('DOMContentLoaded', (event) => {
    let selectBox = document.querySelector("#sortBy");
    let sortingConditionStr = localStorage.getItem('sortBy');
    if (sortingConditionStr != null) {
        let sortingIndex = JSON.parse(sortingConditionStr)['index'];
        selectBox.selectedIndex = sortingIndex;
    }

    BooksStorage.updateFromRemoteStorage().then(()=> UI.displayBooks());
    setInterval(() => {
        BooksStorage.updateFromRemoteStorage().then(() => UI.displayBooks());
    }, 180000)

});

//Register add new book from form inputs
var bookForm = document.querySelector("#book-form");

// Submit - Takes all input names and values, and sends to server  
bookForm.addEventListener('submit', e => {

    //Cancel the submit to server (default)
    //Allows us to handle the submit event
    e.preventDefault();

    let titleVal = document.querySelector('#title').value;
    let authorVal = document.querySelector('#author').value;
    let isbnVal = document.querySelector('#isbn').value;

    //alert(titleVal +"-" + authorVal +"-"+isbnVal);
    if (titleVal === '' || authorVal === '' || isbnVal === '') {
        alert('Please fill all inputs')
    }
    else {
        //When Book Added - it is added to storage and then to UI
        //Better way is to only deal with Storage - while UI refreshes accordingly
        book = new Book(titleVal, authorVal, isbnVal, true);
        BooksStorage.addBookToStorage(book);
        // UI.addBookToList(book);
        UI.displayBooks();
        alert("Book Added");
        //Empty form fields
        bookForm.reset();
    }
})

//When Book removed - it is removed from storage and then from UI
//Better way is to only deal with Storage - while UI refreshes accordingly
function removeBook(element, isbn) {
    BooksStorage.removeBookFromStorage(isbn)
    //UI.removeBookFromList(element);
    UI.displayBooks();
    alert("Book Removed");
}

function passBookToNextPage(element, isbn) {
    let book = BooksStorage.getSelectedBook(isbn);
    localStorage.setItem('bookToEdit', JSON.stringify(book));
}

function sortBy() {
    let selectBox = document.querySelector("#sortBy");
    let selectedValue = selectBox.options[selectBox.selectedIndex].value;
    let sortObj = { value: selectedValue, index: selectBox.selectedIndex };
    localStorage.setItem('sortBy', JSON.stringify(sortObj));
    UI.displayBooks();
}

//DevelopTest
//let b1 = new Book("Fake Title1", "Fake Author1", "111111111");
//BooksStorage.addBook(b1);
//let b2 = new Book("Fake Title2", "Fake Author2", "222222222");
//BooksStorage.addBook(b2);
//let b3 = new Book("Fake Title3", "Fake Author3", "333333333");
//BooksStorage.addBook(b3);
//BooksStorage.removeBook(b2.isbn);
//UI.displayBooks();
//UI.addBookToList(b1);
//UI.addBookToList(b2);

