import * as model from "./model.js";
import bookView from "./views/BookView.js";
import rentalView from "./views/RentalView.js";
import financeView from "./views/FinanceView.js";
import errorView from "./views/ErrorView.js";

// ---- Tab switching (simple UI glue) ----
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add("active");
  });
});

// ---- Controllers (pure glue: model -> views) ----
let bookSearch = '';
let rentalSearch = '';

const refreshController = () => {
  bookView.setAvailFn((id) => model.availableCopies(id));
  const books = model.getBooks().filter(b =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );
  bookView.render(books);
  bookView.populateBookSelect(model.getBooks(), (id) => model.availableCopies(id));

  const rentals = model.getRentals().map((r) => {
    const book = model.getBook(r.bookId);
    return { ...r, bookTitle: book ? book.title : "Unknown" };
  }).filter(r =>
    r.customer.toLowerCase().includes(rentalSearch.toLowerCase()) ||
    r.bookTitle.toLowerCase().includes(rentalSearch.toLowerCase())
  );
  rentalView.render(rentals);

  financeView.render(model.getExpenses());
  financeView.renderSummary({ ...model.getFinance(), count: model.getExpenses().length });
};

const addBookController = () => {
  const data = bookView.getFormData();
  if (!data.title || !data.author) {
    errorView.renderError(["Title and author are required."]);
    return;
  }
  errorView._clear();
  const heading = data.id ? 'Confirm Update Book' : 'Confirm Add Book';
  bookView.showBookConfirm(data, () => {
    if (data.id) model.updateBook(data.id, data);
    else model.addBook(data);
    bookView.resetForm();
    refreshController();
  }, heading);
};

const editBookController = (id) => {
  const book = model.getBook(id);
  if (book) bookView.fillForm(book);
};

const deleteBookController = (id) => {
  model.deleteBook(id);
  refreshController();
};

const rentBookController = () => {
  const data = rentalView.getFormData();
  if (!data.customer) {
    errorView.renderError(["Customer name is required."]);
    return;
  }
  if (!data.bookId || !data.days || !data.startDate) {
    errorView.renderError(["Book, days, and start date are required."]);
    return;
  }
  if (model.availableCopies(data.bookId) <= 0) {
    errorView.renderError(["No copies available for this book."]);
    return;
  }
  errorView._clear();
  const book = model.getBook(data.bookId);
  const fee = Number(data.days) * (book ? book.pricePerDay : 0);
  rentalView.showRentalConfirm(
    { customer: data.customer, bookTitle: book ? book.title : 'Unknown', days: data.days, startDate: data.startDate, fee },
    () => {
      model.rentBook(data);
      rentalView.resetForm();
      refreshController();
    }
  );
};

const returnBookController = (id) => {
  model.returnBook(id);
  refreshController();
};

const deleteRentalController = (id) => {
  model.deleteRental(id);
  refreshController();
};

const addExpenseController = () => {
  const data = financeView.getFormData();
  if (!data.description || !data.amount) {
    errorView.renderError(["Description and amount are required."]);
    return;
  }
  errorView._clear();
  model.addExpense(data);
  financeView.resetForm();
  refreshController();
};

const deleteExpenseController = (id) => {
  model.deleteExpense(id);
  refreshController();
};

// ---- Init ----
const init = () => {
  bookView.addHandlerSubmit(addBookController);
  bookView.addHandlerDelete(deleteBookController);
  bookView.addHandlerEdit(editBookController);
  bookView.addHandlerSearch((q) => { bookSearch = q; refreshController(); });

  rentalView.addHandlerSearch((q) => { rentalSearch = q; refreshController(); });

  rentalView.addHandlerSubmit(rentBookController);
  rentalView.addHandlerReturn(returnBookController);
  rentalView.addHandlerDelete(deleteRentalController);

  financeView.addHandlerSubmit(addExpenseController);
  financeView.addHandlerDelete(deleteExpenseController);

  rentalView.resetForm();
  refreshController();
};

init();
