// ---------- مخازن البيانات الرئيسية للنظام ----------
let menuItems = [];     
let juiceItems = [];    
let users = [];         
let cart = [];          
let savedInvoices = []; // مخزن الفواتير الجديد

function generateId() { return Date.now() + '-' + Math.random().toString(36); }
function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => m==='&'?'&amp;': m==='<'?'&lt;':'&gt;'); }

// دوال الاستدعاء والحفظ باستخدام المحرك المحلي LocalStorage
function saveFoodToLocal() { localStorage.setItem('restaurant_food', JSON.stringify(menuItems)); }
function loadFoodFromLocal() { let data = localStorage.getItem('restaurant_food'); if(data) menuItems = JSON.parse(data); else seedSampleData(); }
function saveJuicesToLocal() { localStorage.setItem('restaurant_juices', JSON.stringify(juiceItems)); }
function loadJuicesFromLocal() { let data = localStorage.getItem('restaurant_juices'); if(data) juiceItems = JSON.parse(data); else seedJuiceData(); }
function saveUsersToLocal() { localStorage.setItem('restaurant_users', JSON.stringify(users)); }
function loadUsersFromLocal() { let data = localStorage.getItem('restaurant_users'); if(data) users = JSON.parse(data); else { users = [{ username: 'admin', password: '123' }]; saveUsersToLocal(); } }

// حفظ وتحميل الفواتير الصادرة من الـ LocalStorage
function saveInvoicesToLocal() { localStorage.setItem('restaurant_invoices', JSON.stringify(savedInvoices)); }
function loadInvoicesToLocal() { let data = localStorage.getItem('restaurant_invoices'); if(data) savedInvoices = JSON.parse(data); }

// زراعة البيانات التجريبية الأولية تلقائياً
function seedSampleData() {
  if(menuItems.length === 0) {
    menuItems.push({ id: generateId(), name: "كبسة دجاج", price: 45, description: "أرز بسمتي فاخر مع دجاج محمر", imageUrl: "images/kabasa.jpg" });
    menuItems.push({ id: generateId(), name: "مندي لحم", price: 65, description: "لحم بلدي طري مطبوخ على الطريقة التقليدية", imageUrl: "images/mande.jpg" });
    menuItems.push({ id: generateId(), name: "مشاوي مشكلة", price: 80, description: "أسياخ كباب وأوصال مع مقبلات صوص", imageUrl: "images/mshawe.jpg" });
    menuItems.push({ id: generateId(), name: "برجر السبئي لفاخر", price: 20, description: "شريحة لحم مشوية مع الجبن والسلطة المقرمشة", imageUrl: "images/purger.jpg" });
    menuItems.push({ id: generateId(), name: "بيتزا الخضار", price: 15, description: "عجينة إيطالية هشة مغطاة بالجبن والزيتون", imageUrl: "images/pizza.jpg" });
  }
}
function seedJuiceData() {
  if(juiceItems.length === 0) {
    juiceItems.push({ id: generateId(), name: "عصير برتقال طازج", price: 12, imageUrl: "images/orange.jpg" });
    juiceItems.push({ id: generateId(), name: "عصير مانجو طبيعي", price: 15, imageUrl: "images/mango.jpg" });
    juiceItems.push({ id: generateId(), name: "ليمون بالنعناع", price: 10, imageUrl: "images/lemon.jpg" });
    juiceItems.push({ id: generateId(), name: "عصير رمان مركز", price: 11, imageUrl: "images/roman.jpg" });
  }
}

// تبديل ظهور حقل الوصف في واجهة الإضافة العامة بناء على اختيار الصنف
function toggleAddFields() {
  const type = document.getElementById('addItemType').value;
  document.getElementById('dishDescRow').style.display = (type === 'juice') ? 'none' : 'block';
}

// تحديث قوائم الاختيار في واجهات الحذف والتعديل الموحدة
function refreshSelects() {
  refreshDeleteSelectData();
  refreshEditSelectData();
  refreshViewTable();
}

function refreshDeleteSelectData() {
  const deleteSelect = document.getElementById('deleteSelect');
  if(!deleteSelect) return;
  const type = document.getElementById('deleteItemType').value;
  deleteSelect.innerHTML = '';
  let items = (type === 'dish') ? menuItems : juiceItems;
  items.forEach(item => { let opt = document.createElement('option'); opt.value = item.id; opt.textContent = `${item.name} (${item.price} ريال)`; deleteSelect.appendChild(opt); });
}

function refreshEditSelectData() {
  const editSelect = document.getElementById('editSelect');
  if(!editSelect) return;
  const type = document.getElementById('editItemType').value;
  editSelect.innerHTML = '';
  let items = (type === 'dish') ? menuItems : juiceItems;
  items.forEach(item => { let opt = document.createElement('option'); opt.value = item.id; opt.textContent = `${item.name} (${item.price} ريال)`; editSelect.appendChild(opt); });
  if(editSelect.options.length) loadEditForm(editSelect.value);
  else clearEditFormFields();
}

function clearEditFormFields() {
  document.getElementById('editName').value = ''; document.getElementById('editPrice').value = '';
  document.getElementById('editDesc').value = ''; document.getElementById('editImage').value = '';
}

function loadEditForm(id) {
  let type = document.getElementById('editItemType').value;
  let item = (type === 'dish') ? menuItems.find(i => i.id === id) : juiceItems.find(i => i.id === id);
  document.getElementById('editDescRow').style.display = (type === 'juice') ? 'none' : 'block';
  if(item) { 
    document.getElementById('editName').value = item.name; 
    document.getElementById('editPrice').value = item.price; 
    document.getElementById('editDesc').value = item.description || ''; 
    document.getElementById('editImage').value = item.imageUrl || ''; 
  } 
}

// دالة الإضافة العامة المدمجة الذكية لطعام والعصائر بأيقونة واحدة
function addGeneralItem() { 
  let type = document.getElementById('addItemType').value;
  let name = document.getElementById('dishName').value.trim(); 
  let price = document.getElementById('dishPrice').value; 
  let desc = document.getElementById('dishDesc').value.trim(); 
  let image = document.getElementById('dishImage').value.trim(); 
  let alertBox = document.getElementById('validationAlert');

  if(!name || !price) { 
    alertBox.className = "alert-box alert-danger"; alertBox.innerHTML = '⚠️ خطأ في التحقق: يرجى إدخال اسم الصنف والسعر أولاً!';
    alertBox.style.display = 'block'; return; 
  } 

  alertBox.className = "alert-box alert-success"; alertBox.innerHTML = `✅ تم التحقق والاضافة بنجاح للصنف (${escapeHtml(name)}).`;
  alertBox.style.display = 'block';

  if(type === 'dish') {
    menuItems.push({ id: generateId(), name, price: parseFloat(price), description: desc || 'طبق شهي من السبئي', imageUrl: image || 'https://picsum.photos/id/30/100/100' });
    saveFoodToLocal();
  } else {
    juiceItems.push({ id: generateId(), name, price: parseFloat(price), imageUrl: image || 'https://picsum.photos/id/30/50/50' });
    saveJuicesToLocal();
  }
  
  document.getElementById('dishName').value = ''; document.getElementById('dishPrice').value = '';
  document.getElementById('dishDesc').value = ''; document.getElementById('dishImage').value = '';
  
  refreshSelects(); renderStoreProducts(); 
  setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
}

// دالة الحذف الموحدة
function deleteGeneralItem() { 
  let type = document.getElementById('deleteItemType').value;
  let select = document.getElementById('deleteSelect'); 
  if(select.options.length === 0) return; 
  let id = select.value; 
  if(type === 'dish') { menuItems = menuItems.filter(i=>i.id!==id); saveFoodToLocal(); } 
  else { juiceItems = juiceItems.filter(i=>i.id!==id); saveJuicesToLocal(); }
  refreshSelects(); renderStoreProducts();
  document.getElementById('deleteMessage').innerHTML = 'تم حذف العنصر بنجاح!';
  setTimeout(()=>document.getElementById('deleteMessage').innerHTML='', 3000);
}

// دالة التعديل الموحدة
function saveGeneralEdit() { 
  let type = document.getElementById('editItemType').value;
  let select = document.getElementById('editSelect'); 
  if(select.options.length === 0) return; 
  let id = select.value; 
  let targetList = (type === 'dish') ? menuItems : juiceItems;
  let idx = targetList.findIndex(i => i.id === id); 
  if(idx !== -1){ 
    let newName = document.getElementById('editName').value.trim(); if(newName) targetList[idx].name = newName; 
    let newPrice = document.getElementById('editPrice').value; if(newPrice) targetList[idx].price = parseFloat(newPrice); 
    if(type === 'dish') { let newDesc = document.getElementById('editDesc').value.trim(); if(newDesc) targetList[idx].description = newDesc; }
    let newImage = document.getElementById('editImage').value.trim(); if(newImage) targetList[idx].imageUrl = newImage; 
    if(type === 'dish') saveFoodToLocal(); else saveJuicesToLocal();
    refreshSelects(); renderStoreProducts();
    document.getElementById('editMessage').innerHTML = 'تم التعديل وحفظ البيانات الحالية!';
    setTimeout(()=>document.getElementById('editMessage').innerHTML='', 3000);
  } 
}

function refreshViewTable() { 
  let container = document.getElementById('viewTableContainer'); if(!container) return; 
  if(menuItems.length===0) { container.innerHTML='<p>لا توجد أطباق مسجلة</p>'; return; } 
  let html='<table><thead><tr><th>الصورة</th><th>اسم الطبق</th><th>السعر</th><th>الوصف والمكونات</th></tr></thead><tbody>'; 
  menuItems.forEach(item=>{ html+=`<tr><td><img class="small-img" src="${item.imageUrl||'https://picsum.photos/id/30/50/50'}" onerror="this.src='https://picsum.photos/id/30/50/50'"></td><td>${escapeHtml(item.name)}</td><td>${item.price} ر.س</td><td>${escapeHtml(item.description)}</td></tr>`; }); 
  container.innerHTML=html+'</tbody></table>'; 
}

function renderJuicesTable() { 
  let container = document.getElementById('juicesTableContainer'); if(!container) return; 
  if(juiceItems.length===0) { container.innerHTML='<p>لا توجد عصائر مسجلة</p>'; return; } 
  let html='<table><thead><tr><th>الصورة</th><th>اسم العصير</th><th>السعر الحالي</th></tr></thead><tbody>'; 
  juiceItems.forEach(item=>{ html+=`<tr><td><img class="small-img" src="${item.imageUrl||'https://picsum.photos/id/30/50/50'}" onerror="this.src='https://picsum.photos/id/30/50/50'"></td><td>${escapeHtml(item.name)}</td><td>${item.price} ر.س</td></tr>`; }); 
  container.innerHTML = html+'</tbody></table>'; 
}

// ---------- نظام السلة والمتجر الكامل ----------
function renderStoreProducts() {
  const container = document.getElementById('productsArea'); if(!container) return;
  let allProducts = [...menuItems.map(p => ({ ...p, type: 'طعام' })), ...juiceItems.map(p => ({ ...p, type: 'عصير' }))];
  if(allProducts.length === 0) { container.innerHTML = '<p>المتجر لا يحتوي على عناصر حالية</p>'; return; }
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1rem;">';
  allProducts.forEach(prod => {
    let imgSrc = prod.imageUrl && prod.imageUrl.trim() ? prod.imageUrl : 'https://picsum.photos/id/30/100/100';
    html += `
      <div class="product-card">
        <img class="product-img" src="${imgSrc}" onerror="this.src='https://picsum.photos/id/30/100/100'">
        <div class="product-info">
          <div><strong>${escapeHtml(prod.name)}</strong> <span style="font-size:0.75rem; color:gray;">(${prod.type})</span></div>
          <div class="product-price">${prod.price} ريال</div>
        </div>
        <button class="add-to-cart-btn" data-id="${prod.id}" data-name="${escapeHtml(prod.name)}" data-price="${prod.price}">➕ السلة</button>
      </div>`;
  });
  container.innerHTML = html + '</div>';
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.onclick = () => { addToCart(btn.getAttribute('data-id'), btn.getAttribute('data-name'), parseFloat(btn.getAttribute('data-price'))); };
  });
}

function addToCart(id, name, price) {
  let existing = cart.find(item => item.id === id);
  if(existing) existing.quantity++; else cart.push({ id, name, price, quantity: 1 });
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById('cartItemsList'); const cartTotalDiv = document.getElementById('cartTotal');
  if(!cartList) return;
  if(cart.length === 0) { cartList.innerHTML = '<div class="empty-cart">السلة فارغة حالياً</div>'; cartTotalDiv.innerHTML = ''; return; }
  let itemsHtml = ''; let total = 0;
  cart.forEach(item => {
    let itemTotal = item.price * item.quantity; total += itemTotal;
    itemsHtml += `
      <div class="cart-item">
        <div class="cart-item-info"><strong>${escapeHtml(item.name)}</strong><br>${item.price} ريال</div>
        <div class="cart-item-controls">
          <input type="number" min="1" value="${item.quantity}" onchange="updateCartQty('${item.id}', this.value)">
          <button class="btn" style="background:#e74c3c; padding:3px 8px;" onclick="removeFromCart('${item.id}')">🗑️</button>
        </div>
        <div>${itemTotal} ر.س</div>
      </div>`;
  });
  cartList.innerHTML = itemsHtml;
  cartTotalDiv.innerHTML = `الإجمالي النهائي: <strong>${total} ريال كاش</strong>`;
}

window.updateCartQty = function(id, qty) {
  let n = parseInt(qty); let item = cart.find(i=>i.id===id);
  if(item && n > 0) item.quantity = n; renderCart();
};
window.removeFromCart = function(id) { cart = cart.filter(i=>i.id!==id); renderCart(); };


// ---------- دالة عرض فواتير الـ LocalStorage بالتاريخ والوقت ----------
function renderSavedInvoices() {
  const container = document.getElementById('invoicesContainer');
  if (!container) return;
  if (savedInvoices.length === 0) {
    container.innerHTML = '<div class="print-area">📭 لا توجد فواتير صادرة ومحفوظة حالياً في الـ LocalStorage.</div>';
    return;
  }
  let html = '';
  savedInvoices.forEach((inv, index) => {
    html += `
      <div class="invoice-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap;">
          <strong>📄 فاتورة رقم: ${index + 1}</strong>
          <span style="font-size:0.85rem; color:gray;"><i class="fas fa-clock"></i> التاريخ: ${inv.date}</span>
        </div>
        <div style="padding-right: 1rem; font-size:0.95rem;">
    `;
    inv.items.forEach(item => {
      html += `<div>• ${escapeHtml(item.name)} [الكمية: ${item.quantity}] ← السعر: ${item.price * item.quantity} ريال</div>`;
    });
    html += `
        </div>
        <div style="margin-top:0.6rem; padding-top:0.5rem; border-top:1px dashed var(--border); font-weight:bold; color:var(--primary-dark);">
          💰 إجمالي المدفوع: ${inv.total} ريال يمني كاش
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}


// واجهات التنقل الأساسية
function showPage(pageId) {
  const pages = ['addPage','deletePage','editPage','viewPage','juicesPage','storePage','searchPage','aboutPage','invoicesPage'];
  pages.forEach(id => { let el = document.getElementById(id); if(el) el.classList.remove('active-page'); });
  
  // غلق القائمة الجانبية بشكل تلقائي ومريح عند الانتقال
  const sidebarNav = document.getElementById('sidebarNav');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  if(sidebarNav) sidebarNav.classList.remove('open');
  if(sidebarOverlay) sidebarOverlay.classList.remove('show');

  if(pageId === 'main') return;
  let target = document.getElementById(pageId+'Page'); if(target) target.classList.add('active-page');
  if(pageId === 'view') refreshViewTable();
  if(pageId === 'juices') renderJuicesTable();
  if(pageId === 'edit') refreshEditSelectData();
  if(pageId === 'delete') refreshDeleteSelectData();
  if(pageId === 'invoices') renderSavedInvoices();
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('themeBtn');
  if(themeBtn) {
    themeBtn.innerHTML = (theme === 'dark') ? '<i class="fas fa-sun" style="color: #f39c12;"></i>' : '<i class="fas fa-moon"></i>';
  }
}

// ربط الأحداث وتشغيلها عند تحميل المستند
document.addEventListener('DOMContentLoaded', () => {
  loadUsersFromLocal();
  loadInvoicesToLocal(); // تحميل الفواتير من الـ LocalStorage فور تشغيل الموقع
  
  // تفعيل فتح وإغلاق الـ Nav الجانبي المخصص
  const sidebarNav = document.getElementById('sidebarNav');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  if(document.getElementById('openSidebarBtn')) {
    document.getElementById('openSidebarBtn').onclick = () => { sidebarNav.classList.add('open'); sidebarOverlay.classList.add('show'); };
  }
  if(document.getElementById('closeSidebarBtn')) {
    document.getElementById('closeSidebarBtn').onclick = () => { sidebarNav.classList.remove('open'); sidebarOverlay.classList.remove('show'); };
  }
  if(sidebarOverlay) {
    sidebarOverlay.onclick = () => { sidebarNav.classList.remove('open'); sidebarOverlay.classList.remove('show'); };
  }

  // تفعيل محرك الوضع المظلم
  const currentTheme = localStorage.getItem('restaurant_theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if(document.getElementById('themeBtn')) {
    document.getElementById('themeBtn').onclick = () => {
      let theme = document.documentElement.getAttribute('data-theme');
      theme = (theme === 'dark') ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('restaurant_theme', theme);
      updateThemeIcon(theme);
    };
  }

  // ربط أزرار العمليات
  document.querySelectorAll('.op-card').forEach(card => { card.onclick = () => showPage(card.getAttribute('data-op')); });
  document.querySelectorAll('.back-home').forEach(btn => btn.onclick = () => showPage('main'));
  
  if(document.getElementById('submitAddBtn')) document.getElementById('submitAddBtn').onclick = addGeneralItem;
  if(document.getElementById('confirmDeleteBtn')) document.getElementById('confirmDeleteBtn').onclick = deleteGeneralItem;
  if(document.getElementById('saveEditBtn')) document.getElementById('saveEditBtn').onclick = saveGeneralEdit;
  if(document.getElementById('clearCartBtn')) document.getElementById('clearCartBtn').onclick = () => { cart = []; renderCart(); };
  
  // زر مسح سجل الفواتير بالكامل
  if(document.getElementById('clearInvoicesBtn')) {
    document.getElementById('clearInvoicesBtn').onclick = () => {
      if(confirm('هل أنت متأكد من مسح جميع الفواتير من التخزين المحلي نهائياً؟')) {
        savedInvoices = [];
        saveInvoicesToLocal();
        renderSavedInvoices();
      }
    };
  }

  if(document.getElementById('editSelect')) {
    document.getElementById('editSelect').onchange = function() { loadEditForm(this.value); };
  }

  // طباعة الفاتورة وحفظها الفوري بالتاريخ والوقت
  if(document.getElementById('checkoutBtn')) {
    document.getElementById('checkoutBtn').onclick = () => {
      if(cart.length === 0) { alert('السلة فارغة! اضغط على المنتجات أولاً للبيع'); return; }
      let total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      
      // توليد التاريخ والوقت الحالي بدقة باللغة العربية
      let now = new Date();
      let currentDateTime = now.toLocaleDateString('ar-YE') + ' ' + now.toLocaleTimeString('ar-YE');
      
      // حفظ كائن الفاتورة الجديد داخل المصفوفة والـ LocalStorage
      savedInvoices.push({
        id: generateId(),
        date: currentDateTime,
        items: [...cart],
        total: total
      });
      saveInvoicesToLocal();

      let invoice = `🛒 فاتورة شراء مطعم السبئي🧾\nالتاريخ: ${currentDateTime}\n----------------------------\n`;
      cart.forEach(i => { invoice += `${i.name} × ${i.quantity} = ${i.price * i.quantity} ريال\n`; });
      invoice += `----------------------------\n💰 المبلغ الصافي: ${total} ريال\n✨ تم حفظ الفاتورة بنجاح في سجل النظام المطور!`;
      
      alert(invoice); 
      cart = []; 
      renderCart();
    };
  }

  // تشغيل نظام البحث
  if(document.getElementById('doSearchBtn')) {
    document.getElementById('doSearchBtn').onclick = () => {
      let kw = document.getElementById('searchInput').value.trim().toLowerCase();
      let all = [...menuItems.map(p=>({...p, type:'طعام'})), ...juiceItems.map(p=>({...p, type:'عصير'}))];
      let res = all.filter(p=>p.name.toLowerCase().includes(kw));
      let html='<strong>🔍 نتائج البحث المطابقة:</strong><br>';
      if(res.length===0) html+='لا توجد نتائج مطابقة لعناصر القائمة الحالية.';
      else res.forEach(p=>{ html+=`<div style="margin:5px 0;"><i class="fas fa-arrow-left"></i> ${p.name} (${p.type}) - ${p.price} ريال</div>`; });
      document.getElementById('searchResult').innerHTML = html;
    };
  }

  // تسجيل الدخول والتحقق
  let loginMode = 'login';
  const loginWrapper = document.getElementById('loginWrapper');
  const appMain = document.getElementById('appMain');
  const toggleMsg = document.getElementById('toggleMsg');
  const actionBtn = document.getElementById('actionBtn');
  const loginMessageDiv = document.getElementById('loginMessage');

  if(toggleMsg) {
    toggleMsg.onclick = () => {
      let isLogin = (loginMode === 'login');
      loginMode = isLogin ? 'register' : 'login';
      document.getElementById('formTitle').innerText = isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول';
      document.getElementById('extraFields').style.display = isLogin ? 'block' : 'none';
      actionBtn.innerText = isLogin ? 'إنشاء حساب' : 'دخول';
      toggleMsg.innerText = isLogin ? 'لديك حساب بالفعل؟ سجل دخول' : 'ليس لديك حساب؟ أنشئ حساباً جديداً';
      loginMessageDiv.style.display = 'none';
    };
  }

  if(actionBtn) {
    actionBtn.onclick = () => {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      loginMessageDiv.style.display = 'block';

      if(loginMode === 'register') {
        const confirm = document.getElementById('confirmPassword').value;
        if(!username || !password) { loginMessageDiv.innerHTML = 'يرجى ملء كافة الحقول'; return; }
        if(password !== confirm) { loginMessageDiv.innerHTML = 'كلمة المرور غير متطابقة!'; return; }
        if(users.find(u => u.username === username)) { loginMessageDiv.innerHTML = 'اسم المستخدم مسجل مسبقاً!'; return; }
        users.push({ username, password }); saveUsersToLocal();
        loginMessageDiv.innerHTML = 'تم التسجيل بنجاح! يرجى تحويل الواجهة للدخول.';
      } else {
        if(users.find(u => u.username === username && u.password === password)) {
          loginWrapper.style.display = 'none'; appMain.style.display = 'block';
          loadFoodFromLocal(); loadJuicesFromLocal(); refreshSelects(); renderStoreProducts();
          showPage('main');
        } else {
          loginMessageDiv.innerHTML = 'بيانات الدخول المدخلة غير صحيحة!';
        }
      }
    };
  }

  if(document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').onclick = () => {
      loginWrapper.style.display = 'flex'; appMain.style.display = 'none';
      document.getElementById('username').value = ''; document.getElementById('password').value = '';
    };
  }
});
