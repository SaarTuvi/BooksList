let remoteBooks = [];
//Book Model Item
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
            
            fetch('../books.json').then(response => response.json()).then(data => {
                remoteBooks = data;
                resolve();
                });
        });
    }
}

class UI {
    //Add Item of book to table
    static addBookToList(book) {
        let listTableBody = document.querySelector("#books-list");
        let row = document.createElement("tr");
        row.innerHTML = `<td>${book.title}</td>  
                         <td>${book.author}</td>  
                         <td>${book.isbn}</td>`;
        if (book.isLocal === true) {
            row.innerHTML += `<td><a href="#" id="b-${book.isbn}" onclick = 'removeBook(this,${book.isbn});'>
            <span class="badge badge-pill badge-danger">X</span> </a></td><td>
            <a href='editBookV2.html' onclick='passBookToNextPage(this,${book.isbn});'>
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
    let alertString =
    'In this version the data from BOOKS.JS \r\nis being downloaded from server every 3 minutes'; 
    alert(alertString);
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
    e.preventDefault();

    let titleVal = document.querySelector('#title').value;
    let authorVal = document.querySelector('#author').value;
    let isbnVal = document.querySelector('#isbn').value;

    if (titleVal === '' || authorVal === '' || isbnVal === '') {
        alert('Please fill all inputs')
    }
    else {
        book = new Book(titleVal, authorVal, isbnVal, true);
        BooksStorage.addBookToStorage(book);
        UI.displayBooks();
        alert("Book Added");
        bookForm.reset();
    }
})


function removeBook(element, isbn) {
    BooksStorage.removeBookFromStorage(isbn)
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

