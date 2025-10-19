// ==================== CẤU HÌNH API TƯƠNG THÍCH LOCAL / GITHUB ====================
// Nhận biết khi chạy trên GitHub Pages (domain *.github.io)
const IS_GITHUB_PAGES = location.hostname.endsWith('github.io');

// Tên owner & repo của bạn
const OWNER   = 'nguyenthanhloi100906-web';
const REPO    = 'fontend';   // repo FE đang hiển thị web
const DB_REPO = 'dbjson';    // repo chứa db.json

// Khi chạy online (GitHub Pages):
// 1) Thử file tĩnh trong chính repo FE
// 2) Thử db.json từ repo dbjson trên GitHub Pages
// 3) Fallback CDN jsDelivr của repo dbjson
// 4) Thử lại đường dẫn tương đối
// Khi chạy local: dùng json-server
const PRODUCTS_URLS = IS_GITHUB_PAGES
  ? [
      `https://${OWNER}.github.io/${REPO}/data/products.json?v=${Date.now()}`,
      `https://${OWNER}.github.io/${DB_REPO}/db.json?v=${Date.now()}`,
      `https://cdn.jsdelivr.net/gh/${OWNER}/${DB_REPO}/db.json?v=${Date.now()}`,
      `./data/products.json?v=${Date.now()}`
    ]
  : ['http://localhost:3000/products'];


function normalizeProducts(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.products)) return json.products;
  return [];
}

// Thử fetch theo danh sách URL (để có fallback)
async function fetchFirst(urls) {
  let lastErr;
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
      const json = await res.json();
      console.log('[DEBUG] Loaded products from:', url);
      return json;
    } catch (err) {
      console.warn('[WARN] fetch failed:', err);
      lastErr = err;
    }
  }
  throw lastErr || new Error('Không thể tải dữ liệu sản phẩm');
}

// Helper: tải toàn bộ danh sách sản phẩm
async function fetchProducts() {
  try {
    const json = await fetchFirst(PRODUCTS_URLS);
    return normalizeProducts(json);
  } catch (err) {
    console.error('❌ fetchProducts lỗi:', err);
    throw err;
  }
}

// Helper: lấy 1 sản phẩm theo id (client-filter khi dùng file tĩnh)
async function fetchProductById(id) {
  if (IS_GITHUB_PAGES) {
    const list = await fetchProducts();
    return list.find(p => String(p.id) === String(id));
  }
  const res = await fetch(`${PRODUCTS_URLS[0]}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
  return res.json();
}

// ==================== CLASS SẢN PHẨM ====================
class Product {
  constructor(id, name, price, image, category, hot, description) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.category = category;
    this.hot = hot;
    this.description = description;
  }

  render() {
    return `
      <div class="product">
        <img src="${this.image}" alt="${this.name}">
        <a href="detail.html?id=${this.id}">
          <h3>${this.name}</h3>
        </a>
        <p>${Number(this.price).toLocaleString('vi-VN')} đ</p>
      </div>
    `;
  }

  renderDetail() {
    return `
      <div class="product-detail">
        <img src="${this.image}" alt="${this.name}">
        <div class="info">
          <h2>${this.name}</h2>
          <p>Giá: ${Number(this.price).toLocaleString('vi-VN')} đ</p>
          <span>${this.description}</span>
          <button class="add-to-cart" data-id="${this.id}">Thêm vào giỏ hàng</button>
        </div>
      </div>
    `;
  }
}

// ==================== GIỎ HÀNG ====================
class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.id == product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.save();
  }

  getTotalQuantity() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }
}

const cart = new Cart();

// ==================== HEADER DÙNG CHUNG ====================
function createHeader() {
  const header = document.createElement('header');
  header.innerHTML = `
    <div class="container header-top">
      <div class="logo">
        <a href="index.html">
          <img src="img/4.png" style="height:60px; vertical-align:middle;">
          <span>Shop Mobile</span>
        </a>
      </div>

      <div class="search-bar">
        <input type="text" placeholder="Tìm sản phẩm..." id="search-input">
        <button><i class="fas fa-search"></i></button>
      </div>

      <div class="header-icons">
        <a href="#"><i class="fas fa-phone"></i> 0123 456 789</a>
        <a href="admin.html"><i class="fas fa-user"></i></a>
        <a href="#"><i class="fas fa-heart"></i></a>
        <a href="cart.html" class="cart">
          <i class="fas fa-shopping-cart"></i>
          <span class="cart-count">0</span>
        </a>
      </div>
    </div>

    <nav class="navbar">
      <ul>
        <li><a href="index.html"><i class="fas fa-home"></i> Trang chủ</a></li>
        <li><a href="product.html"><i class="fas fa-box"></i> Sản phẩm</a></li>
        <li><a href="#"><i class="fas fa-tags"></i> Ưu đãi</a></li>
        <li><a href="#"><i class="fas fa-newspaper"></i> Tin tức</a></li>
        <li><a href="#"><i class="fas fa-envelope"></i> Liên hệ</a></li>
      </ul>
    </nav>
  `;
  document.body.prepend(header);
}

// ==================== FOOTER DÙNG CHUNG ====================
function createFooter() {
  const footer = document.createElement('footer');
  footer.classList.add('site-footer');
  footer.innerHTML = `
    <div class="container footer-content">
      <div class="footer-column">
        <h3><i class="fas fa-store"></i> Shop Mobile</h3>
        <p>Mang đến trải nghiệm mua sắm tiện lợi và an toàn.</p>
      </div>
      <div class="footer-column">
        <h3><i class="fas fa-headset"></i> Liên hệ</h3>
        <ul>
          <li><i class="fas fa-map-marker-alt"></i> 123 Đường ABC, Hà Nội</li>
          <li><i class="fas fa-phone"></i> 0123 456 789</li>
          <li><i class="fas fa-envelope"></i> support@shopmobile.com</li>
        </ul>
      </div>
      <div class="footer-column">
        <h3><i class="fas fa-share-alt"></i> Theo dõi</h3>
        <div class="social-icons">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 Shop Mobile. All rights reserved.</p>
    </div>
  `;
  document.body.appendChild(footer);
}

// ==================== CẬP NHẬT GIỎ HÀNG TRÊN HEADER ====================
function updateCartCount() {
  const badge = document.querySelector('.cart-count');
  if (badge) badge.textContent = cart.getTotalQuantity();
}

// ==================== THÊM VÀO GIỎ HÀNG ====================
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart')) {
    const id = e.target.getAttribute('data-id');
    fetchProductById(id)
      .then(data => {
        if (!data) throw new Error('Không tìm thấy sản phẩm');
        const product = new Product(
          data.id, data.name, data.price, data.image, data.category, data.hot, data.description
        );
        cart.addItem(product);
        updateCartCount();
        alert("✅ Đã thêm vào giỏ hàng!");
      })
      .catch(() => alert("❌ Lỗi thêm giỏ hàng"));
  }
});

// ==================== RENDER DANH SÁCH SẢN PHẨM ====================
function renderProduct(array, theDiv) {
  theDiv.innerHTML = array.map((data) => {
    const product = new Product(
      data.id, data.name, data.price, data.image, data.category, data.hot, data.description
    );
    return product.render();
  }).join('');
}

// ==================== TRANG INDEX ====================
const hotDiv = document.getElementById('hot');
const menDiv = document.getElementById('men');
const womenDiv = document.getElementById('women');

if (hotDiv) {
  fetchProducts()
    .then(data => {
      const dataHot = data.filter(p => p.hot === true);
      const dataPhone = data.filter(p => p.category === "điện thoại");
      const dataLaptop = data.filter(p => p.category === "laptop");
      renderProduct(dataHot, hotDiv);
      if (menDiv) renderProduct(dataPhone, menDiv);
      if (womenDiv) renderProduct(dataLaptop, womenDiv);
    })
    .catch(err => console.error('❌ Lỗi load sản phẩm:', err));
}

// ==================== TRANG SẢN PHẨM ====================
const productAll = document.getElementById('all-product');
const searchInput = document.getElementById('search-input');
const sortPrice = document.getElementById('sort-price');
let allProductsData = [];

if (productAll) {
  fetchProducts()
    .then(data => {
      allProductsData = data;
      renderProduct(data, productAll);
    })
    .catch(err => console.error('❌ Lỗi load sản phẩm:', err));

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const filteredProducts = allProductsData.filter(
        p => p.name.toLowerCase().includes(keyword)
      );
      renderProduct(filteredProducts, productAll);
    });
  }

  if (sortPrice) {
    sortPrice.addEventListener('change', (e) => {
      if (e.target.value === "asc") {
        allProductsData.sort((a, b) => a.price - b.price);
      } else if (e.target.value === "desc") {
        allProductsData.sort((a, b) => b.price - a.price);
      }
      renderProduct(allProductsData, productAll);
    });
  }
}

// ==================== TRANG CHI TIẾT ====================
const productDetailDiv = document.getElementById('detail-product');
if (productDetailDiv) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (id) {
    fetchProductById(id)
      .then(data => {
        if (!data) throw new Error("Không tìm thấy sản phẩm");
        const product = new Product(
          data.id, data.name, data.price, data.image, data.category, data.hot, data.description
        );
        productDetailDiv.innerHTML = product.renderDetail();
      })
      .catch(err => {
        productDetailDiv.innerHTML = `<p style="color:red;">${err.message || 'Lỗi tải sản phẩm'}</p>`;
      });
  } else {
    productDetailDiv.innerHTML = `<p style="color:red;">❌ Không có ID sản phẩm</p>`;
  }
}

/* ==================== TRANG GIỎ HÀNG (cart.html) ==================== */
function formatVND(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('vi-VN') + ' đ';
}

function renderCartPage() {
  const listEl = document.getElementById('cart-items');
  const summaryEl = document.getElementById('cart-summary');
  if (!listEl || !summaryEl) return;

  if (!cart.items.length) {
    listEl.innerHTML = `
      <div class="empty-cart" style="padding:18px;border:1px dashed #ddd;border-radius:10px;">
        <p>🛒 Giỏ hàng của bạn đang trống.</p>
        <p><a href="product.html">Tiếp tục mua sắm →</a></p>
      </div>
    `;
    summaryEl.innerHTML = `
      <div class="cart-summary-box" style="margin-top:16px;padding:14px;border:1px solid #eee;border-radius:10px;">
        <strong>Tổng tiền: 0 đ</strong>
      </div>
    `;
    return;
  }

  listEl.innerHTML = cart.items.map(item => `
    <div class="cart-item" data-id="${item.id}" style="display:flex;gap:14px;align-items:center;padding:12px 0;border-bottom:1px solid #eee;">
      <img src="${item.image}" alt="${item.name}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;">
      <div style="flex:1;">
        <div style="font-weight:600;margin-bottom:6px;">${item.name}</div>
        <div>Đơn giá: <strong>${formatVND(item.price)}</strong></div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
          <button class="qty-decrease" aria-label="Giảm">-</button>
          <input class="qty-input" type="number" min="1" value="${item.quantity}" style="width:64px;text-align:center;">
          <button class="qty-increase" aria-label="Tăng">+</button>
        </div>
      </div>
      <div style="text-align:right;">
        <div>Tạm tính</div>
        <div style="font-weight:700;">${formatVND(Number(item.price) * Number(item.quantity))}</div>
        <button class="remove-item" style="margin-top:10px;color:#c00;">Xóa</button>
      </div>
    </div>
  `).join('');

  const total = cart.items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
  summaryEl.innerHTML = `
    <div class="cart-summary-box" style="margin-top:16px;padding:14px;border:1px solid #eee;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
      <strong style="font-size:18px;">Tổng tiền: <span id="cart-total">${formatVND(total)}</span></strong>
      <div style="display:flex;gap:8px;">
        <button id="clear-cart">Xóa giỏ hàng</button>
        <a href="checkout.html" class="btn">Thanh toán</a>
      </div>
    </div>
  `;
}

// Click: tăng/giảm/xóa từng sản phẩm + xóa toàn bộ
document.addEventListener('click', (e) => {
  const itemRow = e.target.closest('.cart-item');
  if (itemRow) {
    const id = String(itemRow.getAttribute('data-id'));
    const item = cart.items.find(x => String(x.id) === id);
    if (!item) return;

    if (e.target.classList.contains('qty-increase')) {
      item.quantity++;
      cart.save(); updateCartCount(); renderCartPage();
      return;
    }
    if (e.target.classList.contains('qty-decrease')) {
      item.quantity = Math.max(1, Number(item.quantity) - 1);
      cart.save(); updateCartCount(); renderCartPage();
      return;
    }
    if (e.target.classList.contains('remove-item')) {
      if (confirm('Xóa sản phẩm này khỏi giỏ?')) {
        cart.items = cart.items.filter(x => String(x.id) !== id);
        cart.save(); updateCartCount(); renderCartPage();
      }
      return;
    }
  }

  if (e.target.id === 'clear-cart') {
    if (confirm('Bạn muốn xóa toàn bộ giỏ hàng?')) {
      cart.items = [];
      cart.save(); updateCartCount(); renderCartPage();
    }
  }
});

// Change: nhập số lượng bằng input
document.addEventListener('change', (e) => {
  if (!e.target.classList.contains('qty-input')) return;
  const row = e.target.closest('.cart-item');
  if (!row) return;

  const id = String(row.getAttribute('data-id'));
  const item = cart.items.find(x => String(x.id) === id);
  if (!item) return;

  const val = Math.max(1, parseInt(e.target.value || '1', 10));
  item.quantity = val;
  cart.save(); updateCartCount(); renderCartPage();
});

// ==================== KHỞI TẠO TRANG ====================
createHeader();
createFooter();
updateCartCount();
renderCartPage(); // chỉ hiển thị khi ở cart.html

////////////////////////////////////////////////////////////////
// ============= PHẦN ADMIN - QUẢN LÝ SẢN PHẨM =============== //
////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
  const adminTable = document.getElementById('admin-product-list');
  const adminForm = document.getElementById('admin-form');
  const adminName = document.getElementById('admin-name');
  const adminPrice = document.getElementById('admin-price');
  const adminImage = document.getElementById('admin-image');
  const adminCategory = document.getElementById('admin-category');
  const adminHot = document.getElementById('admin-hot');
  const adminDescription = document.getElementById('admin-description');

  const productModal = document.getElementById('product-modal');
  const openModalBtn = document.getElementById('open-add-product-modal');
  const closeModalBtn = document.getElementById('close-product-modal');

  // ⚠️ GitHub Pages KHÔNG thể POST/PUT/DELETE — chỉ hiển thị (GET)
  function renderAdminProducts() {
    fetchProducts()
      .then(products => {
        if (!adminTable) return;
        adminTable.innerHTML = products.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${Number(p.price).toLocaleString('vi-VN')} đ</td>
            <td><img src="${p.image}" style="height:50px"></td>
            <td>${p.category}</td>
            <td>${p.hot ? '✅' : '❌'}</td>
            <td style="max-width:200px;">${p.description}</td>
            <td>
              <button class="edit-product" data-id="${p.id}" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-product" data-id="${p.id}" title="Xóa">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('');
      })
      .catch(err => console.error('❌ Lỗi load sản phẩm:', err));
  }

  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      alert('Chức năng thêm/sửa/xóa không khả dụng trên GitHub Pages (static).');
    });
  }
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (productModal) productModal.style.display = 'none';
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.classList.contains('delete-product') || btn.classList.contains('edit-product')) {
      alert('Chức năng thêm/sửa/xóa không khả dụng trên GitHub Pages (static).');
    }
  });

  if (adminTable) renderAdminProducts();
});
