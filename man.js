// ==================== CẤU HÌNH API TƯƠNG THÍCH LOCAL / GITHUB ====================
// Nếu chạy trên GitHub Pages (domain *.github.io) thì dùng file tĩnh ./data/products.json
const IS_GITHUB_PAGES = location.hostname.endsWith('github.io');
const OWNER = 'nguyenthanhloi100906-web'; // Tên user GitHub của bạn
const REPO = 'fontend';  // Tên repo của bạn chứa dữ liệu sản phẩm
const DB_REPO = 'dbjson'; // Repo chứa db.json

// URL để lấy dữ liệu sản phẩm từ GitHub hoặc từ JSON server khi chạy trên local
const PRODUCTS_URLS = IS_GITHUB_PAGES
  ? [
      `https://${OWNER}.github.io/${REPO}/data/products.json?v=${Date.now()}`,  // Lấy file JSON từ GitHub Pages
      `https://${OWNER}.github.io/${DB_REPO}/db.json?v=${Date.now()}`,           // Lấy file DB từ GitHub Pages
      `https://cdn.jsdelivr.net/gh/${OWNER}/${DB_REPO}/db.json?v=${Date.now()}`, // Sử dụng CDN để lấy DB từ GitHub
      `./data/products.json?v=${Date.now()}`                                     // Dữ liệu file tĩnh trong repo
    ]
  : ['http://localhost:3000/products'];  // URL khi chạy trên local với json-server

// Helper: tải toàn bộ danh sách sản phẩm
function fetchProducts() {
  return fetch(PRODUCTS_URLS[0])  // Lấy dữ liệu từ GitHub hoặc localhost
    .then(res => {
      if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
      return res.json();
    })
    .catch(error => {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      return [];
    });
}

// Helper: lấy 1 sản phẩm theo id (client-filter khi dùng file tĩnh)
function fetchProductById(id) {
  if (IS_GITHUB_PAGES) {
    return fetchProducts().then(list => list.find(p => String(p.id) === String(id)));
  }
  // Local json-server có endpoint /products/:id
  return fetch(`${PRODUCTS_URLS[0]}/${id}`).then(res => {
    if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
    return res.json();
  });
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
        <p>${this.price.toLocaleString()} đ</p>
      </div>
    `;
  }

  renderDetail() {
    return `
      <div class="product-detail">
        <img src="${this.image}" alt="${this.name}">
        <div class="info">
          <h2>${this.name}</h2>
          <p>Giá: ${this.price.toLocaleString()} đ</p>
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

// ==================== RENDER DANH SÁCH SẢN PHẨM ====================
function renderProduct(array, theDiv) {
  let html = "";
  array.forEach((data) => {
    const product = new Product(
      data.id, data.name, data.price, data.image, data.category, data.hot, data.description
    );
    html += product.render();
  });
  theDiv.innerHTML = html;
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

// ==================== KHỞI TẠO TRANG ====================
createHeader();
createFooter();
updateCartCount();

// Gọi render giỏ khi ở cart.html (không ảnh hưởng trang khác)
renderCartPage();
