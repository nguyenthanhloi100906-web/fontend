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

// ==================== THÊM VÀO GIỎ HÀNG ====================
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart')) {
    const id = e.target.getAttribute('data-id');
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json())
      .then(data => {
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
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(data => {
      const dataHot = data.filter(p => p.hot === true);
      const dataPhone = data.filter(p => p.category === "điện thoại");
      const dataLaptop = data.filter(p => p.category === "laptop");
      renderProduct(dataHot, hotDiv);
      if (menDiv) renderProduct(dataPhone, menDiv);
      if (womenDiv) renderProduct(dataLaptop, womenDiv);
    });
}

// ==================== TRANG SẢN PHẨM ====================
const productAll = document.getElementById('all-product');
const searchInput = document.getElementById('search-input');
const sortPrice = document.getElementById('sort-price');
let allProductsData = [];

if (productAll) {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(data => {
      allProductsData = data;
      renderProduct(data, productAll);
    });

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
    fetch(`http://localhost:3000/products/${id}`)
      .then(response => {
        if (!response.ok) throw new Error("Không tìm thấy sản phẩm");
        return response.json();
      })
      .then(data => {
        const product = new Product(
          data.id, data.name, data.price, data.image, data.category, data.hot, data.description
        );
        productDetailDiv.innerHTML = product.renderDetail();
      })
      .catch(err => {
        productDetailDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
      });
  } else {
    productDetailDiv.innerHTML = `<p style="color:red;">❌ Không có ID sản phẩm</p>`;
  }
}

/* ==================== TRANG GIỎ HÀNG (cart.html) ====================
   ✅ PHẦN THÊM MỚI: chỉ hiển thị & thao tác giỏ hàng; KHÔNG ảnh hưởng trang khác */
function formatVND(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('vi-VN') + ' đ';
}

function renderCartPage() {
  const listEl = document.getElementById('cart-items');
  const summaryEl = document.getElementById('cart-summary');
  if (!listEl || !summaryEl) return; // Không phải cart.html thì bỏ qua

  // Giỏ trống
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

  // Danh sách item
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

  // Tổng tiền
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
// Gọi render giỏ khi ở cart.html (không ảnh hưởng trang khác)
renderCartPage();

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

  const API_URL = 'http://localhost:3000/products';
  let editingId = null;

  // ======================= HIỂN THỊ DANH SÁCH =======================
  function renderAdminProducts() {
    fetch(API_URL)
      .then(res => res.json())
      .then(products => {
        adminTable.innerHTML = products.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${Number(p.price).toLocaleString()} đ</td>
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

  // ======================= MỞ / ĐÓNG MODAL =======================
  openModalBtn.addEventListener('click', () => {
    editingId = null;
    adminForm.reset();
    productModal.style.display = 'block';
  });

  closeModalBtn.addEventListener('click', () => {
    productModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === productModal) {
      productModal.style.display = 'none';
    }
  });

  // ======================= SUBMIT FORM =======================
  adminForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newProduct = {
      name: adminName.value.trim(),
      price: Number(adminPrice.value),
      image: adminImage.value.trim(),
      category: adminCategory.value.trim(),
      hot: adminHot.checked,
      description: adminDescription.value.trim()
    };
    if (!newProduct.name || !newProduct.price || !newProduct.image || !newProduct.category) {
      alert('❌ Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (editingId !== null) {
      fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, id: editingId })
      })
        .then(res => res.json())
        .then(() => {
          alert('✅ Cập nhật sản phẩm thành công!');
          adminForm.reset();
          productModal.style.display = 'none';
          editingId = null;
          renderAdminProducts();
        })
        .catch(err => console.error('❌ Lỗi cập nhật sản phẩm:', err));
    } else {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })
        .then(res => res.json())
        .then(() => {
          alert('✅ Thêm sản phẩm thành công!');
          adminForm.reset();
          productModal.style.display = 'none';
          renderAdminProducts();
        })
        .catch(err => console.error('❌ Lỗi thêm sản phẩm:', err));
    }
  });

  // ======================= XÓA & SỬA =======================
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = parseInt(btn.getAttribute('data-id'));
    if (!id) return;

    if (btn.classList.contains('delete-product')) {
      if (confirm('🗑️ Bạn có chắc muốn xóa sản phẩm này?')) {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
          .then(() => {
            alert('🗑️ Đã xóa sản phẩm!');
            renderAdminProducts();
          })
          .catch(err => console.error('❌ Lỗi xóa sản phẩm:', err));
      }
    }

    if (btn.classList.contains('edit-product')) {
      fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(data => {
          if (!data) {
            alert('❌ Không tìm thấy sản phẩm!');
            return;
          }
          editingId = data.id;
          adminName.value = data.name;
          adminPrice.value = data.price;
          adminImage.value = data.image;
          adminCategory.value = data.category;
          adminHot.checked = data.hot;
          adminDescription.value = data.description;
          productModal.style.display = 'block';
        })
        .catch(err => console.error('❌ Lỗi lấy sản phẩm để sửa:', err));
    }
  });

  // ======================= LOAD LẦN ĐẦU =======================
  if (adminTable) renderAdminProducts();
});
