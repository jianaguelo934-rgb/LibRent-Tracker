/**
 * model.js — Library & Rental Tracker (boardingease style)
 * Plain state object + exported functions. Persists to localStorage.
 */

export const state = {
  books: [],
  rentals: [],
  expenses: [],
};

// ---------- Persistence ----------
const load = () => {
  try {
    state.books = JSON.parse(localStorage.getItem('lib_books') || '[]');
    state.rentals = JSON.parse(localStorage.getItem('lib_rentals') || '[]');
    state.expenses = JSON.parse(localStorage.getItem('lib_expenses') || '[]');
  } catch (e) {
    state.books = []; state.rentals = []; state.expenses = [];
  }
};

const save = () => {
  localStorage.setItem('lib_books', JSON.stringify(state.books));
  localStorage.setItem('lib_rentals', JSON.stringify(state.rentals));
  localStorage.setItem('lib_expenses', JSON.stringify(state.expenses));
};

const seed = () => {
  state.books = [
    { id: genId(), title: 'Noli Me Tangere', author: 'Jose Rizal', copies: 4, pricePerDay: 12.00 },
    { id: genId(), title: 'El Filibusterismo', author: 'Jose Rizal', copies: 3, pricePerDay: 12.00 },
    { id: genId(), title: 'The Little Prince', author: 'Antoine de Saint-Exupery', copies: 5, pricePerDay: 10.00 },
    { id: genId(), title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', copies: 2, pricePerDay: 18.00 },
    { id: genId(), title: 'The Alchemist', author: 'Paulo Coelho', copies: 3, pricePerDay: 15.00 },
  ];

  // Sample rentals
  const today = new Date().toISOString().slice(0, 10);
  state.rentals = [
    { id: genId(), bookId: state.books[0].id, customer: 'Juan Dela Cruz', days: 3, startDate: today, returned: false, returnDate: null, fee: 0 },
    { id: genId(), bookId: state.books[2].id, customer: 'Maria Santos', days: 2, startDate: today, returned: true, returnDate: today, fee: 2 * 10.00 },
  ];

  // Sample expense
  state.expenses = [
    { id: genId(), description: 'Shelf repair', amount: 10.00, date: today },
  ];

  save();
};

const genId = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);

load();
if (state.books.length === 0) seed();

// ---------- Books ----------
export const getBooks = () => [...state.books];
export const getBook = (id) => state.books.find(b => b.id === id) || null;

export const addBook = ({ title, author, copies, pricePerDay }) => {
  const book = { id: genId(), title, author, copies: Number(copies), pricePerDay: Number(pricePerDay) };
  state.books.push(book);
  save();
  return book;
};

export const deleteBook = (id) => {
  state.books = state.books.filter(b => b.id !== id);
  save();
};

export const updateBook = (id, { title, author, copies, pricePerDay }) => {
  const book = getBook(id);
  if (!book) return null;
  book.title = title;
  book.author = author;
  book.copies = Number(copies);
  book.pricePerDay = Number(pricePerDay);
  save();
  return book;
};

export const availableCopies = (bookId) => {
  const book = getBook(bookId);
  if (!book) return 0;
  const active = state.rentals.filter(r => r.bookId === bookId && !r.returned).length;
  return book.copies - active;
};

// ---------- Rentals ----------
export const getRentals = () => [...state.rentals];

export const rentBook = ({ bookId, customer, days, startDate }) => {
  if (availableCopies(bookId) <= 0) return null;
  const rental = { id: genId(), bookId, customer, days: Number(days), startDate, returned: false, returnDate: null, fee: 0 };
  state.rentals.push(rental);
  save();
  return rental;
};

export const returnBook = (id) => {
  const r = state.rentals.find(x => x.id === id);
  if (!r || r.returned) return null;
  const book = getBook(r.bookId);
  r.returned = true;
  r.returnDate = new Date().toISOString().slice(0, 10);
  r.fee = r.days * (book ? book.pricePerDay : 0);
  save();
  return r;
};

export const deleteRental = (id) => {
  state.rentals = state.rentals.filter(r => r.id !== id);
  save();
};

// ---------- Expenses ----------
export const getExpenses = () => [...state.expenses];

export const addExpense = ({ description, amount }) => {
  const e = { id: genId(), description, amount: Number(amount), date: new Date().toISOString().slice(0, 10) };
  state.expenses.push(e);
  save();
  return e;
};

export const deleteExpense = (id) => {
  state.expenses = state.expenses.filter(e => e.id !== id);
  save();
};

// ---------- Finance ----------
export const getFinance = () => {
  const income = state.rentals.filter(r => r.returned).reduce((s, r) => s + r.fee, 0);
  const expenseTotal = state.expenses.reduce((s, e) => s + e.amount, 0);
  return { income, expenses: expenseTotal, net: income - expenseTotal };
};

export const getStats = () => ({
  totalBooks: state.books.length,
  available: state.books.reduce((s, b) => s + availableCopies(b.id), 0),
  activeRentals: state.rentals.filter(r => !r.returned).length,
  returnedRentals: state.rentals.filter(r => r.returned).length,
});
