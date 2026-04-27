// ===== PHONE LIFESTYLE EXTENSION FOR SILLYTAVERN =====
// Version 1.0.0

import { getContext, extension_settings, saveSettingsDebounced } from '../../../extensions.js';
import { callPopup } from '../../../../script.js';

const extensionName = 'phone-lifestyle';
const BG_IMAGE = 'https://files.catbox.moe/0f9bl8.jpeg';
const FAB_IMAGE = 'https://files.catbox.moe/ias815.jpeg';

// ===== STATE =====
let state = {
    fab: { x: 20, y: 200 },
    currentApp: null,
    perChar: {},          // keyed by charId
    currentCharId: null,
    globalPet: {
        type: null,
        name: '',
        hunger: 80,
        happy: 75,
        energy: 70,
        clean: 90,
        mood: '😊',
        speech: 'สวัสดี! ฉันดีใจที่ได้เจอคุณ!',
    },
};

function getCharId() {
    const ctx = getContext();
    return ctx?.characterId ?? ctx?.groupId ?? '__default__';
}

function charState(charId) {
    if (!state.perChar[charId]) {
        state.perChar[charId] = {
            ig: { posts: [], stories: [], dms: {}, follows: {}, notifications: [] },
            line: { chats: {}, notifications: [] },
            twitter: { tweets: [], notifications: [] },
            tiktok: { videos: [] },
            bank: { balance: 10000, transactions: [] },
            notes: [],
        };
        seedCharData(charId);
    }
    return state.perChar[charId];
}

function seedCharData(charId) {
    const ctx = getContext();
    const charName = ctx?.name2 || 'ตัวละคร';
    const cs = state.perChar[charId];

    // Seed IG posts
    cs.ig.posts = [
        {
            id: 'p1', user: charName, avatar: '🌟', emoji: '📸',
            caption: `สวัสดีทุกคน! นี่คือโพสต์แรกของฉัน ✨`,
            likes: 42, likedByUser: false,
            comments: [
                { user: 'friend1', text: 'สวยมาก! 😍' },
                { user: 'friend2', text: 'เยี่ยมเลย!' }
            ],
            time: formatTime(new Date())
        }
    ];
    cs.ig.stories = [
        { user: charName, avatar: '🌟', seen: false },
        { user: 'NPC_มาย', avatar: '🌸', seen: false },
    ];
    cs.ig.dms[charName] = {
        avatar: '🌟',
        messages: [{ from: charName, text: 'หวัดดีนะ! 👋', time: formatTime(new Date()) }]
    };

    // Seed LINE
    cs.line.chats[charName] = {
        avatar: '🌟',
        messages: [{ from: charName, text: 'หวัดดีจ้า~', time: formatTime(new Date()), sticker: null }]
    };

    // Seed Twitter
    cs.twitter.tweets = [
        {
            id: 't1', user: charName, handle: `@${charName.toLowerCase()}`,
            avatar: '🌟', text: `ยินดีที่ได้รู้จักทุกคนนะ! #สวัสดีโลก`,
            likes: 12, retweets: 3, replies: 1, liked: false, retweeted: false,
            time: formatTime(new Date())
        }
    ];

    // Seed TikTok
    cs.tiktok.videos = [
        { id: 'v1', user: charName, avatar: '🌟', desc: 'คลิปแรกของฉัน! 🎵', emoji: '🎶', likes: 88, comments: 5, shares: 2 },
        { id: 'v2', user: 'NPC_มาย', avatar: '🌸', desc: 'สนุกมาก วันนี้! ☀️', emoji: '✨', likes: 312, comments: 14, shares: 8 },
        { id: 'v3', user: charName, avatar: '🌟', desc: 'เมื่อคืนฝนตกหนักมาก 🌧️', emoji: '🌧️', likes: 55, comments: 3, shares: 1 },
    ];

    // Seed Bank
    cs.bank.transactions = [
        { id: 'tx1', name: 'รายรับ: เงินเดือน', amount: 15000, type: 'income', date: '1 เม.ย. 2025', emoji: '💼', bg: '#e8f5e9' },
        { id: 'tx2', name: 'ค่าอาหาร', amount: -250, type: 'expense', date: '2 เม.ย. 2025', emoji: '🍜', bg: '#fff3e0' },
        { id: 'tx3', name: 'ช้อปปิ้งออนไลน์', amount: -890, type: 'expense', date: '3 เม.ย. 2025', emoji: '🛍️', bg: '#fce4ec' },
        { id: 'tx4', name: 'ค่าไฟฟ้า', amount: -560, type: 'expense', date: '4 เม.ย. 2025', emoji: '💡', bg: '#fff9c4' },
    ];

    // Seed Notes
    cs.notes = [
        { id: 'n1', title: 'บันทึกสำคัญ', body: 'อย่าลืมเรื่องที่สำคัญ...', date: formatDate() }
    ];
}

function formatTime(d) {
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}
function formatDate() {
    return new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ===== INIT =====
jQuery(async () => {
    injectHTML();
    bindFAB();
    bindMenuOverlay();
    bindPhoneScreen();
    startNotificationEngine();
    updateHomeClock();
    setInterval(updateHomeClock, 1000);
    console.log('[Phone Extension] Loaded ✅');
});

// ===== HTML INJECTION =====
function injectHTML() {
    const fab = `
    <div id="phone-fab" title="เปิดโทรศัพท์">
        <img src="${FAB_IMAGE}" alt="phone" onerror="this.style.display='none';document.querySelector('.fab-fallback').style.display='flex'">
        <div class="fab-fallback">📱</div>
        <div class="notif-badge" id="fab-badge">!</div>
    </div>`;

    const toast = `
    <div id="phone-notif-toast">
        <div class="notif-app-icon" id="toast-icon">📱</div>
        <div class="notif-content">
            <div class="notif-app-name" id="toast-app">แอพ</div>
            <div class="notif-msg" id="toast-msg">ข้อความใหม่</div>
        </div>
        <button class="notif-close" onclick="document.getElementById('phone-notif-toast').classList.remove('show')">✕</button>
    </div>`;

    const menuOverlay = `
    <div id="phone-menu-overlay">
        <div id="phone-menu-bg" style="background-image:url('${BG_IMAGE}')"></div>
        <div id="phone-menu-card">
            <h3>📱 MENU</h3>
            <div id="phone-menu-grid">
                <div class="menu-item" data-open="phone">
                    <div class="menu-icon">📱</div>
                    <div>โทรศัพท์</div>
                </div>
                <div class="menu-item" data-open="pet">
                    <div class="menu-icon">🐾</div>
                    <div>สัตว์เลี้ยง</div>
                </div>
                <div class="menu-item" data-open="notes">
                    <div class="menu-icon">📝</div>
                    <div>บันทึก</div>
                </div>
                <div class="menu-item" data-open="music">
                    <div class="menu-icon">🎵</div>
                    <div>เพลง</div>
                </div>
            </div>
            <button id="phone-menu-close">✕</button>
        </div>
    </div>`;

    const phoneScreen = buildPhoneScreenHTML();

    $('body').append(fab + toast + menuOverlay + phoneScreen);
}

function buildPhoneScreenHTML() {
    return `
    <div id="phone-screen">
        <div id="phone-frame">
            <div class="status-notch"></div>
            <div id="phone-status-bar">
                <span id="phone-clock">12:00</span>
                <span>📶 🔋</span>
            </div>
            <div id="phone-content-area">
                <!-- Home Screen -->
                <div id="phone-home-screen">
                    <div class="phone-home-time" id="home-clock">12:00</div>
                    <div class="phone-home-date" id="home-date">วันจันทร์ 1 มกราคม</div>
                    <div class="app-grid">
                        <div class="app-icon-btn" data-app="instagram">
                            <div class="app-icon-inner app-ig">📸
                                <div class="app-badge" id="badge-ig">!</div>
                            </div>
                            <div>Instagram</div>
                        </div>
                        <div class="app-icon-btn" data-app="line">
                            <div class="app-icon-inner app-line">💬
                                <div class="app-badge" id="badge-line">!</div>
                            </div>
                            <div>LINE</div>
                        </div>
                        <div class="app-icon-btn" data-app="music">
                            <div class="app-icon-inner app-music">🎵</div>
                            <div>Music</div>
                        </div>
                        <div class="app-icon-btn" data-app="bank">
                            <div class="app-icon-inner app-bank">🏦</div>
                            <div>ธนาคาร</div>
                        </div>
                        <div class="app-icon-btn" data-app="twitter">
                            <div class="app-icon-inner app-twitter">𝕏
                                <div class="app-badge" id="badge-tw">!</div>
                            </div>
                            <div>Twitter/X</div>
                        </div>
                        <div class="app-icon-btn" data-app="tiktok">
                            <div class="app-icon-inner app-tiktok">🎵</div>
                            <div>TikTok</div>
                        </div>
                    </div>
                </div>
                <!-- App View -->
                <div id="phone-app-view">
                    <div id="phone-app-topbar">
                        <button id="phone-app-back">‹</button>
                        <div id="phone-app-title"></div>
                    </div>
                    <div id="phone-app-body">
                        <!-- App content injected here -->
                    </div>
                </div>
            </div>
            <div id="phone-back-btn" title="กลับหน้าแรก"></div>
        </div>
        <button id="phone-screen-close">✕</button>
    </div>`;
}

// ===== FAB DRAG =====
function bindFAB() {
    const fab = document.getElementById('phone-fab');
    let dragging = false, ox = 0, oy = 0, moved = false;

    fab.style.left = state.fab.x + 'px';
    fab.style.top = state.fab.y + 'px';
    fab.style.bottom = 'auto';
    fab.style.right = 'auto';

    fab.addEventListener('mousedown', e => {
        dragging = true;
        moved = false;
        ox = e.clientX - fab.getBoundingClientRect().left;
        oy = e.clientY - fab.getBoundingClientRect().top;
        e.preventDefault();
    });
    fab.addEventListener('touchstart', e => {
        dragging = true;
        moved = false;
        const t = e.touches[0];
        ox = t.clientX - fab.getBoundingClientRect().left;
        oy = t.clientY - fab.getBoundingClientRect().top;
    }, { passive: true });

    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        moved = true;
        let x = e.clientX - ox;
        let y = e.clientY - oy;
        x = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, y));
        fab.style.left = x + 'px';
        fab.style.top = y + 'px';
        state.fab.x = x;
        state.fab.y = y;
    });
    document.addEventListener('touchmove', e => {
        if (!dragging) return;
        moved = true;
        const t = e.touches[0];
        let x = t.clientX - ox;
        let y = t.clientY - oy;
        x = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, y));
        fab.style.left = x + 'px';
        fab.style.top = y + 'px';
        state.fab.x = x;
        state.fab.y = y;
    }, { passive: true });

    const stopDrag = () => { dragging = false; };
    document.addEventListener('mouseup', e => {
        if (!moved && dragging) openMenu();
        stopDrag();
    });
    document.addEventListener('touchend', e => {
        if (!moved && dragging) openMenu();
        stopDrag();
    });
}

// ===== MENU =====
function openMenu() {
    updateCharContext();
    document.getElementById('phone-menu-overlay').classList.add('open');
}
function closeMenu() {
    document.getElementById('phone-menu-overlay').classList.remove('open');
}
function bindMenuOverlay() {
    document.getElementById('phone-menu-close').addEventListener('click', closeMenu);
    document.getElementById('phone-menu-overlay').addEventListener('click', e => {
        if (e.target === document.getElementById('phone-menu-overlay')) closeMenu();
    });
    document.querySelectorAll('.menu-item[data-open]').forEach(el => {
        el.addEventListener('click', () => {
            const target = el.getAttribute('data-open');
            closeMenu();
            if (target === 'phone') openPhoneScreen('home');
            else if (target === 'pet') openPhoneScreen('pet');
            else if (target === 'notes') openPhoneScreen('notes');
            else if (target === 'music') openPhoneScreen('music');
        });
    });
}

// ===== PHONE SCREEN =====
function bindPhoneScreen() {
    document.getElementById('phone-screen-close').addEventListener('click', () => {
        document.getElementById('phone-screen').classList.remove('open');
    });
    document.getElementById('phone-back-btn').addEventListener('click', goHome);
    document.getElementById('phone-app-back').addEventListener('click', goHome);
    document.querySelectorAll('.app-icon-btn[data-app]').forEach(el => {
        el.addEventListener('click', () => openApp(el.getAttribute('data-app')));
    });
    document.getElementById('phone-screen').addEventListener('click', e => {
        if (e.target === document.getElementById('phone-screen')) {
            document.getElementById('phone-screen').classList.remove('open');
        }
    });
}

function openPhoneScreen(target = 'home') {
    updateCharContext();
    document.getElementById('phone-screen').classList.add('open');
    if (target === 'home') goHome();
    else openApp(target);
}

function goHome() {
    document.getElementById('phone-home-screen').style.display = 'flex';
    document.getElementById('phone-app-view').classList.remove('open');
    state.currentApp = null;
}

function openApp(appName) {
    state.currentApp = appName;
    document.getElementById('phone-home-screen').style.display = 'none';
    document.getElementById('phone-app-view').classList.add('open');
    const titles = {
        instagram: 'Instagram', line: 'LINE',
        music: 'Music', bank: 'ธนาคาร',
        twitter: 'Twitter', tiktok: 'TikTok',
        pet: 'สัตว์เลี้ยง', notes: 'บันทึก',
    };
    document.getElementById('phone-app-title').textContent = titles[appName] || appName;
    const body = document.getElementById('phone-app-body');
    body.innerHTML = '';

    const charId = getCharId();
    const cs = charState(charId);

    const appBuilders = {
        instagram: () => buildInstagram(body, cs),
        line: () => buildLine(body, cs),
        music: () => buildMusic(body),
        bank: () => buildBank(body, cs),
        twitter: () => buildTwitter(body, cs),
        tiktok: () => buildTikTok(body, cs),
        pet: () => buildPet(body),
        notes: () => buildNotes(body, cs),
    };
    if (appBuilders[appName]) appBuilders[appName]();
}

function updateCharContext() {
    const newId = getCharId();
    if (newId !== state.currentCharId) {
        state.currentCharId = newId;
    }
}

// ===== CLOCK =====
function updateHomeClock() {
    const now = new Date();
    const t = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const d = now.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
    const clockEl = document.getElementById('home-clock');
    const dateEl = document.getElementById('home-date');
    const statusClock = document.getElementById('phone-clock');
    if (clockEl) clockEl.textContent = t;
    if (dateEl) dateEl.textContent = d;
    if (statusClock) statusClock.textContent = t;
}

// ===== INSTAGRAM =====
function buildInstagram(container, cs) {
    container.style.background = '#000';
    const ig = cs.ig;

    const html = `
    <div id="app-instagram" style="min-height:100%;display:flex;flex-direction:column;">
        <div class="ig-topbar">
            <div class="ig-logo">Instagram</div>
            <div class="ig-topbar-icons">
                <span id="ig-notif-icon" title="แจ้งเตือน">🔔</span>
                <span id="ig-dm-list-icon" title="ข้อความ">✈️</span>
            </div>
        </div>
        <div class="ig-stories-bar" id="ig-stories-bar"></div>
        <div id="ig-feed"></div>
        <div class="ig-compose-bar">
            <input type="text" id="ig-post-input" placeholder="เขียนโพสต์ใหม่..." />
            <button id="ig-post-btn">โพสต์</button>
        </div>
        <!-- DM list screen -->
        <div id="ig-dm-list-screen" style="display:none;position:absolute;inset:0;background:#000;overflow-y:auto;z-index:4;">
            <div style="padding:14px;color:white;font-size:16px;font-weight:700;font-family:Segoe UI,sans-serif;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:10px;">
                <span id="ig-dm-list-back" style="cursor:pointer;font-size:20px;">‹</span> ข้อความ
            </div>
            <div id="ig-dm-contacts"></div>
        </div>
        <!-- DM chat screen -->
        <div id="ig-dm-chat-screen" class="ig-dm-screen" style="display:none;position:absolute;inset:0;z-index:5;flex-direction:column;">
            <div class="ig-dm-header">
                <span id="ig-dm-back" style="cursor:pointer;font-size:20px;color:white;">‹</span>
                <div class="ig-avatar" id="ig-dm-chat-avatar">👤</div>
                <span id="ig-dm-chat-name" style="color:white;font-weight:700;font-family:Segoe UI,sans-serif;font-size:14px;">ชื่อ</span>
                <span style="margin-left:auto;font-size:20px;cursor:pointer;" id="ig-call-btn">📞</span>
                <span style="margin-left:12px;font-size:20px;cursor:pointer;" id="ig-vcall-btn">📹</span>
            </div>
            <div class="ig-dm-messages" id="ig-dm-messages"></div>
            <div class="ig-compose-bar" style="border-top:1px solid #1a1a1a;">
                <input type="text" id="ig-dm-input" placeholder="ข้อความ..." />
                <button id="ig-dm-send">ส่ง</button>
            </div>
        </div>
        <!-- Profile view -->
        <div class="ig-profile-view" id="ig-profile-view"></div>
        <!-- Story view -->
        <div id="ig-story-view" style="display:none;position:absolute;inset:0;background:#111;z-index:7;flex-direction:column;align-items:center;justify-content:center;">
            <div style="color:white;font-size:80px;margin-bottom:20px;" id="ig-story-emoji">🌟</div>
            <div style="color:white;font-size:14px;font-family:Segoe UI,sans-serif;" id="ig-story-user"></div>
            <button onclick="document.getElementById('ig-story-view').style.display='none'" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.15);border:none;color:white;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;">✕</button>
        </div>
        <!-- Call screen -->
        <div class="call-screen" id="ig-call-screen">
            <div class="call-screen-top">
                <div class="call-avatar-big" id="ig-call-avatar">👤</div>
                <div class="call-name" id="ig-call-name">ชื่อ</div>
                <div class="call-status" id="ig-call-status">กำลังโทร...</div>
                <div class="call-duration" id="ig-call-dur"></div>
            </div>
            <div class="call-actions-row">
                <div class="call-btn call-btn-mute"><div class="call-btn-circle">🔇</div><div class="call-btn-label">ปิดเสียง</div></div>
                <div class="call-btn call-btn-end" id="ig-call-end"><div class="call-btn-circle">📵</div><div class="call-btn-label">วางสาย</div></div>
                <div class="call-btn call-btn-speaker"><div class="call-btn-circle">🔊</div><div class="call-btn-label">ลำโพง</div></div>
            </div>
        </div>
    </div>`;

    container.innerHTML = html;
    renderIGStories(ig);
    renderIGFeed(ig);
    bindIGEvents(ig, container);
}

function renderIGStories(ig) {
    const bar = document.getElementById('ig-stories-bar');
    if (!bar) return;
    bar.innerHTML = ig.stories.map((s, i) => `
        <div class="ig-story-item" data-story-idx="${i}">
            <div class="ig-story-ring ${s.seen ? 'seen' : ''}">
                <div class="ig-story-avatar">${s.avatar}</div>
            </div>
            <div class="ig-story-name">${s.user}</div>
        </div>`).join('') + `
        <div class="ig-story-item" id="ig-add-story">
            <div class="ig-story-ring" style="background:#333;">
                <div class="ig-story-avatar" style="font-size:28px;">+</div>
            </div>
            <div class="ig-story-name">เพิ่ม</div>
        </div>`;

    bar.querySelectorAll('.ig-story-item[data-story-idx]').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.getAttribute('data-story-idx'));
            const s = ig.stories[idx];
            s.seen = true;
            document.getElementById('ig-story-emoji').textContent = s.avatar;
            document.getElementById('ig-story-user').textContent = `สตอรี่ของ ${s.user}`;
            document.getElementById('ig-story-view').style.display = 'flex';
            renderIGStories(ig);
        });
    });

    document.getElementById('ig-add-story')?.addEventListener('click', () => {
        const ctx = getContext();
        const charId = getCharId();
        const cs = charState(charId);
        const myStory = { user: 'คุณ', avatar: '🤳', seen: false };
        cs.ig.stories.unshift(myStory);
        renderIGStories(cs.ig);
        showToast('📸', 'Instagram', 'ลงสตอรี่แล้ว!');
    });
}

function renderIGFeed(ig) {
    const feed = document.getElementById('ig-feed');
    if (!feed) return;
    feed.innerHTML = ig.posts.slice().reverse().map(p => `
        <div class="ig-feed-item" data-post-id="${p.id}">
            <div class="ig-post-header">
                <div class="ig-avatar" data-profile="${p.user}">${p.avatar}</div>
                <div class="ig-post-user" data-profile="${p.user}" style="cursor:pointer;">${p.user}</div>
                <span style="margin-left:auto;color:#666;font-size:11px;font-family:'Segoe UI',sans-serif;">${p.time || ''}</span>
            </div>
            <div class="ig-post-image"><div style="font-size:48px;">${p.emoji || '📸'}</div></div>
            <div class="ig-post-actions">
                <span class="ig-like-btn" data-post="${p.id}" title="ถูกใจ">${p.likedByUser ? '❤️' : '🤍'}</span>
                <span class="ig-comment-toggle" data-post="${p.id}" title="แสดงความคิดเห็น">💬</span>
                <span title="แชร์">📤</span>
            </div>
            <div class="ig-post-likes">${p.likes} ถูกใจ</div>
            <div class="ig-post-caption"><span>${p.user}</span> ${p.caption}</div>
            <div class="ig-comments-section" id="comments-${p.id}" style="display:none;">
                ${p.comments.map(c => `<div class="ig-comment-item"><span class="cmt-user">${c.user}</span> ${c.text}</div>`).join('')}
                <div class="ig-compose-bar" style="border-top:1px solid #111;padding:6px 12px;gap:8px;">
                    <input type="text" class="ig-comment-input" data-post="${p.id}" placeholder="เขียนคอมเมนต์..." style="background:#1a1a1a;border:none;border-radius:20px;padding:6px 12px;color:white;font-size:12px;outline:none;flex:1;" />
                    <button class="ig-comment-send" data-post="${p.id}" style="background:none;border:none;color:#0095f6;font-size:13px;font-weight:700;cursor:pointer;font-family:'Segoe UI',sans-serif;">ส่ง</button>
                </div>
            </div>
            <div class="ig-post-comments ig-comment-toggle" data-post="${p.id}" style="cursor:pointer;">ดูความคิดเห็นทั้ง ${p.comments.length} รายการ</div>
        </div>`).join('');

    // Like buttons
    feed.querySelectorAll('.ig-like-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pid = btn.getAttribute('data-post');
            const post = ig.posts.find(p => p.id === pid);
            if (!post) return;
            post.likedByUser = !post.likedByUser;
            post.likes += post.likedByUser ? 1 : -1;
            renderIGFeed(ig);
        });
    });

    // Comments toggle
    feed.querySelectorAll('.ig-comment-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const pid = btn.getAttribute('data-post');
            const sec = document.getElementById(`comments-${pid}`);
            if (sec) sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
        });
    });

    // Comment send
    feed.querySelectorAll('.ig-comment-send').forEach(btn => {
        btn.addEventListener('click', () => {
            const pid = btn.getAttribute('data-post');
            const input = feed.querySelector(`.ig-comment-input[data-post="${pid}"]`);
            if (!input || !input.value.trim()) return;
            const post = ig.posts.find(p => p.id === pid);
            if (!post) return;
            post.comments.push({ user: 'คุณ', text: input.value.trim() });
            input.value = '';
            renderIGFeed(ig);
            // Trigger char response
            setTimeout(() => {
                triggerCharComment(ig, pid, post.user);
            }, 2000 + Math.random() * 2000);
        });
    });

    // Profile click
    feed.querySelectorAll('[data-profile]').forEach(el => {
        el.addEventListener('click', () => {
            openIGProfile(ig, el.getAttribute('data-profile'));
        });
    });
}

function triggerCharComment(ig, postId, charName) {
    const post = ig.posts.find(p => p.id === postId);
    if (!post) return;
    const replies = ['น่ารักมากเลย! 😍', 'เห็นด้วยเลย! 💕', 'สวยจัง ✨', 'โอ้โห! 🔥', 'ฮ่าๆ 😂'];
    post.comments.push({ user: charName, text: replies[Math.floor(Math.random() * replies.length)] });
    renderIGFeed(ig);
}

function openIGProfile(ig, username) {
    const view = document.getElementById('ig-profile-view');
    if (!view) return;
    view.classList.add('open');
    const followed = ig.follows[username] || false;
    const userPosts = ig.posts.filter(p => p.user === username);
    view.innerHTML = `
        <div style="background:#000;min-height:100%;">
            <div style="padding:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #1a1a1a;">
                <span id="ig-profile-close" style="cursor:pointer;color:white;font-size:22px;">‹</span>
                <span style="color:white;font-weight:700;font-family:'Segoe UI',sans-serif;">${username}</span>
            </div>
            <div class="ig-profile-header-section">
                <div style="display:flex;align-items:center;gap:20px;">
                    <div class="ig-profile-avatar-big"><div class="ig-profile-avatar-big-inner">🌟</div></div>
                    <div class="ig-profile-stats">
                        <div class="ig-profile-stat"><div class="ig-profile-stat-num">${userPosts.length}</div><div class="ig-profile-stat-label">โพสต์</div></div>
                        <div class="ig-profile-stat"><div class="ig-profile-stat-num">${Math.floor(Math.random()*500)+50}</div><div class="ig-profile-stat-label">ผู้ติดตาม</div></div>
                        <div class="ig-profile-stat"><div class="ig-profile-stat-num">${Math.floor(Math.random()*300)+30}</div><div class="ig-profile-stat-label">กำลังติดตาม</div></div>
                    </div>
                </div>
                <div class="ig-profile-name">${username}</div>
                <div class="ig-profile-bio">📍 ประเทศไทย | ✨ ชอบถ่ายรูป</div>
                <button class="ig-follow-btn ${followed ? 'following' : ''}" id="ig-follow-toggle" style="margin-top:12px;">${followed ? 'กำลังติดตาม' : 'ติดตาม'}</button>
            </div>
            <div class="ig-profile-grid">
                ${userPosts.length > 0 ? userPosts.map(p => `<div class="ig-profile-grid-item">${p.emoji || '📸'}</div>`).join('') : '<div style="grid-column:span 3;text-align:center;padding:30px;color:#666;font-family:Segoe UI,sans-serif;">ยังไม่มีโพสต์</div>'}
            </div>
        </div>`;

    view.querySelector('#ig-profile-close').addEventListener('click', () => view.classList.remove('open'));
    view.querySelector('#ig-follow-toggle').addEventListener('click', function() {
        ig.follows[username] = !ig.follows[username];
        this.textContent = ig.follows[username] ? 'กำลังติดตาม' : 'ติดตาม';
        this.classList.toggle('following', ig.follows[username]);
    });
}

function bindIGEvents(ig, container) {
    // DM list icon
    document.getElementById('ig-dm-list-icon')?.addEventListener('click', () => {
        const screen = document.getElementById('ig-dm-list-screen');
        screen.style.display = 'block';
        renderIGDMList(ig);
    });
    document.getElementById('ig-dm-list-back')?.addEventListener('click', () => {
        document.getElementById('ig-dm-list-screen').style.display = 'none';
    });

    // Post button
    document.getElementById('ig-post-btn')?.addEventListener('click', () => {
        const input = document.getElementById('ig-post-input');
        const text = input.value.trim();
        if (!text) return;
        const charId = getCharId();
        const cs = charState(charId);
        cs.ig.posts.push({
            id: 'p' + Date.now(), user: 'คุณ', avatar: '🤳',
            emoji: '📸', caption: text, likes: 0, likedByUser: false,
            comments: [], time: formatTime(new Date())
        });
        input.value = '';
        renderIGFeed(cs.ig);
        // NPC like after a moment
        setTimeout(() => {
            const post = cs.ig.posts[cs.ig.posts.length - 1];
            if (post) { post.likes++; renderIGFeed(cs.ig); showToast('📸', 'Instagram', `${cs.ig.stories[0]?.user || 'ตัวละคร'} ถูกใจโพสต์ของคุณ`); }
        }, 3000);
    });

    // DM send
    document.getElementById('ig-dm-send')?.addEventListener('click', sendIGDM.bind(null, ig));
    document.getElementById('ig-dm-input')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendIGDM(ig);
    });

    // Call buttons
    document.getElementById('ig-call-btn')?.addEventListener('click', () => startCall('ig', ig));
    document.getElementById('ig-vcall-btn')?.addEventListener('click', () => startCall('ig', ig));
    document.getElementById('ig-call-end')?.addEventListener('click', endCall.bind(null, 'ig-call-screen'));
}

function renderIGDMList(ig) {
    const el = document.getElementById('ig-dm-contacts');
    if (!el) return;
    const contacts = Object.keys(ig.dms);
    el.innerHTML = contacts.map(name => {
        const chat = ig.dms[name];
        const last = chat.messages[chat.messages.length - 1];
        return `<div class="ig-post-header" style="border-bottom:1px solid #1a1a1a;padding:12px 14px;cursor:pointer;" data-dm-open="${name}">
            <div class="ig-avatar">${chat.avatar}</div>
            <div><div class="ig-post-user">${name}</div><div style="color:#666;font-size:12px;font-family:'Segoe UI',sans-serif;">${last?.text || ''}</div></div>
        </div>`;
    }).join('');
    el.querySelectorAll('[data-dm-open]').forEach(el => {
        el.addEventListener('click', () => openIGDM(ig, el.getAttribute('data-dm-open')));
    });
}

function openIGDM(ig, username) {
    document.getElementById('ig-dm-list-screen').style.display = 'none';
    const screen = document.getElementById('ig-dm-chat-screen');
    screen.style.display = 'flex';
    screen.setAttribute('data-dm-user', username);
    document.getElementById('ig-dm-chat-name').textContent = username;
    document.getElementById('ig-dm-chat-avatar').textContent = ig.dms[username]?.avatar || '👤';
    document.getElementById('ig-dm-back').onclick = () => {
        screen.style.display = 'none';
        document.getElementById('ig-dm-list-screen').style.display = 'block';
    };
    renderIGMessages(ig, username);
}

function renderIGMessages(ig, username) {
    const el = document.getElementById('ig-dm-messages');
    if (!el) return;
    const chat = ig.dms[username];
    if (!chat) return;
    el.innerHTML = chat.messages.map(m => `
        <div class="ig-msg-bubble ${m.from === 'คุณ' ? 'ig-msg-out' : 'ig-msg-in'}">${m.text}</div>
        <div class="ig-msg-time" style="${m.from === 'คุณ' ? 'align-self:flex-end' : 'align-self:flex-start'}">${m.time || ''}</div>`).join('');
    el.scrollTop = el.scrollHeight;
}

function sendIGDM(ig) {
    const screen = document.getElementById('ig-dm-chat-screen');
    const username = screen.getAttribute('data-dm-user');
    const input = document.getElementById('ig-dm-input');
    if (!input || !input.value.trim() || !username) return;
    if (!ig.dms[username]) ig.dms[username] = { avatar: '👤', messages: [] };
    ig.dms[username].messages.push({ from: 'คุณ', text: input.value.trim(), time: formatTime(new Date()) });
    input.value = '';
    renderIGMessages(ig, username);
    // Auto reply
    setTimeout(() => {
        const replies = ['ขอบคุณนะ! 😊', 'โอเคๆ!', 'เดี๋ยวตอบนะ~', '555 ฮ่าๆ', 'โอ้ จริงด้วย!', '💕'];
        ig.dms[username].messages.push({ from: username, text: replies[Math.floor(Math.random() * replies.length)], time: formatTime(new Date()) });
        renderIGMessages(ig, username);
        showToast('📸', 'Instagram', `${username} ตอบกลับคุณ`);
    }, 1500 + Math.random() * 2000);
}

// ===== LINE APP =====
function buildLine(container, cs) {
    container.style.background = '#1a1a1a';
    const line = cs.line;
    if (Object.keys(line.chats).length === 0) {
        const ctx = getContext();
        line.chats[ctx?.name2 || 'ตัวละคร'] = {
            avatar: '🌟',
            messages: [{ from: ctx?.name2 || 'ตัวละคร', text: 'หวัดดีจ้า~', time: formatTime(new Date()), sticker: null }]
        };
    }

    container.innerHTML = `
    <div id="app-line" style="min-height:100%;display:flex;flex-direction:column;">
        <div class="line-topbar">
            <div class="line-topbar-title">💬 LINE</div>
            <span style="color:white;font-size:20px;cursor:pointer;" id="line-new-chat">✏️</span>
        </div>
        <div id="line-chat-list" style="flex:1;overflow-y:auto;"></div>
        <!-- Chat screen -->
        <div id="line-chat-screen" style="display:none;position:absolute;inset:0;z-index:5;flex-direction:column;background:#e5ddd5;">
            <div style="background:#00b300;padding:12px 14px;display:flex;align-items:center;gap:12px;">
                <span id="line-chat-back" style="cursor:pointer;color:white;font-size:22px;">‹</span>
                <div class="line-chat-avatar" id="line-chat-avatar">🌟</div>
                <span id="line-chat-name" style="color:white;font-weight:700;font-family:'Segoe UI',sans-serif;"></span>
                <span style="margin-left:auto;color:white;font-size:20px;cursor:pointer;" id="line-call-btn">📞</span>
                <span style="margin-left:10px;color:white;font-size:20px;cursor:pointer;" id="line-vcall-btn">📹</span>
            </div>
            <div class="line-msg-bg" id="line-messages"></div>
            <div class="line-msg-input-bar">
                <button class="line-icon-btn" id="line-sticker-btn">🎭</button>
                <button class="line-icon-btn" id="line-img-btn">📷</button>
                <input type="text" id="line-msg-input" placeholder="พิมพ์ข้อความ..." />
                <button id="line-send-btn">➤</button>
            </div>
        </div>
        <!-- Sticker picker -->
        <div id="line-sticker-picker" style="display:none;position:absolute;bottom:60px;left:0;right:0;background:#fff;border-top:1px solid #ddd;padding:12px;z-index:10;">
            <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
                ${['😀','😂','🥺','😍','🎉','❤️','👍','🙏','💕','😭','🔥','✨','🎵','🤗','😴','😡'].map(e => `<span class="line-sticker-opt" style="font-size:32px;cursor:pointer;">${e}</span>`).join('')}
            </div>
        </div>
        <!-- Call screen -->
        <div class="call-screen" id="line-call-screen">
            <div class="call-screen-top">
                <div class="call-avatar-big" id="line-call-avatar">🌟</div>
                <div class="call-name" id="line-call-name">ชื่อ</div>
                <div class="call-status">กำลังโทร...</div>
                <div class="call-duration" id="line-call-dur"></div>
            </div>
            <div class="call-actions-row">
                <div class="call-btn call-btn-mute"><div class="call-btn-circle">🔇</div><div class="call-btn-label">ปิดเสียง</div></div>
                <div class="call-btn call-btn-end" id="line-call-end"><div class="call-btn-circle">📵</div><div class="call-btn-label">วางสาย</div></div>
                <div class="call-btn call-btn-speaker"><div class="call-btn-circle">🔊</div><div class="call-btn-label">ลำโพง</div></div>
            </div>
        </div>
    </div>`;

    renderLineChatList(line);
    bindLineEvents(line);
}

function renderLineChatList(line) {
    const list = document.getElementById('line-chat-list');
    if (!list) return;
    list.innerHTML = Object.keys(line.chats).map(name => {
        const chat = line.chats[name];
        const last = chat.messages[chat.messages.length - 1];
        return `<div class="line-chat-item" data-chat="${name}">
            <div class="line-chat-avatar">${chat.avatar}</div>
            <div class="line-chat-info">
                <div class="line-chat-name">${name}</div>
                <div class="line-chat-preview">${last?.sticker ? last.sticker : (last?.text || '')}</div>
            </div>
            <div class="line-chat-time">${last?.time || ''}</div>
        </div>`;
    }).join('');
    list.querySelectorAll('.line-chat-item').forEach(el => {
        el.addEventListener('click', () => openLineChat(line, el.getAttribute('data-chat')));
    });
}

function openLineChat(line, name) {
    const screen = document.getElementById('line-chat-screen');
    screen.style.display = 'flex';
    screen.setAttribute('data-chat-user', name);
    document.getElementById('line-chat-name').textContent = name;
    document.getElementById('line-chat-avatar').textContent = line.chats[name]?.avatar || '👤';
    renderLineMessages(line, name);
}

function renderLineMessages(line, name) {
    const el = document.getElementById('line-messages');
    if (!el) return;
    const chat = line.chats[name];
    if (!chat) return;
    el.innerHTML = chat.messages.map(m => {
        const isOut = m.from === 'คุณ';
        const bubbleClass = `line-bubble ${isOut ? 'line-bubble-out' : 'line-bubble-in'} ${m.sticker ? 'line-sticker' : ''}`;
        return `<div style="display:flex;flex-direction:column;align-items:${isOut ? 'flex-end' : 'flex-start'};">
            <div class="${bubbleClass}">${m.sticker || m.text}</div>
            <div style="font-size:10px;color:#888;margin:2px 4px;font-family:'Segoe UI',sans-serif;">${m.time || ''}</div>
        </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
}

function sendLineMsg(line, sticker = null) {
    const screen = document.getElementById('line-chat-screen');
    const name = screen.getAttribute('data-chat-user');
    const input = document.getElementById('line-msg-input');
    const text = sticker ? '' : (input?.value.trim() || '');
    if (!text && !sticker) return;
    if (!line.chats[name]) line.chats[name] = { avatar: '👤', messages: [] };
    const msg = { from: 'คุณ', text, sticker, time: formatTime(new Date()) };
    line.chats[name].messages.push(msg);
    if (input && !sticker) input.value = '';
    renderLineMessages(line, name);
    // Auto reply
    setTimeout(() => {
        const replyStickers = ['😊', '❤️', '👍', null];
        const replies = ['ได้เลย!', 'อ้าว จริงเหรอ?', 'โอเค~', '555', 'น่ารักจัง!', 'รอแป๊บนึงนะ'];
        const useSticker = Math.random() > 0.6;
        line.chats[name].messages.push({
            from: name,
            text: useSticker ? '' : replies[Math.floor(Math.random() * replies.length)],
            sticker: useSticker ? replyStickers[Math.floor(Math.random() * 3)] : null,
            time: formatTime(new Date())
        });
        renderLineMessages(line, name);
        showToast('💬', 'LINE', `${name} ส่งข้อความมา`);
    }, 1000 + Math.random() * 2000);
}

function bindLineEvents(line) {
    document.getElementById('line-chat-back')?.addEventListener('click', () => {
        document.getElementById('line-chat-screen').style.display = 'none';
        renderLineChatList(line);
    });
    document.getElementById('line-send-btn')?.addEventListener('click', () => sendLineMsg(line));
    document.getElementById('line-msg-input')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendLineMsg(line);
    });
    document.getElementById('line-sticker-btn')?.addEventListener('click', () => {
        const picker = document.getElementById('line-sticker-picker');
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    });
    document.querySelectorAll('.line-sticker-opt').forEach(el => {
        el.addEventListener('click', () => {
            sendLineMsg(line, el.textContent);
            document.getElementById('line-sticker-picker').style.display = 'none';
        });
    });
    document.getElementById('line-img-btn')?.addEventListener('click', () => {
        sendLineMsg(line, '📷 [รูปภาพ]');
    });
    document.getElementById('line-call-btn')?.addEventListener('click', () => {
        const name = document.getElementById('line-chat-screen').getAttribute('data-chat-user');
        const chat = line.chats[name];
        startCall('line', { callName: name, callAvatar: chat?.avatar || '🌟' });
    });
    document.getElementById('line-vcall-btn')?.addEventListener('click', () => {
        const name = document.getElementById('line-chat-screen').getAttribute('data-chat-user');
        startCall('line', { callName: name, callAvatar: '🌟' });
    });
    document.getElementById('line-call-end')?.addEventListener('click', () => endCall('line-call-screen'));
    document.getElementById('line-new-chat')?.addEventListener('click', () => {
        const name = prompt('ชื่อผู้ติดต่อใหม่:');
        if (!name || !name.trim()) return;
        if (!line.chats[name]) line.chats[name] = { avatar: '👤', messages: [] };
        renderLineChatList(line);
        openLineChat(line, name);
    });
}

// ===== MUSIC APP =====
let musicState = {
    playlist: [],
    currentIdx: 0,
    playing: false,
    volume: 80,
    progressInterval: null,
    progressSec: 0,
    ytPlayer: null,
    ytReady: false,
};

function buildMusic(container) {
    container.style.background = '#121212';
    container.innerHTML = `
    <div id="app-music" style="min-height:100%;display:flex;flex-direction:column;overflow-y:auto;">
        <div id="music-yt-player"></div>
        <div class="music-player-header">
            <div class="music-album-art" id="music-art">🎵</div>
            <div class="music-track-title" id="music-title">เลือกเพลงเพื่อเล่น</div>
            <div class="music-track-artist" id="music-artist">—</div>
        </div>
        <div class="music-progress">
            <div class="music-progress-bar" id="music-progress-bar">
                <div class="music-progress-fill" id="music-progress-fill"></div>
            </div>
            <div class="music-time-row">
                <span id="music-cur-time">0:00</span>
                <span id="music-total-time">0:00</span>
            </div>
        </div>
        <div class="music-controls">
            <button class="music-btn" id="music-shuffle">🔀</button>
            <button class="music-btn" id="music-prev">⏮</button>
            <button class="music-btn music-btn-main" id="music-play">▶</button>
            <button class="music-btn" id="music-next">⏭</button>
            <button class="music-btn" id="music-repeat">🔁</button>
        </div>
        <div class="music-volume">
            <span style="color:#b3b3b3;font-size:16px;">🔈</span>
            <input type="range" id="music-volume-slider" min="0" max="100" value="80" />
            <span style="color:#b3b3b3;font-size:16px;">🔊</span>
        </div>
        <div class="music-playlist">
            <div class="music-playlist-title">เพลย์ลิสต์ (${musicState.playlist.length})</div>
            <div id="music-playlist-list"></div>
        </div>
        <button class="music-add-btn" id="music-add-song">+ เพิ่มเพลงจาก YouTube</button>
        <div class="music-url-input-overlay" id="music-url-overlay">
            <div class="music-url-box">
                <h4>🎵 เพิ่มเพลงจาก YouTube</h4>
                <input type="text" id="music-url-input" placeholder="วาง YouTube URL ที่นี่..." />
                <input type="text" id="music-title-input" placeholder="ชื่อเพลง (ไม่บังคับ)" />
                <div class="music-url-box-btns">
                    <button class="btn-cancel" id="music-url-cancel">ยกเลิก</button>
                    <button class="btn-add" id="music-url-add">เพิ่ม</button>
                </div>
            </div>
        </div>
    </div>`;

    renderPlaylist();
    bindMusicEvents();
    initYouTubePlayer();
}

function initYouTubePlayer() {
    if (!musicState.ytReady) {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
            window.onYouTubeIframeAPIReady = () => { musicState.ytReady = true; };
        } else {
            musicState.ytReady = true;
        }
    }
}

function getYTVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function renderPlaylist() {
    const list = document.getElementById('music-playlist-list');
    if (!list) return;
    if (musicState.playlist.length === 0) {
        list.innerHTML = `<div style="text-align:center;color:#666;padding:20px;font-family:'Segoe UI',sans-serif;font-size:13px;">ยังไม่มีเพลง กด + เพื่อเพิ่ม</div>`;
        return;
    }
    list.innerHTML = musicState.playlist.map((song, i) => `
        <div class="music-playlist-item ${i === musicState.currentIdx ? 'active' : ''}" data-idx="${i}">
            <div class="pli-thumb">${song.thumb || '🎵'}</div>
            <div class="pli-info">
                <div class="pli-title">${song.title}</div>
                <div class="pli-artist">${song.artist || 'YouTube'}</div>
            </div>
            <span style="color:#b3b3b3;font-size:18px;cursor:pointer;margin-left:8px;" data-remove="${i}">✕</span>
        </div>`).join('');

    list.querySelectorAll('.music-playlist-item[data-idx]').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.getAttribute('data-remove') !== null) return;
            playTrack(parseInt(el.getAttribute('data-idx')));
        });
    });
    list.querySelectorAll('[data-remove]').forEach(el => {
        el.addEventListener('click', e => {
            e.stopPropagation();
            musicState.playlist.splice(parseInt(el.getAttribute('data-remove')), 1);
            if (musicState.currentIdx >= musicState.playlist.length) musicState.currentIdx = 0;
            renderPlaylist();
        });
    });
}

function playTrack(idx) {
    if (musicState.playlist.length === 0) return;
    musicState.currentIdx = idx;
    const song = musicState.playlist[idx];
    document.getElementById('music-title').textContent = song.title;
    document.getElementById('music-artist').textContent = song.artist || 'YouTube';

    const videoId = song.videoId;
    if (videoId && musicState.ytReady && window.YT) {
        const playerDiv = document.getElementById('music-yt-player');
        if (playerDiv) {
            playerDiv.style.display = 'block';
            playerDiv.innerHTML = `<iframe id="yt-iframe" width="100%" height="200" src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1" frameborder="0" allow="autoplay;encrypted-media;picture-in-picture" allowfullscreen></iframe>`;
        }
    }
    musicState.playing = true;
    document.getElementById('music-play').textContent = '⏸';
    renderPlaylist();
}

function bindMusicEvents() {
    document.getElementById('music-add-song')?.addEventListener('click', () => {
        document.getElementById('music-url-overlay').classList.add('open');
    });
    document.getElementById('music-url-cancel')?.addEventListener('click', () => {
        document.getElementById('music-url-overlay').classList.remove('open');
    });
    document.getElementById('music-url-add')?.addEventListener('click', () => {
        const url = document.getElementById('music-url-input').value.trim();
        const title = document.getElementById('music-title-input').value.trim();
        if (!url) return;
        const videoId = getYTVideoId(url);
        if (!videoId) { alert('URL ไม่ถูกต้อง กรุณาใช้ YouTube URL'); return; }
        musicState.playlist.push({
            title: title || `เพลงที่ ${musicState.playlist.length + 1}`,
            artist: 'YouTube', videoId, thumb: '🎵'
        });
        document.getElementById('music-url-input').value = '';
        document.getElementById('music-title-input').value = '';
        document.getElementById('music-url-overlay').classList.remove('open');
        document.querySelector('.music-playlist-title').textContent = `เพลย์ลิสต์ (${musicState.playlist.length})`;
        renderPlaylist();
        if (musicState.playlist.length === 1) playTrack(0);
    });

    document.getElementById('music-play')?.addEventListener('click', () => {
        if (musicState.playlist.length === 0) return;
        musicState.playing = !musicState.playing;
        document.getElementById('music-play').textContent = musicState.playing ? '⏸' : '▶';
        // Toggle iframe playback
        const iframe = document.getElementById('yt-iframe');
        if (iframe) {
            const src = iframe.src;
            if (!musicState.playing && src.includes('autoplay=1')) {
                iframe.src = src.replace('autoplay=1', 'autoplay=0');
            } else if (musicState.playing && src.includes('autoplay=0')) {
                iframe.src = src.replace('autoplay=0', 'autoplay=1');
            }
        }
    });

    document.getElementById('music-next')?.addEventListener('click', () => {
        if (musicState.playlist.length === 0) return;
        playTrack((musicState.currentIdx + 1) % musicState.playlist.length);
    });
    document.getElementById('music-prev')?.addEventListener('click', () => {
        if (musicState.playlist.length === 0) return;
        playTrack((musicState.currentIdx - 1 + musicState.playlist.length) % musicState.playlist.length);
    });
    document.getElementById('music-shuffle')?.addEventListener('click', () => {
        if (musicState.playlist.length === 0) return;
        playTrack(Math.floor(Math.random() * musicState.playlist.length));
    });
    document.getElementById('music-volume-slider')?.addEventListener('input', e => {
        musicState.volume = parseInt(e.target.value);
    });
}

// ===== BANK APP =====
function buildBank(container, cs) {
    container.style.background = '#f0f4f8';
    const bank = cs.bank;
    const balance = bank.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 });

    container.innerHTML = `
    <div id="app-bank" style="min-height:100%;overflow-y:auto;">
        <div class="bank-header">
            <div class="bank-header-title">บัญชีออมทรัพย์</div>
            <div class="bank-balance">฿${balance}</div>
            <div class="bank-balance-sub">ยอดเงินคงเหลือ</div>
        </div>
        <div class="bank-card">
            <div class="bank-quick-actions">
                <div class="bank-qa-btn" id="bank-transfer-btn">
                    <div class="bank-qa-icon">💸</div>
                    <div class="bank-qa-label">โอนเงิน</div>
                </div>
                <div class="bank-qa-btn" id="bank-topup-btn">
                    <div class="bank-qa-icon">➕</div>
                    <div class="bank-qa-label">เติมเงิน</div>
                </div>
                <div class="bank-qa-btn" id="bank-scan-btn">
                    <div class="bank-qa-icon">📷</div>
                    <div class="bank-qa-label">สแกนจ่าย</div>
                </div>
                <div class="bank-qa-btn" id="bank-history-btn">
                    <div class="bank-qa-icon">📋</div>
                    <div class="bank-qa-label">ประวัติ</div>
                </div>
            </div>
        </div>
        <div class="bank-section-title">รายการล่าสุด</div>
        <div id="bank-tx-list"></div>
        <!-- Transfer modal -->
        <div class="bank-transfer-modal" id="bank-transfer-modal">
            <div class="bank-transfer-modal-header">
                <span id="bank-modal-back" style="cursor:pointer;font-size:22px;">‹</span>
                โอนเงิน
            </div>
            <div class="bank-transfer-modal-body">
                <div class="bank-input-group">
                    <label>ธนาคารปลายทาง</label>
                    <input type="text" id="bank-to-bank" placeholder="กสิกรไทย, SCB, กรุงไทย..." />
                </div>
                <div class="bank-input-group">
                    <label>เลขบัญชี / พร้อมเพย์</label>
                    <input type="text" id="bank-to-acc" placeholder="xxx-x-xxxxx-x" />
                </div>
                <div class="bank-input-group">
                    <label>ชื่อผู้รับ</label>
                    <input type="text" id="bank-to-name" placeholder="ชื่อผู้รับเงิน" />
                </div>
                <div class="bank-input-group">
                    <label>จำนวนเงิน (บาท)</label>
                    <input type="number" id="bank-amount" placeholder="0.00" />
                </div>
                <div class="bank-input-group">
                    <label>หมายเหตุ</label>
                    <input type="text" id="bank-note" placeholder="ระบุหมายเหตุ..." />
                </div>
            </div>
            <button class="bank-confirm-btn" id="bank-confirm-transfer">ยืนยันการโอนเงิน</button>
        </div>
    </div>`;

    renderBankTx(bank);
    bindBankEvents(bank);
}

function renderBankTx(bank) {
    const list = document.getElementById('bank-tx-list');
    if (!list) return;
    list.innerHTML = bank.transactions.slice().reverse().map(tx => `
        <div class="bank-tx-item">
            <div class="bank-tx-icon" style="background:${tx.bg || '#f0f4f8'}">${tx.emoji || '💳'}</div>
            <div class="bank-tx-info">
                <div class="bank-tx-name">${tx.name}</div>
                <div class="bank-tx-date">${tx.date}</div>
            </div>
            <div class="bank-tx-amount ${tx.type}">${tx.type === 'income' ? '+' : ''}${tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</div>
        </div>`).join('');
}

function bindBankEvents(bank) {
    document.getElementById('bank-transfer-btn')?.addEventListener('click', () => {
        document.getElementById('bank-transfer-modal').classList.add('open');
    });
    document.getElementById('bank-modal-back')?.addEventListener('click', () => {
        document.getElementById('bank-transfer-modal').classList.remove('open');
    });
    document.getElementById('bank-confirm-transfer')?.addEventListener('click', () => {
        const name = document.getElementById('bank-to-name').value.trim() || 'ผู้รับ';
        const amount = parseFloat(document.getElementById('bank-amount').value) || 0;
        if (amount <= 0) { alert('กรุณาระบุจำนวนเงิน'); return; }
        if (amount > bank.balance) { alert('ยอดเงินไม่เพียงพอ'); return; }
        bank.balance -= amount;
        bank.transactions.push({
            id: 'tx' + Date.now(), name: `โอนให้ ${name}`,
            amount: -amount, type: 'expense', date: formatDate(),
            emoji: '💸', bg: '#fce4ec'
        });
        document.getElementById('bank-transfer-modal').classList.remove('open');
        // Re-render
        const charId = getCharId();
        buildBank(document.getElementById('phone-app-body'), charState(charId));
        showToast('🏦', 'ธนาคาร', `โอนเงิน ฿${amount.toLocaleString()} ไปยัง ${name} สำเร็จ`);
    });
    document.getElementById('bank-topup-btn')?.addEventListener('click', () => {
        const amount = parseFloat(prompt('เติมเงินจำนวน (บาท):') || '0');
        if (amount > 0) {
            bank.balance += amount;
            bank.transactions.push({
                id: 'tx' + Date.now(), name: 'เติมเงิน',
                amount, type: 'income', date: formatDate(),
                emoji: '💰', bg: '#e8f5e9'
            });
            const charId = getCharId();
            buildBank(document.getElementById('phone-app-body'), charState(charId));
            showToast('🏦', 'ธนาคาร', `เติมเงินสำเร็จ ฿${amount.toLocaleString()}`);
        }
    });
    document.getElementById('bank-scan-btn')?.addEventListener('click', () => {
        alert('📷 สแกน QR Code เพื่อชำระเงิน\n(ฟีเจอร์จำลอง)');
    });
}

// ===== TWITTER =====
function buildTwitter(container, cs) {
    container.style.background = '#000';
    const tw = cs.twitter;

    container.innerHTML = `
    <div id="app-twitter" style="min-height:100%;overflow-y:auto;position:relative;">
        <div class="tw-topbar">
            <span style="color:white;font-size:22px;">𝕏</span>
            <div style="color:white;font-size:14px;font-weight:700;font-family:'Segoe UI',sans-serif;">หน้าหลัก</div>
            <span style="font-size:20px;cursor:pointer;" id="tw-search">🔍</span>
        </div>
        <div id="tw-feed"></div>
        <button class="tw-compose-btn" id="tw-compose-open">✏️</button>
        <div class="tw-compose-overlay" id="tw-compose-overlay">
            <div class="tw-compose-header">
                <button id="tw-compose-close">✕</button>
                <button class="tw-compose-post-btn" id="tw-compose-post">โพสต์</button>
            </div>
            <div class="tw-compose-body">
                <div class="tw-avatar">👤</div>
                <textarea id="tw-compose-text" placeholder="มีอะไรอยู่ในใจ?" rows="5"></textarea>
            </div>
        </div>
    </div>`;

    renderTwitterFeed(tw);
    bindTwitterEvents(tw);
}

function renderTwitterFeed(tw) {
    const feed = document.getElementById('tw-feed');
    if (!feed) return;
    feed.innerHTML = tw.tweets.slice().reverse().map(t => `
        <div class="tw-tweet" data-tweet="${t.id}">
            <div class="tw-avatar" data-tw-profile="${t.user}">${t.avatar}</div>
            <div class="tw-tweet-content">
                <div class="tw-tweet-header">
                    <span class="tw-tweet-name" data-tw-profile="${t.user}" style="cursor:pointer;">${t.user}</span>
                    <span class="tw-tweet-handle">${t.handle}</span>
                    <span class="tw-tweet-handle">· ${t.time || ''}</span>
                </div>
                <div class="tw-tweet-text">${t.text}</div>
                <div class="tw-tweet-actions">
                    <span class="tw-action-btn tw-reply" data-t="${t.id}">💬 ${t.replies}</span>
                    <span class="tw-action-btn tw-rt ${t.retweeted ? '' : ''}" data-t="${t.id}" style="${t.retweeted ? 'color:#00ba7c;' : ''}">🔄 ${t.retweets}</span>
                    <span class="tw-action-btn tw-like" data-t="${t.id}" style="${t.liked ? 'color:#f91880;' : ''}">♥ ${t.likes}</span>
                    <span class="tw-action-btn">📤</span>
                </div>
            </div>
        </div>`).join('');

    feed.querySelectorAll('.tw-like').forEach(btn => {
        btn.addEventListener('click', () => {
            const t = tw.tweets.find(t => t.id === btn.getAttribute('data-t'));
            if (!t) return;
            t.liked = !t.liked;
            t.likes += t.liked ? 1 : -1;
            renderTwitterFeed(tw);
        });
    });
    feed.querySelectorAll('.tw-rt').forEach(btn => {
        btn.addEventListener('click', () => {
            const t = tw.tweets.find(t => t.id === btn.getAttribute('data-t'));
            if (!t) return;
            t.retweeted = !t.retweeted;
            t.retweets += t.retweeted ? 1 : -1;
            renderTwitterFeed(tw);
        });
    });
    feed.querySelectorAll('.tw-reply').forEach(btn => {
        btn.addEventListener('click', () => {
            const tweetId = btn.getAttribute('data-t');
            const replyText = prompt('ตอบกลับ:');
            if (!replyText?.trim()) return;
            const charId = getCharId();
            const cs = charState(charId);
            cs.twitter.tweets.push({
                id: 'tr' + Date.now(), user: 'คุณ', handle: '@you',
                avatar: '🤳', text: replyText, likes: 0, retweets: 0,
                replies: 0, liked: false, retweeted: false, time: formatTime(new Date())
            });
            renderTwitterFeed(cs.twitter);
        });
    });
}

function bindTwitterEvents(tw) {
    document.getElementById('tw-compose-open')?.addEventListener('click', () => {
        document.getElementById('tw-compose-overlay').classList.add('open');
    });
    document.getElementById('tw-compose-close')?.addEventListener('click', () => {
        document.getElementById('tw-compose-overlay').classList.remove('open');
    });
    document.getElementById('tw-compose-post')?.addEventListener('click', () => {
        const text = document.getElementById('tw-compose-text').value.trim();
        if (!text) return;
        const charId = getCharId();
        const cs = charState(charId);
        cs.twitter.tweets.push({
            id: 'tu' + Date.now(), user: 'คุณ', handle: '@you',
            avatar: '🤳', text, likes: 0, retweets: 0, replies: 0,
            liked: false, retweeted: false, time: formatTime(new Date())
        });
        document.getElementById('tw-compose-text').value = '';
        document.getElementById('tw-compose-overlay').classList.remove('open');
        renderTwitterFeed(cs.twitter);
        // NPC like
        setTimeout(() => {
            const last = cs.twitter.tweets[cs.twitter.tweets.length - 1];
            if (last) { last.likes++; renderTwitterFeed(cs.twitter); showToast('𝕏', 'Twitter', 'มีคนถูกใจทวีตของคุณ!'); }
        }, 4000);
    });
}

// ===== TIKTOK =====
function buildTikTok(container, cs) {
    container.style.background = '#000';
    container.style.overflow = 'hidden';
    const tiktok = cs.tiktok;

    container.innerHTML = `
    <div id="app-tiktok" style="height:100%;overflow:hidden;position:relative;">
        <div class="tiktok-topbar">
            <span>探索</span>
            <span class="active">สำหรับคุณ</span>
            <span>กำลังไลฟ์</span>
        </div>
        <div class="tiktok-video-container" id="tiktok-videos"></div>
        <div class="tiktok-compose-bar">
            <div style="font-size:20px;">🤳</div>
            <input type="text" placeholder="เพิ่มความคิดเห็น..." id="tiktok-comment-input" />
            <button id="tiktok-comment-send">➤</button>
            <span style="font-size:22px;cursor:pointer;" id="tiktok-upload">➕</span>
        </div>
    </div>`;

    renderTikTokFeed(tiktok);
    bindTikTokEvents(tiktok);
}

function renderTikTokFeed(tiktok) {
    const cont = document.getElementById('tiktok-videos');
    if (!cont) return;
    cont.innerHTML = tiktok.videos.map(v => `
        <div class="tiktok-video-item" data-vid="${v.id}">
            <div class="tiktok-video-bg">${v.emoji}</div>
            <div class="tiktok-overlay">
                <div class="tiktok-user">@${v.user}</div>
                <div class="tiktok-desc">${v.desc}</div>
                <div class="tiktok-music">🎵 เพลงประกอบ · ${v.user}</div>
            </div>
            <div class="tiktok-actions">
                <div class="tiktok-action-item">
                    <div class="tiktok-avatar-ring">${v.avatar}</div>
                </div>
                <div class="tiktok-action-item tiktok-like-btn" data-v="${v.id}">
                    <span>❤️</span>
                    <div class="tiktok-action-label">${v.likes}</div>
                </div>
                <div class="tiktok-action-item">
                    <span>💬</span>
                    <div class="tiktok-action-label">${v.comments}</div>
                </div>
                <div class="tiktok-action-item">
                    <span>↗️</span>
                    <div class="tiktok-action-label">${v.shares}</div>
                </div>
                <div class="tiktok-action-item">
                    <span>🎵</span>
                </div>
            </div>
        </div>`).join('');

    cont.querySelectorAll('.tiktok-like-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const charId = getCharId();
            const cs = charState(charId);
            const vid = cs.tiktok.videos.find(v => v.id === btn.getAttribute('data-v'));
            if (vid) { vid.likes++; renderTikTokFeed(cs.tiktok); }
        });
    });
}

function bindTikTokEvents(tiktok) {
    document.getElementById('tiktok-comment-send')?.addEventListener('click', () => {
        const input = document.getElementById('tiktok-comment-input');
        if (!input?.value.trim()) return;
        showToast('🎵', 'TikTok', 'ส่งคอมเมนต์แล้ว!');
        input.value = '';
    });
    document.getElementById('tiktok-upload')?.addEventListener('click', () => {
        const desc = prompt('คำอธิบายคลิป:');
        if (!desc?.trim()) return;
        const charId = getCharId();
        const cs = charState(charId);
        const emojis = ['🌟', '🎵', '😂', '✨', '🔥', '💕', '🌸', '🎉'];
        cs.tiktok.videos.unshift({
            id: 'v' + Date.now(), user: 'คุณ', avatar: '🤳',
            desc, emoji: emojis[Math.floor(Math.random() * emojis.length)],
            likes: 0, comments: 0, shares: 0
        });
        renderTikTokFeed(cs.tiktok);
    });
}

// ===== PET SYSTEM =====
const PET_TYPES = [
    { type: 'cat', emoji: '🐱', name: 'แมว' },
    { type: 'dog', emoji: '🐶', name: 'หมา' },
    { type: 'rabbit', emoji: '🐰', name: 'กระต่าย' },
    { type: 'hamster', emoji: '🐹', name: 'แฮมสเตอร์' },
    { type: 'bird', emoji: '🐦', name: 'นก' },
    { type: 'fox', emoji: '🦊', name: 'สุนัขจิ้งจอก' },
];

const PET_MOODS = {
    happy: ['😊', '😄', '🥰', '😸'],
    hungry: ['😿', '😢', '🥺', '😩'],
    tired: ['😴', '💤', '🥱'],
    bored: ['😑', '😶', '🙄'],
    excited: ['🤩', '🥳', '😻', '🎉'],
};

const PET_SPEECHES = {
    happy: ['ฉันมีความสุขมาก! 💕', 'ขอบคุณที่ดูแลฉันนะ~', 'วันนี้ดีจังเลย! ✨', 'รักเจ้านายมาก 🥰'],
    hungry: ['หิวแล้ว~ ขอกินข้าวด้วยได้ไหม? 🍖', 'กระเพาะร้องแล้ว...', 'ได้กินบ้างได้ไหม... 🥺'],
    tired: ['ง่วงนอนแล้ว... 💤', 'ขอนอนก่อนนะ~', 'เหนื่อยจังเลย 😴'],
    bored: ['ขอเล่นด้วยได้ไหม? 🎾', 'น่าเบื่อจัง...', 'มาเล่นกันเถอะ! 🎮'],
    excited: ['ยิ้มไม่หุบเลย! 🎉', 'สนุกมากมาย! 🌟', 'ขอบคุณมากๆ เลยนะ! 💕'],
};

let petTickInterval = null;

function buildPet(container) {
    container.style.background = 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 50%, #90EE90 100%)';
    const pet = state.globalPet;

    if (!pet.type) {
        container.innerHTML = `
        <div class="pet-screen">
            <div class="pet-header">🐾 เลือกสัตว์เลี้ยงของคุณ</div>
            <div class="pet-select-list">
                ${PET_TYPES.map(p => `
                    <div class="pet-select-item" data-pet="${p.type}" data-emoji="${p.emoji}" data-name="${p.name}">
                        <div class="psi-icon">${p.emoji}</div>
                        <div>${p.name}</div>
                    </div>`).join('')}
            </div>
        </div>`;
        container.querySelectorAll('.pet-select-item').forEach(el => {
            el.addEventListener('click', () => {
                pet.type = el.getAttribute('data-pet');
                pet.emoji = el.getAttribute('data-emoji');
                pet.name = el.getAttribute('data-name');
                pet.hunger = 80; pet.happy = 80; pet.energy = 80; pet.clean = 90;
                buildPet(container);
            });
        });
        return;
    }

    container.innerHTML = `
    <div class="pet-screen">
        <div class="pet-header">${pet.emoji} ${pet.name} ของฉัน</div>
        <div class="pet-stage" id="pet-stage">
            <div class="pet-bounce" style="font-size:80px;" id="pet-emoji">${pet.emoji}</div>
        </div>
        <div class="pet-mood-speech" id="pet-speech">${pet.speech}</div>
        <div class="pet-status-bars">
            <div class="pet-stat-row"><span>🍖 หิว</span><div class="pet-stat-bar"><div class="pet-stat-fill hunger" id="pet-hunger" style="width:${pet.hunger}%"></div></div><span>${pet.hunger}%</span></div>
            <div class="pet-stat-row"><span>💕 สุข</span><div class="pet-stat-bar"><div class="pet-stat-fill happy" id="pet-happy" style="width:${pet.happy}%"></div></div><span>${pet.happy}%</span></div>
            <div class="pet-stat-row"><span>⚡ พลัง</span><div class="pet-stat-bar"><div class="pet-stat-fill energy" id="pet-energy" style="width:${pet.energy}%"></div></div><span>${pet.energy}%</span></div>
            <div class="pet-stat-row"><span>🛁 สะอาด</span><div class="pet-stat-bar"><div class="pet-stat-fill clean" id="pet-clean" style="width:${pet.clean}%"></div></div><span>${pet.clean}%</span></div>
        </div>
        <div class="pet-actions-grid">
            <div class="pet-action-btn" data-act="feed"><div class="pet-act-icon">🍖</div>ให้อาหาร</div>
            <div class="pet-action-btn" data-act="play"><div class="pet-act-icon">🎾</div>เล่นด้วย</div>
            <div class="pet-action-btn" data-act="sleep"><div class="pet-act-icon">💤</div>พักนอน</div>
            <div class="pet-action-btn" data-act="bath"><div class="pet-act-icon">🛁</div>อาบน้ำ</div>
            <div class="pet-action-btn" data-act="hug"><div class="pet-act-icon">🤗</div>กอด</div>
            <div class="pet-action-btn" data-act="release" style="border-color:#ff9999;background:rgba(255,150,150,0.2)"><div class="pet-act-icon">👋</div>ปล่อย</div>
        </div>
    </div>`;

    container.querySelectorAll('.pet-action-btn[data-act]').forEach(btn => {
        btn.addEventListener('click', () => doPetAction(btn.getAttribute('data-act'), container));
    });

    startPetTick();
}

function doPetAction(action, container) {
    const pet = state.globalPet;
    let speech = '';
    let moodKey = 'happy';

    switch (action) {
        case 'feed':
            pet.hunger = Math.min(100, pet.hunger + 30);
            pet.happy = Math.min(100, pet.happy + 5);
            speech = ['อร่อยมาก! 😋', 'ขอบคุณสำหรับอาหารนะ~ 🍖', 'อิ่มแล้ว 🥰'][Math.floor(Math.random() * 3)];
            moodKey = 'excited';
            break;
        case 'play':
            pet.happy = Math.min(100, pet.happy + 25);
            pet.energy = Math.max(0, pet.energy - 10);
            pet.hunger = Math.max(0, pet.hunger - 10);
            speech = PET_SPEECHES.excited[Math.floor(Math.random() * PET_SPEECHES.excited.length)];
            moodKey = 'excited';
            break;
        case 'sleep':
            pet.energy = Math.min(100, pet.energy + 40);
            speech = PET_SPEECHES.tired[0];
            moodKey = 'tired';
            break;
        case 'bath':
            pet.clean = Math.min(100, pet.clean + 40);
            pet.happy = Math.min(100, pet.happy + 10);
            speech = ['สดชื่นมาก! 🛁', 'หอมหวลเลย~ ✨', 'ชอบอาบน้ำ!'][Math.floor(Math.random() * 3)];
            break;
        case 'hug':
            pet.happy = Math.min(100, pet.happy + 15);
            speech = ['อบอุ่นใจมาก 🤗', 'รักเจ้านายด้วย 💕', 'กอดอีกได้ไหม~'][Math.floor(Math.random() * 3)];
            moodKey = 'happy';
            break;
        case 'release':
            if (confirm(`แน่ใจที่จะปล่อย${pet.name}ไป?`)) {
                state.globalPet = { type: null, name: '', hunger: 80, happy: 75, energy: 70, clean: 90, mood: '😊', speech: '' };
                clearInterval(petTickInterval);
                buildPet(container);
                return;
            }
            return;
    }

    pet.speech = speech;
    updatePetUI();
}

function updatePetUI() {
    const pet = state.globalPet;
    const sp = document.getElementById('pet-speech');
    if (sp) sp.textContent = pet.speech;

    const stats = { hunger: pet.hunger, happy: pet.happy, energy: pet.energy, clean: pet.clean };
    for (const [key, val] of Object.entries(stats)) {
        const bar = document.getElementById(`pet-${key}`);
        if (bar) { bar.style.width = val + '%'; bar.parentElement.nextSibling.textContent = val + '%'; }
    }
}

function startPetTick() {
    clearInterval(petTickInterval);
    petTickInterval = setInterval(() => {
        const pet = state.globalPet;
        if (!pet.type) return;
        pet.hunger = Math.max(0, pet.hunger - 2);
        pet.happy = Math.max(0, pet.happy - 1);
        pet.energy = Math.max(0, pet.energy - 1);
        pet.clean = Math.max(0, pet.clean - 1);

        // Determine mood speech
        if (pet.hunger < 30) pet.speech = PET_SPEECHES.hungry[Math.floor(Math.random() * PET_SPEECHES.hungry.length)];
        else if (pet.energy < 30) pet.speech = PET_SPEECHES.tired[Math.floor(Math.random() * PET_SPEECHES.tired.length)];
        else if (pet.happy < 30) pet.speech = PET_SPEECHES.bored[Math.floor(Math.random() * PET_SPEECHES.bored.length)];
        else pet.speech = PET_SPEECHES.happy[Math.floor(Math.random() * PET_SPEECHES.happy.length)];

        updatePetUI();
    }, 30000); // every 30s
}

// ===== NOTES =====
function buildNotes(container, cs) {
    container.style.background = '#f9f5ef';
    const notes = cs.notes;

    container.innerHTML = `
    <div id="app-notes" style="min-height:100%;overflow-y:auto;">
        <div class="notes-header">
            <div class="notes-header-title">📝 บันทึก</div>
            <button class="notes-add-btn" id="notes-add">+</button>
        </div>
        <div class="notes-list" id="notes-list"></div>
        <div class="note-editor" id="note-editor">
            <div class="note-editor-header">
                <button id="note-back">‹</button>
                <button class="note-editor-save" id="note-save">บันทึก</button>
                <button class="note-editor-delete" id="note-delete">🗑️</button>
            </div>
            <input class="note-title-input" id="note-title-input" placeholder="หัวเรื่อง..." />
            <textarea class="note-body-input" id="note-body-input" placeholder="เขียนบันทึกของคุณ..."></textarea>
        </div>
    </div>`;

    renderNotesList(notes);
    bindNotesEvents(notes, container);
}

function renderNotesList(notes) {
    const list = document.getElementById('notes-list');
    if (!list) return;
    if (notes.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:40px;color:#999;font-family:'Segoe UI',sans-serif;">ยังไม่มีบันทึก กด + เพื่อเพิ่ม</div>`;
        return;
    }
    list.innerHTML = notes.map((n, i) => `
        <div class="note-card" data-note="${i}">
            <div class="note-card-title">${n.title || 'ไม่มีหัวเรื่อง'}</div>
            <div class="note-card-preview">${n.body?.substring(0, 80) || ''}${n.body?.length > 80 ? '...' : ''}</div>
            <div class="note-card-date">${n.date || ''}</div>
        </div>`).join('');
    list.querySelectorAll('.note-card[data-note]').forEach(el => {
        el.addEventListener('click', () => openNoteEditor(parseInt(el.getAttribute('data-note')), notes));
    });
}

function openNoteEditor(idx, notes, isNew = false) {
    const editor = document.getElementById('note-editor');
    editor.classList.add('open');
    editor.setAttribute('data-note-idx', idx);
    if (isNew) {
        document.getElementById('note-title-input').value = '';
        document.getElementById('note-body-input').value = '';
    } else {
        const n = notes[idx];
        document.getElementById('note-title-input').value = n.title || '';
        document.getElementById('note-body-input').value = n.body || '';
    }
    document.getElementById('note-title-input').focus();
}

function bindNotesEvents(notes, container) {
    document.getElementById('notes-add')?.addEventListener('click', () => {
        const charId = getCharId();
        const cs = charState(charId);
        cs.notes.push({ id: 'n' + Date.now(), title: '', body: '', date: formatDate() });
        openNoteEditor(cs.notes.length - 1, cs.notes, true);
    });
    document.getElementById('note-back')?.addEventListener('click', () => {
        document.getElementById('note-editor').classList.remove('open');
        const charId = getCharId();
        renderNotesList(charState(charId).notes);
    });
    document.getElementById('note-save')?.addEventListener('click', () => {
        const charId = getCharId();
        const cs = charState(charId);
        const idx = parseInt(document.getElementById('note-editor').getAttribute('data-note-idx'));
        if (cs.notes[idx] !== undefined) {
            cs.notes[idx].title = document.getElementById('note-title-input').value.trim() || 'ไม่มีหัวเรื่อง';
            cs.notes[idx].body = document.getElementById('note-body-input').value;
            cs.notes[idx].date = formatDate();
        }
        document.getElementById('note-editor').classList.remove('open');
        renderNotesList(cs.notes);
        showToast('📝', 'บันทึก', 'บันทึกเรียบร้อย!');
    });
    document.getElementById('note-delete')?.addEventListener('click', () => {
        if (!confirm('ลบบันทึกนี้?')) return;
        const charId = getCharId();
        const cs = charState(charId);
        const idx = parseInt(document.getElementById('note-editor').getAttribute('data-note-idx'));
        cs.notes.splice(idx, 1);
        document.getElementById('note-editor').classList.remove('open');
        renderNotesList(cs.notes);
    });
}

// ===== CALL SYSTEM =====
let callTimer = null;
let callSec = 0;

function startCall(app, data) {
    const screenId = `${app}-call-screen`;
    const screen = document.getElementById(screenId);
    if (!screen) return;
    const name = data.callName || (app === 'ig' ? document.getElementById('ig-dm-chat-name')?.textContent : document.getElementById('line-chat-name')?.textContent) || 'ชื่อ';
    const avatar = data.callAvatar || '👤';
    screen.classList.add('open');
    const nameEl = document.getElementById(`${app}-call-name`);
    const avatarEl = document.getElementById(`${app}-call-avatar`);
    const statusEl = document.getElementById(`${app}-call-status`) || document.querySelector(`#${screenId} .call-status`);
    const durEl = document.getElementById(`${app}-call-dur`);
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.textContent = avatar;
    if (statusEl) statusEl.textContent = 'กำลังโทร...';
    callSec = 0;
    if (durEl) durEl.textContent = '';
    clearInterval(callTimer);
    setTimeout(() => {
        if (statusEl) statusEl.textContent = 'กำลังรับสาย';
        callTimer = setInterval(() => {
            callSec++;
            const m = Math.floor(callSec / 60);
            const s = callSec % 60;
            if (durEl) durEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }, 2000);
}

function endCall(screenId) {
    clearInterval(callTimer);
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.remove('open');
}

// ===== NOTIFICATION ENGINE =====
function startNotificationEngine() {
    // Random notifications from char every few minutes
    setInterval(() => {
        const charId = getCharId();
        if (!charId || charId === '__default__') return;
        const cs = charState(charId);
        const rand = Math.random();
        if (rand < 0.33) {
            const ctx = getContext();
            const name = ctx?.name2 || 'ตัวละคร';
            const msgs = ['ส่งข้อความมาใน LINE', 'ถูกใจรูปของคุณใน Instagram', 'โพสต์ทวีตใหม่', 'ส่ง DM มาหาคุณ'];
            const icons = ['💬', '📸', '𝕏', '📱'];
            const apps = ['LINE', 'Instagram', 'Twitter', 'Instagram'];
            const idx = Math.floor(Math.random() * msgs.length);
            showToast(icons[idx], `${apps[idx]}`, `${name} ${msgs[idx]}`);
            document.getElementById('fab-badge')?.classList.add('active');
        }
    }, 90000); // every 90s
}

function showToast(icon, app, msg) {
    document.getElementById('toast-icon').textContent = icon;
    document.getElementById('toast-app').textContent = app;
    document.getElementById('toast-msg').textContent = msg;
    const toast = document.getElementById('phone-notif-toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== CONTEXT WATCH =====
// Watch for character changes
let lastCharId = null;
setInterval(() => {
    const currentId = getCharId();
    if (currentId !== lastCharId) {
        lastCharId = currentId;
        state.currentCharId = currentId;
        // Reset badge
        document.getElementById('fab-badge')?.classList.remove('active');
    }
}, 2000);
