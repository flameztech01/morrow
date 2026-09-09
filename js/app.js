const products = [
  { id: 'mug', name: 'Daily ritual mug', category: 'home', type: 'Stoneware / 12 oz', price: 28, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85', description: 'A generous, hand-feeling mug for the first coffee and the last tea. Finished in a soft oat glaze.' },
  { id: 'notebook', name: 'The everyday notebook', category: 'desk', type: 'Recycled paper / A5', price: 18, badge: 'New', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85', description: 'A quiet place for bright ideas, loose thoughts, and lists you actually want to keep.' },
  { id: 'lamp', name: 'Soft light table lamp', category: 'home', type: 'Powder-coated steel', price: 96, badge: '', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85', description: 'A small pool of light for late reading, early mornings, and everything in between.' },
  { id: 'tray', name: 'Catch-all tray', category: 'desk', type: 'Solid oak / 8 × 5 in', price: 34, badge: '', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85', description: 'A home for the little things that tend to wander. Made from warm, tactile oak.' },
  { id: 'vase', name: 'Sunday bud vase', category: 'home', type: 'Mouth-blown glass', price: 42, badge: 'New', image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=900&q=85', description: 'One stem is enough. A simple glass vessel with a little presence.' },
  { id: 'pen', name: 'Good idea pen', category: 'desk', type: 'Brass / black ink', price: 16, badge: '', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=85', description: 'A weighty, satisfying pen for thoughts worth putting down.' }
];

const getCart = () => JSON.parse(localStorage.getItem('morrow-cart') || '[]');
const setCart = cart => { localStorage.setItem('morrow-cart', JSON.stringify(cart)); updateCartCount(); };
const money = value => `$${value.toFixed(2)}`;

function updateCartCount() {
  const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(count => { count.textContent = total; });
}

function productCard(product) {
  return `<article class="product-card">
    <a href="product.html?id=${product.id}">
      <div class="product-image">${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}<img src="${product.image}" alt="${product.name}"></div>
      <div class="product-info"><div><p class="product-name">${product.name}</p><p class="product-meta">${product.type}</p></div><p class="product-price">${money(product.price)}</p></div>
    </a>
  </article>`;
}

function renderProducts(target, list) { if (target) target.innerHTML = list.map(productCard).join(''); }

function setupShop() {
  const grid = document.querySelector('[data-shop-grid]');
  if (!grid) return;
  const filters = document.querySelectorAll('[data-filter]');
  const params = new URLSearchParams(location.search);
  let current = params.get('category') || 'all';
  const refresh = () => {
    filters.forEach(filter => filter.classList.toggle('active', filter.dataset.filter === current));
    renderProducts(grid, current === 'all' ? products : products.filter(product => product.category === current));
    const count = document.querySelector('[data-result-count]');
    if (count) count.textContent = `${(current === 'all' ? products : products.filter(product => product.category === current)).length} objects`;
  };
  filters.forEach(filter => filter.addEventListener('click', () => { current = filter.dataset.filter; refresh(); }));
  refresh();
}

function setupProduct() {
  const target = document.querySelector('[data-product-detail]');
  if (!target) return;
  const product = products.find(item => item.id === new URLSearchParams(location.search).get('id')) || products[0];
  document.title = `${product.name} — Morrow`;
  target.innerHTML = `<div class="product-gallery"><img src="${product.image}" alt="${product.name}"><img src="${product.image}" alt="${product.name} detail" style="filter: saturate(.7) brightness(1.08)"></div>
    <div class="detail-info"><p class="eyebrow">${product.category} / Morrow objects</p><h1>${product.name}</h1><p class="detail-price">${money(product.price)}</p><p class="detail-description">${product.description}</p><form class="detail-form" data-add-form><div class="quantity-row"><span class="detail-label">Quantity</span><div class="quantity"><button type="button" data-quantity-minus aria-label="Decrease quantity">−</button><input value="1" inputmode="numeric" aria-label="Quantity"><button type="button" data-quantity-plus aria-label="Increase quantity">+</button></div></div><button class="button button-dark add-button" type="submit">Add to bag <span>↗</span></button></form><div class="details-note">Free shipping over $75 · Ships in 1–2 business days</div></div>`;
  const input = target.querySelector('input');
  target.querySelector('[data-quantity-minus]').addEventListener('click', () => { input.value = Math.max(1, Number(input.value) - 1); });
  target.querySelector('[data-quantity-plus]').addEventListener('click', () => { input.value = Number(input.value) + 1; });
  target.querySelector('[data-add-form]').addEventListener('submit', event => { event.preventDefault(); const cart = getCart(); const existing = cart.find(item => item.id === product.id); if (existing) existing.quantity += Number(input.value); else cart.push({ id: product.id, quantity: Number(input.value) }); setCart(cart); const button = event.target.querySelector('button[type="submit"]'); button.innerHTML = 'Added to bag ✓'; setTimeout(() => { button.innerHTML = 'Add to bag <span>↗</span>'; }, 1500); });
}

function setupCheckout() {
  const target = document.querySelector('[data-order-items]');
  if (!target) return;
  const cart = getCart();
  if (!cart.length) { target.innerHTML = '<p class="detail-description">Your bag is waiting for something good.</p><a class="button button-dark" href="shop.html">Browse objects <span>↗</span></a>'; return; }
  const items = cart.map(item => ({ ...products.find(product => product.id === item.id), quantity: item.quantity }));
  target.innerHTML = items.map(item => `<div class="summary-item"><img src="${item.image}" alt="${item.name}"><div><p>${item.name}</p><small>Qty ${item.quantity}</small></div><span class="product-price">${money(item.price * item.quantity)}</span></div>`).join('');
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector('[data-total]').textContent = money(total);
  document.querySelector('[data-checkout-form]').addEventListener('submit', event => { event.preventDefault(); event.target.innerHTML = '<div class="details-note">Order received. Thanks for choosing a slower way to shop.</div>'; localStorage.removeItem('morrow-cart'); updateCartCount(); });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderProducts(document.querySelector('[data-featured-products]'), products.slice(0, 4));
  setupShop();
  setupProduct();
  setupCheckout();
  document.querySelectorAll('.newsletter-form').forEach(form => form.addEventListener('submit', event => { event.preventDefault(); form.querySelector('.form-message').textContent = 'You are on the list. See you Sunday.'; form.querySelector('input').value = ''; }));
});
