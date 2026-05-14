const products = [
    { id: 1, name: "Корм для собак 'Дружок'", category: "Корм", price: 1200, emoji: "🍖", desc: "2 кг, мясо+овощи" },
    { id: 2, name: "Корм для кошек 'Мурка'", category: "Корм", price: 950, emoji: "🐟", desc: "1.5 кг, с лососем" },
    { id: 3, name: "Мяч пищащий", category: "Игрушки", price: 250, emoji: "⚽", desc: "Резиновый, со звуком" },
    { id: 4, name: "Игрушка-мышка", category: "Игрушки", price: 150, emoji: "🐭", desc: "Для кошек, с кошачьей мятой" },
    { id: 5, name: "Шлейка для собак", category: "Аксессуары", price: 890, emoji: "🎗️", desc: "Регулируемая, размер M" },
    { id: 6, name: "Ошейник светящийся", category: "Аксессуары", price: 650, emoji: "💡", desc: "Светодиодный, зарядка" },
    { id: 7, name: "Лежанка-корзинка", category: "Лежанки", price: 2100, emoji: "🧺", desc: "Для кошек и собак до 5 кг" },
    { id: 8, name: "Ортопедическая лежанка", category: "Лежанки", price: 3500, emoji: "🛌", desc: "Для пожилых собак, L" },
    { id: 9, name: "Сухой корм для хомяков", category: "Корм", price: 380, emoji: "🌾", desc: "500 г, с зёрнами" },
    { id: 10, name: "Канатка для собаки", category: "Игрушки", price: 320, emoji: "🪢", desc: "Для активных игр" }
];

let cart = [];

const catalogDiv = document.getElementById('catalog');
const cartModal = document.getElementById('cartModal');
const cartCountSpan = document.getElementById('cartCount');
const cartItemsDiv = document.getElementById('cartItems');
const cartTotalSpan = document.getElementById('cartTotal');

let currentCategory = "all";
let searchQuery = "";

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function renderProducts() {
    let filtered = [...products];
    
    if (currentCategory !== "all") {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    if (searchQuery !== "") {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filtered.length === 0) {
        catalogDiv.innerHTML = '<p style="width:100%; text-align:center;">Нет товаров в этой категории</p>';
        return;
    }

    catalogDiv.innerHTML = "";
    for (let product of filtered) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="emoji">${product.emoji}</div>
            <h3>${product.name}</h3>
            <div class="category">${product.category}</div>
            <div class="price">${product.price} ₽</div>
            <p style="font-size:12px; margin:5px 0;">${product.desc}</p>
            <button class="add-btn" data-id="${product.id}">➕ В корзину</button>
        `;
        catalogDiv.appendChild(card);
    }

    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            const product = products.find(p => p.id === id);
            if (product) addToCart(product);
        });
    });
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    updateCartUI();
    saveCartToLocalStorage();
    showMessage(`✅ ${product.name} добавлен!`);
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCartUI();
        saveCartToLocalStorage();
        showMessage(`🗑️ Товар удалён`);
    }
}

function clearCart() {
    cart = [];
    updateCartUI();
    saveCartToLocalStorage();
    showMessage(`Корзина очищена`);
}

function getTotal() {
    let sum = 0;
    for (let item of cart) {
        sum += item.price * item.quantity;
    }
    return sum;
}

function updateCartUI() {
    let totalItems = 0;
    for (let item of cart) {
        totalItems += item.quantity;
    }
    cartCountSpan.textContent = totalItems;
    renderCartModal();
}

function renderCartModal() {
    if (!cartItemsDiv) return;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart">🧺 Корзина пуста<br>Добавьте товары</div>';
        cartTotalSpan.textContent = "Итого: 0 ₽";
        return;
    }

    let html = '';
    for (let item of cart) {
        html += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    ${item.price} ₽ x ${item.quantity} = ${item.price * item.quantity} ₽
                </div>
                <button class="remove-item" data-id="${item.id}" style="background:#e67e22;">Удалить</button>
            </div>
        `;
    }
    cartItemsDiv.innerHTML = html;
    cartTotalSpan.textContent = `Итого: ${getTotal()} ₽`;

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            removeFromCart(id);
            renderCartModal();
            updateCartUI();
        });
    });
}

let msgTimeout;
function showMessage(text) {
    let msgDiv = document.getElementById('tempMsg');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'tempMsg';
        msgDiv.style.position = 'fixed';
        msgDiv.style.bottom = '20px';
        msgDiv.style.left = '50%';
        msgDiv.style.transform = 'translateX(-50%)';
        msgDiv.style.backgroundColor = '#333';
        msgDiv.style.color = 'white';
        msgDiv.style.padding = '10px 20px';
        msgDiv.style.borderRadius = '30px';
        msgDiv.style.zIndex = '2000';
        msgDiv.style.fontSize = '14px';
        document.body.appendChild(msgDiv);
    }
    msgDiv.textContent = text;
    msgDiv.style.opacity = '1';
    if (msgTimeout) clearTimeout(msgTimeout);
    msgTimeout = setTimeout(() => {
        msgDiv.style.opacity = '0';
    }, 1500);
}

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-cat');
            currentCategory = cat;
            renderProducts();
        });
    });
}

function openModal() {
    renderCartModal();
    cartModal.classList.add('show');
}

function closeModal() {
    cartModal.classList.remove('show');
}

function mockOrder() {
    if (cart.length === 0) {
        showMessage("Корзина пуста! Добавьте товары.");
        return;
    }
    showMessage(`🎉 Спасибо за заказ! Сумма: ${getTotal()} ₽`);
}

function scrollToCatalog() {
    document.querySelector('.catalog').scrollIntoView({ behavior: 'smooth' });
}

function initSearch() {
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
        text-align: center;
        margin: 20px auto;
        width: 90%;
        max-width: 500px;
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '🔍 Поиск товаров по названию...';
    searchInput.style.cssText = `
        width: 100%;
        padding: 12px 20px;
        font-size: 16px;
        border: 2px solid #ddd;
        border-radius: 30px;
        outline: none;
        transition: 0.3s;
    `;
    
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderProducts();
    });
    
    searchContainer.appendChild(searchInput);
    
    const filtersDiv = document.querySelector('.filters');
    filtersDiv.parentNode.insertBefore(searchContainer, filtersDiv.nextSibling);
}

document.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    initSearch();
    renderProducts();
    initFilters();

    const cartBtn = document.getElementById('cartBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const showCatalogBtn = document.getElementById('showCatalogBtn');

    if (cartBtn) cartBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            clearCart();
            renderCartModal();
            updateCartUI();
        });
    }
    if (checkoutBtn) checkoutBtn.addEventListener('click', mockOrder);
    if (showCatalogBtn) showCatalogBtn.addEventListener('click', scrollToCatalog);

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeModal();
    });
});