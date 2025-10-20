// ==================== CẤU HÌNH API TƯƠNG THÍCH LOCAL / GITHUB ====================
const IS_GITHUB_PAGES = location.hostname.endsWith('github.io');
const OWNER = 'nguyenthanhloi100906-web';
const REPO = 'fontend';  
const DB_REPO = 'dbjson';    

const PRODUCTS_URLS = IS_GITHUB_PAGES
  ? [
      `https://${OWNER}.github.io/${REPO}/data/products.json?v=${Date.now()}`,
      `https://${OWNER}.github.io/${DB_REPO}/db.json?v=${Date.now()}`,
      `https://cdn.jsdelivr.net/gh/${OWNER}/${DB_REPO}/db.json?v=${Date.now()}`,
      `./data/products.json?v=${Date.now()}`
    ]
  : ['http://localhost:3000/products'];  

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

// ==================== FETCH DỮ LIỆU ====================
async function fetchProducts() {
  try {
    const response = await fetch(PRODUCTS_URLS[0]);
    const json = await response.json();
    return json;
  } catch (err) {
    console.error('❌ fetchProducts lỗi:', err);
    throw err;
  }
}

// ==================== RENDER DANH SÁCH SẢN PHẨM ====================
function renderProduct(array, theDiv) {
  theDiv.innerHTML = array.map((data) => {
    const product = new Product(
      data.id, data.name, data.price, data.image, data.category, data.hot, data.description
    );
    return product.render();
  }).join('');
}

// ==================== TRANG ADMIN ====================
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

  async function addProduct(product) {
    const res = await fetch(PRODUCTS_URLS[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  }

  async function updateProduct(id, product) {
    const res = await fetch(`${PRODUCTS_URLS[0]}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  }

  async function deleteProduct(id) {
    const res = await fetch(`${PRODUCTS_URLS[0]}/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }

  async function renderAdminProducts() {
    try {
      const res = await fetch(PRODUCTS_URLS[0]);
      const products = await res.json();
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
      addEventListenersForAdminActions(products);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách sản phẩm:", err);
    }
  }

  function addEventListenersForAdminActions(products) {
    document.querySelectorAll('.edit-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('button').getAttribute('data-id');
        const product = products.find(p => p.id == id);
        fillAdminFormWithProductData(product);
        showUpdateForm(product);
      });
    });

    document.querySelectorAll('.delete-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('button').getAttribute('data-id');
        deleteProduct(id)
          .then(() => {
            alert("✅ Xóa sản phẩm thành công!");
            renderAdminProducts();
          })
          .catch(() => alert("❌ Lỗi xóa sản phẩm"));
      });
    });
  }

  function fillAdminFormWithProductData(product) {
    adminName.value = product.name;
    adminPrice.value = product.price;
    adminImage.value = product.image;
    adminCategory.value = product.category;
    adminHot.checked = product.hot;
    adminDescription.value = product.description;
    document.getElementById('product-id').value = product.id;
  }

  function showUpdateForm(product) {
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('update-btn').style.display = 'inline-block';
    productModal.style.display = 'block';
  }

  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      productModal.style.display = 'block';
      adminForm.reset();
      document.getElementById('product-id').value = '';
      document.getElementById('save-btn').style.display = 'inline-block';
      document.getElementById('update-btn').style.display = 'none';
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      productModal.style.display = 'none';
    });
  }

  adminForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const product = {
      name: adminName.value,
      price: adminPrice.value,
      image: adminImage.value,
      category: adminCategory.value,
      hot: adminHot.checked,
      description: adminDescription.value
    };

    if (id) {
      updateProduct(id, product)
        .then(() => {
          alert("✅ Sửa sản phẩm thành công!");
          renderAdminProducts();
          productModal.style.display = 'none';
        })
        .catch(err => alert("❌ Lỗi cập nhật sản phẩm"));
    } else {
      addProduct(product)
        .then(() => {
          alert("✅ Thêm sản phẩm thành công!");
          renderAdminProducts();
          productModal.style.display = 'none';
        })
        .catch(err => alert("❌ Lỗi thêm sản phẩm"));
    }
  });

  renderAdminProducts();
});
