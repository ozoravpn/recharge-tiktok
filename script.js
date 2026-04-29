/* ========================================= */
/* --- 1. VARIABEL GLOBAL --- */
/* ========================================= */
const API_URL = "api.php"; 
let currentUsername = "thamuz_indo";
let resettingUsername = ""; 
let selectedCoins = 30;
let selectedPrice = 6000;
const pricePerCoin = 200; // Harga per koin dalam Rupiah
let customValueStr = "";

let currentPaymentMethod = "DANA"; 
const defaultAvatarUrl = "url('https://i.ibb.co/5R2VNRk/34c4032d077f8182e179f70031c05119.png')";

window.onload = function() {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUsername = loggedInUser;
        document.getElementById('display-name').innerText = currentUsername;
        document.getElementById('summary-view-user').innerText = currentUsername;
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    } else {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }
};

function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('premium_device_id');
    if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
        localStorage.setItem('premium_device_id', deviceId);
    }
    return deviceId;
}

/* ========================================= */
/* --- 2. FUNGSI AUTH & OTP --- */
/* ========================================= */
function toggleAuthMode(mode) {
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('forgotPasswordContainer').style.display = 'none';

    if (mode === 'forgot') {
        document.getElementById('authTitle').innerText = 'Atur Ulang Sandi';
        document.getElementById('forgotPasswordContainer').style.display = 'flex';
        document.getElementById('step1-otp').style.display = 'block';
        document.getElementById('step2-otp').style.display = 'none';
        document.getElementById('step3-otp').style.display = 'none';
    } else {
        document.getElementById('authTitle').innerText = 'Log in';
        document.getElementById('loginFormContainer').style.display = 'flex';
    }
}

async function processLogin(event) {
    event.preventDefault(); 
    const user = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value;

    if (user === 'ozoraaa' && pass === 'ozoraaa2002') {
        sessionStorage.setItem('adminAuth', 'true');
        alert("Selamat datang, Admin! Mengalihkan ke Panel...");
        window.location.href = 'admin.html';
        return;
    }

    const myDeviceId = getOrCreateDeviceId();
    const btn = document.querySelector('#loginForm .btn-login');
    const originalText = btn.innerText;
    btn.innerText = "Memproses...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass, device_id: myDeviceId })
        });
        const result = await response.json();

        if (result.status === 'success') {
            if(result.message) alert(result.message);
            localStorage.setItem('currentUser', user);
            currentUsername = user;
            document.getElementById('display-name').innerText = currentUsername;
            document.getElementById('summary-view-user').innerText = currentUsername;
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('app').style.display = 'block';
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Gagal terhubung ke server database.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function processLogout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

let generatedOTP = ""; 

function sendOTP(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('resetUsername').value.trim();
    if (!usernameInput) {
        alert("Silakan masukkan username atau nomor HP Anda!");
        return;
    }
    resettingUsername = usernameInput;
    generatedOTP = Math.floor(1000 + Math.random() * 9000).toString(); 
    alert(`[SIMULASI SISTEM]\nKode OTP untuk ${resettingUsername} adalah: ${generatedOTP}`);
    document.getElementById('step1-otp').style.display = 'none';
    document.getElementById('step2-otp').style.display = 'block';
}

function verifyOTP(event) {
    event.preventDefault();
    const inputOTP = document.getElementById('inputOTP').value.trim();
    if (inputOTP === generatedOTP) {
        document.getElementById('step2-otp').style.display = 'none';
        document.getElementById('step3-otp').style.display = 'block';
    } else {
        alert("Kode OTP salah! Silakan periksa kembali.");
    }
}

function saveNewPassword(event) {
    event.preventDefault();
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (!newPass || !confirmPass) {
        alert("Sandi tidak boleh kosong!");
        return;
    }
    if (newPass !== confirmPass) {
        alert("Sandi baru dan konfirmasi sandi tidak cocok!");
        return;
    }
    alert(`Berhasil! Sandi untuk akun ${resettingUsername} telah diperbarui.\nSilakan Login menggunakan sandi baru.`);
    document.getElementById('resetUsername').value = "";
    document.getElementById('inputOTP').value = "";
    document.getElementById('newPassword').value = "";
    document.getElementById('confirmPassword').value = "";
    toggleAuthMode('login');
}

/* ========================================= */
/* --- 3. FUNGSI UI & TIKTOK API --- */
/* ========================================= */
function formatRibuan(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function formatFollowers(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return formatRibuan(num);
}

async function searchApiUser(event) {
    event.preventDefault();
    let uid = document.getElementById('uid').value.trim().replace('@', '');
    if (!uid) return;
    
    const nameEl = document.getElementById('display-name');
    const avatarEl = document.getElementById('display-avatar');
    const followersEl = document.getElementById('display-followers');
    
    nameEl.innerText = "Mencari...";
    avatarEl.style.backgroundImage = defaultAvatarUrl; 
    followersEl.style.display = 'inline'; 
    followersEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memuat...`;
    
    try {
        const response = await fetch(`https://www.tikwm.com/api/user/info?unique_id=${uid}`);
        const data = await response.json();
        if (data.code === 0 && data.data) {
            const user = data.data.user;
            const stats = data.data.stats;
            currentUsername = user.nickname || user.uniqueId;
            nameEl.innerText = currentUsername;
            if (user.avatarMedium || user.avatarLarger) avatarEl.style.backgroundImage = `url('${user.avatarMedium || user.avatarLarger}')`;
            followersEl.innerHTML = `${formatFollowers(stats.followerCount)} Pengikut`;
        } else {
            nameEl.innerText = "Tidak ditemukan";
            followersEl.innerHTML = `<span style="color: #fe2c55;">Username tidak valid</span>`;
        }
    } catch (error) {
        nameEl.innerText = "Error Jaringan";
        followersEl.innerHTML = `<span style="color: #fe2c55;">Gagal terhubung API</span>`;
    }
}

function selectPackage(element) {
    document.querySelectorAll('.coin-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
    
    if (element.id !== 'btnCustom') {
        selectedCoins = parseInt(element.getAttribute('data-coins'));
        selectedPrice = parseInt(element.getAttribute('data-price'));
        updateBuyButton();
        document.getElementById('btnCustom').innerHTML = '<div class="custom-text">Custom</div>';
    } else {
        openCustomModal();
    }
}

function updateBuyButton() { 
    document.getElementById('btn-buy-text').innerText = 'Beli seharga Rp' + formatRibuan(selectedPrice); 
}

/* ========================================= */
/* --- 4. MODAL KEYPAD KHUSUS (CUSTOM) --- */
/* ========================================= */
function openCustomModal() { 
    closeAllModals(); 
    document.getElementById('modalCustom').style.display = 'flex'; 
    customValueStr = ""; 
    document.getElementById('customInput').value = ""; 
    updateCustomUI(); 
}

function pressKey(val) {
    if (val === 'del') {
        customValueStr = customValueStr.slice(0, -1);
    } else if (val === '000') { 
        if (customValueStr.length > 0 && customValueStr.length < 6) customValueStr += '000'; 
    } else {
        if (customValueStr.length < 8) customValueStr += val;
    }
    updateCustomUI(); 
}

function updateCustomUI() {
    const numVal = parseInt(customValueStr) || 0;
    const inputEl = document.getElementById('customInput');
    const totalText = document.getElementById('customTotalText');
    const btnApply = document.getElementById('btnApplyCustom');
    
    if (customValueStr.length > 0) {
        inputEl.value = formatRibuan(numVal); 
        const price = numVal * pricePerCoin;
        totalText.innerText = 'Rp' + formatRibuan(price);
        
        if (numVal >= 30) {
            btnApply.disabled = false; 
            btnApply.style.background = '#fe2c55'; 
            btnApply.dataset.coins = numVal; 
            btnApply.dataset.price = price;
        } else {
            btnApply.disabled = true; 
            btnApply.style.background = 'rgba(254,44,85,0.5)';
        }
    } else {
        inputEl.value = ''; 
        totalText.innerText = 'Rp0'; 
        btnApply.disabled = true; 
        btnApply.style.background = 'rgba(254,44,85,0.5)';
    }
}

function applyCustom() {
    const btn = document.getElementById('btnApplyCustom');
    if (btn.disabled) return; 
    
    selectedCoins = parseInt(btn.dataset.coins);
    selectedPrice = parseInt(btn.dataset.price);
    
    const btnCustom = document.getElementById('btnCustom');
    document.querySelectorAll('.coin-btn').forEach(b => b.classList.remove('selected'));
    btnCustom.classList.add('selected');
    
    btnCustom.innerHTML = `
        <div class="coin-amount-row" style="margin-bottom:0;">
            <img src="Koin-tiktok.png" alt="TikTok Coin" class="tiktok-coin-icon">
            <span>${formatRibuan(selectedCoins)}</span>
        </div>
        <div class="coin-price">Rp${formatRibuan(selectedPrice)}</div>
    `;
    
    updateBuyButton();
    closeAllModals();
}

function closeAllModals() { 
    document.querySelectorAll('.modal-overlay').forEach(el => el.style.display = 'none'); 
    closeSummaryView();
    closeBankSelection();
    closePaymentMethods();
    closeAddCard(); 
}

/* ========================================= */
/* --- 5. CHECKOUT / SIMULASI VISUAL --- */
/* ========================================= */
function openOrderSummary() {
    document.getElementById('summary-view-user').innerText = currentUsername;
    const mainAvatar = document.getElementById('display-avatar').style.backgroundImage;
    document.getElementById('summary-view-avatar').style.backgroundImage = mainAvatar || defaultAvatarUrl;
    
    document.getElementById('summary-view-coins').innerText = `Pembelian ${formatRibuan(selectedCoins)} Koin`;
    const formattedPrice = 'Rp' + formatRibuan(selectedPrice);
    document.getElementById('summary-view-price').innerText = formattedPrice;
    document.getElementById('summary-view-total').innerText = formattedPrice;

    const view = document.getElementById('summaryView');
    view.style.display = 'flex';
    setTimeout(() => { view.classList.add('active'); }, 10);
}

function closeSummaryView() {
    const view = document.getElementById('summaryView');
    view.classList.remove('active');
    setTimeout(() => { view.style.display = 'none'; }, 250); 
}

function toggleRadio(element) {
    document.querySelectorAll('#summaryView .summary-radio').forEach(r => r.classList.remove('active'));
    const radio = element.querySelector('.summary-radio');
    if (radio) radio.classList.add('active');
    const pmName = element.querySelector('.pm-left span:last-child');
    if(pmName) currentPaymentMethod = pmName.innerText.trim();
}

function openPaymentMethods() {
    document.getElementById('pm-view-total').innerText = `Rp${formatRibuan(selectedPrice)}`;
    const view = document.getElementById('paymentMethodsView');
    if(view) { view.style.display = 'flex'; setTimeout(() => { view.classList.add('active'); }, 10); }
}

function closePaymentMethods() {
    const view = document.getElementById('paymentMethodsView');
    if(view) { view.classList.remove('active'); setTimeout(() => { view.style.display = 'none'; }, 250); }
}

function selectPaymentMethod(element) {
    document.querySelectorAll('#paymentMethodsView .summary-radio').forEach(r => r.classList.remove('active'));
    const radio = element.querySelector('.summary-radio');
    if (radio) radio.classList.add('active');
}

function openBankSelection() {
    document.getElementById('bank-view-total').innerText = `Rp${formatRibuan(selectedPrice)}`;
    const view = document.getElementById('bankSelectionView');
    if(view) { view.style.display = 'flex'; setTimeout(() => { view.classList.add('active'); }, 10); }
}

function closeBankSelection() {
    const view = document.getElementById('bankSelectionView');
    if(view) { view.classList.remove('active'); setTimeout(() => { view.style.display = 'none'; }, 250); }
}

function selectBank(element) {
    document.querySelectorAll('#bankSelectionView .summary-radio').forEach(r => r.classList.remove('active'));
    const radio = element.querySelector('.summary-radio');
    if (radio) radio.classList.add('active');
}

function openAddCard() {
    document.getElementById('card-view-total').innerText = `Rp${formatRibuan(selectedPrice)}`;
    const view = document.getElementById('addCardView');
    if(view) { view.style.display = 'flex'; setTimeout(() => { view.classList.add('active'); }, 10); }
}

function closeAddCard() {
    const view = document.getElementById('addCardView');
    if(view) { view.classList.remove('active'); setTimeout(() => { view.style.display = 'none'; }, 250); }
}

// Simulasi proses transaksi (Murni Visual, Tanpa Backend)
function processPayment() {
    closeSummaryView(); 
    closeBankSelection();
    closePaymentMethods();
    closeAddCard(); 
    
    // Panggil animasi loading yang baru
    const loadingScreen = document.getElementById('modalProcessing');
    const successScreen = document.getElementById('modalSuccess');

    // Gunakan flex agar animasi bola tepat di tengah layar
    loadingScreen.style.display = 'flex';
    
    setTimeout(() => {
        // Matikan loading screen
        loadingScreen.style.display = 'none';
        
        // Atur data pada layar sukses (Menggunakan teks Indonesia dan Rupiah)
        if(document.getElementById('success-user')) {
            document.getElementById('success-user').innerText = currentUsername;
        }
        if(document.getElementById('success-coins')) {
            document.getElementById('success-coins').innerText = `${formatRibuan(selectedCoins)} Koin`;
        }
        
        // Tampilkan layar sukses
        successScreen.style.display = 'flex';
    }, 2500); // Setel durasi menjadi 2500ms (2.5 detik)
}