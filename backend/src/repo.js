// All SQL lives here. ORDER BY comes from this fixed list and never from user
// input, and every value goes through query parameters, so there is no SQL
// injection path.

const SORTS = {
  'price-asc': 'price ASC, id ASC',
  'price-desc': 'price DESC, id ASC',
};

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    description: row.description,
    category: row.category,
    image: row.image,
    rating: { rate: Number(row.rating_rate), count: row.rating_count },
  };
}

function createRepo(pool) {
  return {
    async list({ category, sort } = {}) {
      const params = [];
      let sql = 'SELECT * FROM products';
      if (category) {
        params.push(category);
        sql += ' WHERE category = $1';
      }
      sql += ` ORDER BY ${SORTS[sort] || 'id ASC'}`;
      const { rows } = await pool.query(sql, params);
      return rows.map(mapRow);
    },

    async get(id) {
      const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return rows[0] ? mapRow(rows[0]) : null;
    },

    async categories() {
      const { rows } = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
      return rows.map((r) => r.category);
    },

    async ping() {
      await pool.query('SELECT 1');
    },
  };
}

module.exports = { createRepo, SORT_OPTIONS: Object.keys(SORTS) };
