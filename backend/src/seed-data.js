// Sample catalog. The shape matches what the React frontend already expects
// (title, price, description, category, image, rating). The category names are
// kept identical to the Fake Store API ("jewelery" spelling included), so the
// existing filter toolbar keeps working.

const img = (slug) => `https://picsum.photos/seed/${slug}/400/400`;

const products = [
  // men's clothing
  { title: 'Classic Cotton T-Shirt', price: 14.99, category: "men's clothing", image: img('tshirt'), rate: 4.2, count: 310, description: 'Soft everyday crew-neck t-shirt in 100% combed cotton.' },
  { title: 'Slim Fit Denim Jacket', price: 59.5, category: "men's clothing", image: img('denim-jacket'), rate: 4.4, count: 128, description: 'Mid-weight denim jacket with a slim cut and button front.' },
  { title: 'Lightweight Running Hoodie', price: 39.0, category: "men's clothing", image: img('hoodie'), rate: 4.1, count: 205, description: 'Breathable zip hoodie made for training and cool mornings.' },

  // women's clothing
  { title: 'Floral Summer Dress', price: 44.9, category: "women's clothing", image: img('summer-dress'), rate: 4.5, count: 176, description: 'Knee-length dress with a floral print and adjustable straps.' },
  { title: 'Wool Blend Cardigan', price: 52.0, category: "women's clothing", image: img('cardigan'), rate: 4.3, count: 94, description: 'Warm open-front cardigan in a soft wool blend.' },
  { title: 'High-Waist Yoga Leggings', price: 29.99, category: "women's clothing", image: img('leggings'), rate: 4.6, count: 412, description: 'Stretchy, squat-proof leggings with a hidden waistband pocket.' },

  // jewelery
  { title: 'Sterling Silver Pendant', price: 79.0, category: 'jewelery', image: img('pendant'), rate: 4.7, count: 63, description: 'Hand-finished sterling silver pendant on a 45 cm chain.' },
  { title: 'Gold-Plated Hoop Earrings', price: 34.5, category: 'jewelery', image: img('earrings'), rate: 4.0, count: 142, description: 'Lightweight hoops with a hypoallergenic gold plating.' },
  { title: 'Beaded Charm Bracelet', price: 22.0, category: 'jewelery', image: img('bracelet'), rate: 3.9, count: 88, description: 'Adjustable bracelet with glass beads and three charms.' },

  // electronics
  { title: 'Wireless Over-Ear Headphones', price: 89.99, category: 'electronics', image: img('headphones'), rate: 4.4, count: 521, description: 'Bluetooth headphones with noise reduction and 30-hour battery.' },
  { title: '1TB Portable SSD', price: 109.0, category: 'electronics', image: img('ssd'), rate: 4.8, count: 389, description: 'Pocket-sized USB-C solid state drive with fast transfers.' },
  { title: '27-inch IPS Monitor', price: 189.99, category: 'electronics', image: img('monitor'), rate: 4.3, count: 247, description: 'Full HD IPS monitor with thin bezels and a height-adjustable stand.' },
];

module.exports = { products };
