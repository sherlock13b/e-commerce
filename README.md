# 🛒 Dynamic Product Catalog

A responsive product catalog built with **React**, **TypeScript**, and **Axios**. The application fetches product data from the Fake Store API and displays it in a clean, responsive grid layout. Users can filter products by category and sort them by price.

This project was built to practice working with API integration, React Hooks, TypeScript, component-based architecture, and responsive layouts using CSS Grid and Flexbox.

---

## 🚀 Features

* Fetches live product data from the Fake Store API
* Filter products by category
* Sort products by price (Low to High / High to Low)
* Responsive layout for desktop, tablet, and mobile devices
* Built with reusable React components
* Strong type safety using TypeScript

---

## 🛠️ Tech Stack

* React
* TypeScript
* Axios
* CSS3 (Grid & Flexbox)
* Fake Store API

---

## 📁 Project Structure

```
src/
├── components/
│   ├── FilterToolbar.tsx
│   └── ProductCard.tsx
├── types/
│   └── index.ts
├── App.tsx
├── App.css
└── index.tsx
```

---

## 💡 Implementation Details

### Responsive Grid Layout

The product list uses **CSS Grid** to automatically adjust the number of columns based on the available screen width.

```css
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 30px;
}
```

This approach creates a responsive layout without writing multiple media queries.

### Consistent Card Layout

Each product card is built using **Flexbox**, allowing the price section to stay aligned at the bottom even when product descriptions have different lengths.

```css
.price-tag {
  margin-top: auto;
}
```

This keeps all cards visually aligned and improves the overall user experience.

---

## ▶️ Getting Started

Clone the repository:

```bash
git clone https://github.com/sherlock13b/e-commerce.git
```

Navigate to the project folder:

```bash
cd your-repository
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The application will run locally at:

```
http://localhost:3000
```

---

## 📸 Screenshot


```
```
<img width="1902" height="908" alt="image" src="https://github.com/user-attachments/assets/01a516f2-df5c-4ad8-a49b-84900f94d403" />

---

## 🎯 Future Improvements

* Add product search functionality
* Add pagination or infinite scrolling
* Add product details page
* Implement shopping cart functionality
* Add loading skeletons and improved error handling

---

## 📄 License

This project is available for learning and personal use.
