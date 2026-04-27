// ===== TWITTER FULL MODULE =====
export function buildTwitterFull(container, cs, helpers) {
    const { getCharId, charState, formatTime, showToast } = helpers;
    const tw = cs.twitter;
    container.style.background = '#000';

    container.innerHTML = `
    <div id="app-twitter" style="min-height:100%;overflow-y:auto;position:relative;">
        <!-- Tab bar -->
        <div style="display:flex;border-bottom:1px solid #1e1e1e;background:#000;position:sticky;top:0;z-index:3;">
            <div style="flex:1;padding:12px;text-align:center;cursor:pointer;color:white;font-family:'Segoe UI',sans-serif;font-size:13px;font-weight:700;border-bottom:2px solid #1da1f2;" id="tw-tab-home">หน้าหลัก</div>
            <div style="flex:1;padding:12px;text-align:center;cursor:pointer;color:#6e767d;font-family:'Segoe UI',sans-serif;font-size:13px;" id="tw-tab-search">🔍 ค้นหา</div>
            <div style="flex:1;padding:12px;text-align:center;cursor:pointer;color:#6e767d;font-family:'Segoe UI',sans-serif;font-size:13px;" id="tw-tab-notif">🔔</div>
            <div style="flex:1;padding:12px;text-align:center;cursor:pointer;color:#6e767d;font-family:'Segoe UI',sans-serif;font-size:13px;" id="tw-tab-msg">✉️</div>
        </div>
        <div id="tw-feed"></div>
        <button class="tw-compose-btn" id="tw-compose-open">✏️</button>
        <!-- Compose overlay -->
        <div class="tw-compose-overlay" id="tw-compose-overlay">
            <div class="tw-compose-header">
                <button id="tw-compose-close" style="color:white;background:none;border:none;font-size:18px;cursor:pointer;">✕</button>
                <button class="tw-compose-post-btn" id="tw-compose-post">โพสต์</button>
            </div>
            <div class="tw-compose-body">
                <div class="tw-avatar">🤳</div>
                <div style="flex:1;display:flex;flex-direction:column;gap:12px;">
                    <textarea id="tw-compose-text" placeholder="มีอะไรอยู่ในใจ?" rows="5" style="flex:1;background:none;border:none;outline:none;color:white;font-size:16px;resize:none;font-family:'Segoe UI',sans-serif;"></textarea>
                    <div style="display:flex;gap:14px;color:#1da1f2;font-size:18px;">
                        <span style="cursor:pointer;" title="รูปภาพ">🖼️</span>
                        <span style="cursor:pointer;" title="GIF">📊</span>
                        <span style="cursor:pointer;" title="โพล">📊</span>
                        <span style="cursor:pointer;" title="อิโมจิ">😊</span>
                        <span style="margin-left:auto;color:#666;font-size:13px;font-family:'Segoe UI',sans-serif;" id="tw-char-count">280</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    renderTwitterFeedFull(tw, helpers);
    bindTwitterFullEvents(tw, helpers);
}

function renderTwitterFeedFull(tw, helpers) {
    const { showToast, getCharId, charState, formatTime } = helpers;
    const feed = document.getElementById('tw-feed');
    if (!feed) return;

    feed.innerHTML = tw.tweets.slice().reverse().map(t => `
        <div class="tw-tweet" data-tid="${t.id}">
            <div class="tw-avatar" data-tw-profile="${t.user}" style="cursor:pointer;">${t.avatar}</div>
            <div class="tw-tweet-content">
                <div class="tw-tweet-header">
                    <span class="tw-tweet-name" data-tw-profile="${t.user}" style="cursor:pointer;">${t.user}</span>
                    <span class="tw-tweet-handle">${t.handle}</span>
                    <span class="tw-tweet-handle">· ${t.time || ''}</span>
                    <span style="margin-left:auto;color:#6e767d;cursor:pointer;">⋯</span>
                </div>
                <div class="tw-tweet-text">${t.text}</div>
                ${t.image ? `<div style="width:100%;border-radius:14px;overflow:hidden;margin-bottom:10px;font-size:48px;background:#1a1a1a;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;">${t.image}</div>` : ''}
                <div class="tw-tweet-actions">
                    <span class="tw-action-btn tw-reply-btn" data-t="${t.id}" style="gap:4px;display:flex;align-items:center;">
                        <span>💬</span> <span>${t.replies}</span>
                    </span>
                    <span class="tw-action-btn tw-rt-btn" data-t="${t.id}" style="gap:4px;display:flex;align-items:center;${t.retweeted ? 'color:#00ba7c;' : ''}">
                        <span>🔄</span> <span>${t.retweets}</span>
                    </span>
                    <span class="tw-action-btn tw-like-btn" data-t="${t.id}" style="gap:4px;display:flex;align-items:center;${t.liked ? 'color:#f91880;' : ''}">
                        <span>${t.liked ? '❤️' : '♥'}</span> <span>${t.likes}</span>
                    </span>
                    <span class="tw-action-btn" style="cursor:pointer;">📊</span>
                    <span class="tw-action-btn" style="cursor:pointer;">📤</span>
                </div>
            </div>
        </div>`).join('');

    // Like
    feed.querySelectorAll('.tw-like-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const t = tw.tweets.find(t => t.id === btn.getAttribute('data-t'));
            if (!t) return;
            t.liked = !t.liked;
            t.likes += t.liked ? 1 : -1;
            renderTwitterFeedFull(tw, helpers);
        });
    });

    // Retweet
    feed.querySelectorAll('.tw-rt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const t = tw.tweets.find(t => t.id === btn.getAttribute('data-t'));
            if (!t) return;
            t.retweeted = !t.retweeted;
            t.retweets += t.retweeted ? 1 : -1;
            renderTwitterFeedFull(tw, helpers);
            if (t.retweeted) showToast('𝕏', 'Twitter', 'รีทวีตแล้ว!');
        });
    });

    // Reply
    feed.querySelectorAll('.tw-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tweetId = btn.getAttribute('data-t');
            const tweet = tw.tweets.find(t => t.id === tweetId);
            const overlay = document.getElementById('tw-compose-overlay');
            overlay.classList.add('open');
            document.getElementById('tw-compose-text').value = `@${tweet?.user || ''} `;
            document.getElementById('tw-compose-text').setAttribute('data-reply-to', tweetId);
        });
    });
}

function bindTwitterFullEvents(tw, helpers) {
    const { formatTime, showToast, getCharId, charState } = helpers;

    document.getElementById('tw-compose-open')?.addEventListener('click', () => {
        document.getElementById('tw-compose-overlay').classList.add('open');
        document.getElementById('tw-compose-text').removeAttribute('data-reply-to');
    });
    document.getElementById('tw-compose-close')?.addEventListener('click', () => {
        document.getElementById('tw-compose-overlay').classList.remove('open');
    });

    // Character count
    document.getElementById('tw-compose-text')?.addEventListener('input', e => {
        const remaining = 280 - e.target.value.length;
        const el = document.getElementById('tw-char-count');
        if (el) { el.textContent = remaining; el.style.color = remaining < 20 ? '#ff4444' : '#666'; }
    });

    document.getElementById('tw-compose-post')?.addEventListener('click', () => {
        const text = document.getElementById('tw-compose-text').value.trim();
        if (!text) return;
        const charId = getCharId();
        const cs = charState(charId);
        const replyTo = document.getElementById('tw-compose-text').getAttribute('data-reply-to');
        const newTweet = {
            id: 'tu' + Date.now(), user: 'คุณ', handle: '@you',
            avatar: '🤳', text, likes: 0, retweets: 0, replies: 0,
            liked: false, retweeted: false, time: formatTime(new Date()), image: null
        };
        cs.twitter.tweets.push(newTweet);
        if (replyTo) {
            const parent = cs.twitter.tweets.find(t => t.id === replyTo);
            if (parent) parent.replies++;
        }
        document.getElementById('tw-compose-text').value = '';
        document.getElementById('tw-compose-overlay').classList.remove('open');
        renderTwitterFeedFull(cs.twitter, helpers);
        showToast('𝕏', 'Twitter', 'โพสต์ทวีตแล้ว!');
        // NPC engagement
        setTimeout(() => {
            newTweet.likes += Math.floor(Math.random() * 3) + 1;
            const npcName = cs.twitter.tweets.find(t => t.user !== 'คุณ')?.user || 'ตัวละคร';
            showToast('𝕏', 'Twitter', `${npcName} ถูกใจทวีตของคุณ`);
            renderTwitterFeedFull(cs.twitter, helpers);
        }, 5000);
        setTimeout(() => {
            const npcName = cs.twitter.tweets.find(t => t.user !== 'คุณ')?.user || 'ตัวละคร';
            const npcAvatar = cs.twitter.tweets.find(t => t.user === npcName)?.avatar || '🌟';
            const npcReplies = ['เห็นด้วย! 👍', 'ฮ่าๆ 😂', 'จริงมากเลย!', '🔥', 'น่ารักมาก~'];
            cs.twitter.tweets.push({
                id: 'tnpc' + Date.now(), user: npcName, handle: `@${npcName.toLowerCase().replace(/\s/g,'')}`,
                avatar: npcAvatar, text: `@you ${npcReplies[Math.floor(Math.random() * npcReplies.length)]}`,
                likes: 0, retweets: 0, replies: 0, liked: false, retweeted: false, time: formatTime(new Date())
            });
            newTweet.replies++;
            renderTwitterFeedFull(cs.twitter, helpers);
        }, 10000);
    });
}

// ===== TIKTOK FULL MODULE =====
export function buildTikTokFull(container, cs, helpers) {
    const { showToast, formatTime, getCharId, charState } = helpers;
    const tiktok = cs.tiktok;

    container.style.background = '#000';
    container.style.overflow = 'hidden';
    container.innerHTML = `
    <div id="app-tiktok" style="height:100%;overflow:hidden;position:relative;">
        <div class="tiktok-topbar">
            <span style="cursor:pointer;color:rgba(255,255,255,0.6);font-family:'Segoe UI',sans-serif;font-size:14px;">ติดตาม</span>
            <span style="cursor:pointer;color:white;font-family:'Segoe UI',sans-serif;font-size:15px;font-weight:700;border-bottom:2px solid white;padding-bottom:2px;">สำหรับคุณ</span>
            <span style="cursor:pointer;" id="tiktok-search-icon">🔍</span>
        </div>
        <div class="tiktok-video-container" id="tiktok-videos"></div>
        <div class="tiktok-compose-bar">
            <div style="font-size:20px;color:rgba(255,255,255,0.7);">🤳</div>
            <input type="text" placeholder="เพิ่มความคิดเห็น..." id="tiktok-comment-input" />
            <button id="tiktok-comment-send" style="background:none;border:none;color:#1da1f2;font-size:14px;font-weight:600;font-family:'Segoe UI',sans-serif;cursor:pointer;">ส่ง</button>
            <span style="font-size:22px;cursor:pointer;color:white;" id="tiktok-upload">➕</span>
        </div>
    </div>`;

    renderTikTokFeedFull(tiktok, helpers);
    bindTikTokFullEvents(tiktok, helpers);
}

function renderTikTokFeedFull(tiktok, helpers) {
    const { showToast, getCharId, charState } = helpers;
    const cont = document.getElementById('tiktok-videos');
    if (!cont) return;

    const bgColors = ['linear-gradient(180deg,#1a1a2e,#302b63)', 'linear-gradient(180deg,#0f2027,#203a43,#2c5364)', 'linear-gradient(180deg,#200122,#6f0000)', 'linear-gradient(180deg,#093028,#237a57)', 'linear-gradient(180deg,#373b44,#4286f4)'];
    cont.innerHTML = tiktok.videos.map((v, i) => `
        <div class="tiktok-video-item" data-vid="${v.id}" style="background:${bgColors[i % bgColors.length]}">
            <div class="tiktok-video-bg" style="opacity:0.8;">${v.emoji}</div>
            <div class="tiktok-overlay">
                <div class="tiktok-user">@${v.user}</div>
                <div class="tiktok-desc">${v.desc}</div>
                <div class="tiktok-music">🎵 เพลงต้นฉบับ · ${v.user}</div>
            </div>
            <div class="tiktok-actions">
                <div class="tiktok-action-item">
                    <div class="tiktok-avatar-ring">${v.avatar}</div>
                    <div class="tiktok-action-label">+</div>
                </div>
                <div class="tiktok-action-item tiktok-like-action" data-v="${v.id}" style="cursor:pointer;">
                    <span style="font-size:30px;">${v.likedByUser ? '❤️' : '🤍'}</span>
                    <div class="tiktok-action-label">${v.likes.toLocaleString()}</div>
                </div>
                <div class="tiktok-action-item" data-comment="${v.id}" style="cursor:pointer;">
                    <span style="font-size:28px;">💬</span>
                    <div class="tiktok-action-label">${v.comments}</div>
                </div>
                <div class="tiktok-action-item" style="cursor:pointer;">
                    <span style="font-size:28px;">↗️</span>
                    <div class="tiktok-action-label">${v.shares}</div>
                </div>
                <div class="tiktok-action-item" style="cursor:pointer;">
                    <span style="font-size:28px;animation:spin 3s linear infinite;">💿</span>
                </div>
            </div>
            <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.1);">
                <div style="height:100%;background:rgba(255,255,255,0.6);width:${Math.random()*100}%;transition:width 0.5s;"></div>
            </div>
        </div>`).join('');

    cont.querySelectorAll('.tiktok-like-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const charId = getCharId();
            const cs = charState(charId);
            const vid = cs.tiktok.videos.find(v => v.id === btn.getAttribute('data-v'));
            if (!vid) return;
            vid.likedByUser = !vid.likedByUser;
            vid.likes += vid.likedByUser ? 1 : -1;
            renderTikTokFeedFull(cs.tiktok, helpers);
        });
    });
}

function bindTikTokFullEvents(tiktok, helpers) {
    const { showToast, formatTime, getCharId, charState } = helpers;
    document.getElementById('tiktok-comment-send')?.addEventListener('click', () => {
        const input = document.getElementById('tiktok-comment-input');
        if (!input?.value.trim()) return;
        showToast('🎵', 'TikTok', 'ส่งคอมเมนต์แล้ว: ' + input.value);
        input.value = '';
    });
    document.getElementById('tiktok-upload')?.addEventListener('click', () => {
        const desc = prompt('คำอธิบายคลิปของคุณ:');
        if (!desc?.trim()) return;
        const charId = getCharId();
        const cs = charState(charId);
        const emojis = ['🌟', '🎵', '😂', '✨', '🔥', '💕', '🌸', '🎉', '🤩', '💃'];
        cs.tiktok.videos.unshift({
            id: 'v' + Date.now(), user: 'คุณ', avatar: '🤳',
            desc, emoji: emojis[Math.floor(Math.random() * emojis.length)],
            likes: 0, comments: 0, shares: 0, likedByUser: false
        });
        renderTikTokFeedFull(cs.tiktok, helpers);
        showToast('🎵', 'TikTok', 'อัปโหลดคลิปสำเร็จ!');
        // NPC engagement
        setTimeout(() => {
            const vid = cs.tiktok.videos[0];
            if (vid) { vid.likes += Math.floor(Math.random() * 50) + 5; renderTikTokFeedFull(cs.tiktok, helpers); }
            showToast('🎵', 'TikTok', 'คลิปของคุณได้รับยอดไลก์แล้ว!');
        }, 5000);
    });
}

// ===== BANK FULL MODULE =====
export function buildBankFull(container, cs, helpers) {
    const { formatTime, showToast, getCharId, charState } = helpers;
    const bank = cs.bank;
    container.style.background = '#f0f4f8';

    const balance = bank.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const income = bank.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = bank.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

    container.innerHTML = `
    <div id="app-bank" style="min-height:100%;overflow-y:auto;position:relative;">
        <div class="bank-header" style="padding-bottom:60px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <div class="bank-header-title">บัญชีออมทรัพย์</div>
                <span style="color:rgba(255,255,255,0.8);font-size:20px;cursor:pointer;" id="bank-notif">🔔</span>
            </div>
            <div class="bank-balance">฿${balance}</div>
            <div class="bank-balance-sub">ยอดเงินคงเหลือ</div>
            <div style="display:flex;gap:20px;margin-top:12px;">
                <div style="color:rgba(255,255,255,0.9);font-size:12px;font-family:'Segoe UI',sans-serif;">
                    <div style="opacity:0.7;">รายรับเดือนนี้</div>
                    <div style="font-weight:700;font-size:14px;">+฿${income.toLocaleString('th-TH', {minimumFractionDigits:2})}</div>
                </div>
                <div style="color:rgba(255,255,255,0.9);font-size:12px;font-family:'Segoe UI',sans-serif;">
                    <div style="opacity:0.7;">รายจ่ายเดือนนี้</div>
                    <div style="font-weight:700;font-size:14px;">-฿${expense.toLocaleString('th-TH', {minimumFractionDigits:2})}</div>
                </div>
            </div>
        </div>

        <div class="bank-card" style="margin-top:-30px;">
            <div class="bank-quick-actions">
                <div class="bank-qa-btn" id="bank-transfer-btn">
                    <div class="bank-qa-icon">💸</div>
                    <div class="bank-qa-label">โอนเงิน</div>
                </div>
                <div class="bank-qa-btn" id="bank-topup-btn">
                    <div class="bank-qa-icon">➕</div>
                    <div class="bank-qa-label">เติมเงิน</div>
                </div>
                <div class="bank-qa-btn" id="bank-pay-btn">
                    <div class="bank-qa-icon">📱</div>
                    <div class="bank-qa-label">พร้อมเพย์</div>
                </div>
                <div class="bank-qa-btn" id="bank-slip-btn">
                    <div class="bank-qa-icon">📋</div>
                    <div class="bank-qa-label">สลิป</div>
                </div>
            </div>
        </div>

        <!-- Summary chart placeholder -->
        <div style="margin:12px 16px;background:white;border-radius:16px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="font-weight:700;font-size:13px;color:#333;font-family:'Segoe UI',sans-serif;margin-bottom:12px;">รายรับ-รายจ่าย เดือนนี้</div>
            <div style="display:flex;gap:8px;height:60px;align-items:flex-end;">
                ${['จ','อ','พ','พฤ','ศ','ส','อา'].map((d,i) => {
                    const h = Math.floor(Math.random() * 80) + 20;
                    const isRed = Math.random() > 0.5;
                    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">
                        <div style="width:100%;height:${h}%;background:${isRed ? '#ff6b6b' : '#00d2ff'};border-radius:4px 4px 0 0;min-height:6px;"></div>
                        <div style="font-size:9px;color:#999;font-family:'Segoe UI',sans-serif;">${d}</div>
                    </div>`;
                }).join('')}
            </div>
            <div style="display:flex;gap:14px;margin-top:10px;">
                <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#666;font-family:'Segoe UI',sans-serif;"><div style="width:10px;height:10px;border-radius:2px;background:#00d2ff;"></div>รายรับ</div>
                <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#666;font-family:'Segoe UI',sans-serif;"><div style="width:10px;height:10px;border-radius:2px;background:#ff6b6b;"></div>รายจ่าย</div>
            </div>
        </div>

        <div class="bank-section-title">รายการล่าสุด</div>
        <div id="bank-tx-list"></div>

        <!-- Transfer modal -->
        <div class="bank-transfer-modal" id="bank-transfer-modal">
            <div class="bank-transfer-modal-header">
                <span id="bank-modal-back" style="cursor:pointer;font-size:22px;margin-right:8px;">‹</span>
                โอนเงิน
            </div>
            <div class="bank-transfer-modal-body">
                <div style="background:#f0f4f8;border-radius:12px;padding:12px;margin-bottom:12px;">
                    <div style="font-size:11px;color:#666;font-family:'Segoe UI',sans-serif;">ยอดคงเหลือ</div>
                    <div style="font-size:20px;font-weight:700;color:#005baa;font-family:'Segoe UI',sans-serif;">฿${balance}</div>
                </div>
                <div class="bank-input-group">
                    <label>ธนาคารปลายทาง</label>
                    <select id="bank-to-bank" style="border:1px solid #ddd;border-radius:10px;padding:12px 14px;font-size:14px;outline:none;font-family:'Segoe UI',sans-serif;width:100%;background:white;">
                        <option>กสิกรไทย (KBank)</option>
                        <option>ไทยพาณิชย์ (SCB)</option>
                        <option>กรุงไทย (KTB)</option>
                        <option>กรุงเทพ (BBL)</option>
                        <option>ทหารไทยธนชาต (ttb)</option>
                        <option>ออมสิน</option>
                        <option>พร้อมเพย์</option>
                    </select>
                </div>
                <div class="bank-input-group">
                    <label>เลขบัญชี / เบอร์พร้อมเพย์</label>
                    <input type="text" id="bank-to-acc" placeholder="xxx-x-xxxxx-x หรือ 0xx-xxx-xxxx" />
                </div>
                <div class="bank-input-group">
                    <label>ชื่อผู้รับ</label>
                    <input type="text" id="bank-to-name" placeholder="ชื่อ-นามสกุลผู้รับ" />
                </div>
                <div class="bank-input-group">
                    <label>จำนวนเงิน (บาท)</label>
                    <input type="number" id="bank-amount" placeholder="0.00" min="1" />
                </div>
                <div class="bank-input-group">
                    <label>หมายเหตุ (ไม่บังคับ)</label>
                    <input type="text" id="bank-note" placeholder="ค่าอาหาร, ค่าเช่า..." />
                </div>
            </div>
            <button class="bank-confirm-btn" id="bank-confirm-transfer">ยืนยันการโอนเงิน ›</button>
        </div>

        <!-- Slip view -->
        <div id="bank-slip-view" style="display:none;position:absolute;inset:0;background:#f0f4f8;z-index:5;overflow-y:auto;">
            <div style="padding:14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #ddd;background:white;">
                <span id="bank-slip-back" style="cursor:pointer;font-size:22px;">‹</span>
                <span style="font-weight:700;font-size:15px;font-family:'Segoe UI',sans-serif;">สลิปรายการย้อนหลัง</span>
            </div>
            <div id="bank-slip-list" style="padding:12px;display:flex;flex-direction:column;gap:10px;"></div>
        </div>
    </div>`;

    renderBankTxFull(bank);
    bindBankFullEvents(bank, helpers);
}

function renderBankTxFull(bank) {
    const list = document.getElementById('bank-tx-list');
    if (!list) return;
    list.innerHTML = bank.transactions.slice().reverse().map(tx => `
        <div class="bank-tx-item" style="cursor:pointer;" data-tx="${tx.id}">
            <div class="bank-tx-icon" style="background:${tx.bg || '#f0f4f8'};">${tx.emoji || '💳'}</div>
            <div class="bank-tx-info">
                <div class="bank-tx-name">${tx.name}</div>
                <div class="bank-tx-date">${tx.date}</div>
            </div>
            <div class="bank-tx-amount ${tx.type}">${tx.type === 'income' ? '+' : ''}฿${Math.abs(tx.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
        </div>`).join('');
}

function bindBankFullEvents(bank, helpers) {
    const { formatTime, showToast, getCharId, charState } = helpers;

    document.getElementById('bank-transfer-btn')?.addEventListener('click', () => {
        document.getElementById('bank-transfer-modal').classList.add('open');
    });
    document.getElementById('bank-modal-back')?.addEventListener('click', () => {
        document.getElementById('bank-transfer-modal').classList.remove('open');
    });
    document.getElementById('bank-confirm-transfer')?.addEventListener('click', () => {
        const name = document.getElementById('bank-to-name').value.trim() || 'ผู้รับ';
        const amount = parseFloat(document.getElementById('bank-amount').value) || 0;
        const bankName = document.getElementById('bank-to-bank').value;
        const note = document.getElementById('bank-note').value.trim();
        if (amount <= 0) { alert('กรุณาระบุจำนวนเงินที่ถูกต้อง'); return; }
        if (amount > bank.balance) { alert('ยอดเงินไม่เพียงพอ'); return; }
        bank.balance -= amount;
        bank.transactions.push({
            id: 'tx' + Date.now(), name: `โอนไปยัง ${name}${note ? ` (${note})` : ''}`,
            amount: -amount, type: 'expense', date: helpers.formatDate ? helpers.formatDate() : new Date().toLocaleDateString('th-TH'),
            emoji: '💸', bg: '#fce4ec'
        });
        document.getElementById('bank-transfer-modal').classList.remove('open');
        const charId = getCharId();
        buildBankFull(document.getElementById('phone-app-body'), charState(charId), helpers);
        showToast('🏦', 'ธนาคาร', `โอนเงิน ฿${amount.toLocaleString()} ไปยัง ${name} (${bankName}) สำเร็จ`);
    });

    document.getElementById('bank-topup-btn')?.addEventListener('click', () => {
        const amount = parseFloat(prompt('เติมเงินจำนวน (บาท):') || '0');
        if (amount > 0) {
            bank.balance += amount;
            bank.transactions.push({
                id: 'tx' + Date.now(), name: 'รับเงิน / เติมเงิน',
                amount, type: 'income', date: helpers.formatDate ? helpers.formatDate() : new Date().toLocaleDateString('th-TH'),
                emoji: '💰', bg: '#e8f5e9'
            });
            const charId = getCharId();
            buildBankFull(document.getElementById('phone-app-body'), charState(charId), helpers);
            showToast('🏦', 'ธนาคาร', `เติมเงิน ฿${amount.toLocaleString()} สำเร็จ`);
        }
    });

    document.getElementById('bank-pay-btn')?.addEventListener('click', () => {
        const amount = parseFloat(prompt('จำนวนเงินที่ต้องการรับ:') || '0');
        if (amount > 0) showToast('🏦', 'ธนาคาร', `QR พร้อมเพย์ ฿${amount.toLocaleString()} พร้อมแล้ว`);
    });

    document.getElementById('bank-slip-btn')?.addEventListener('click', () => {
        const view = document.getElementById('bank-slip-view');
        view.style.display = 'block';
        const list = document.getElementById('bank-slip-list');
        list.innerHTML = bank.transactions.slice().reverse().map(tx => `
            <div style="background:white;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <div style="text-align:center;margin-bottom:12px;">
                    <div style="font-size:28px;">${tx.emoji}</div>
                    <div style="font-size:11px;color:#888;font-family:'Segoe UI',sans-serif;">${tx.date}</div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="color:#666;font-size:12px;font-family:'Segoe UI',sans-serif;">รายการ</span>
                    <span style="font-size:12px;font-weight:600;font-family:'Segoe UI',sans-serif;">${tx.name}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                    <span style="color:#666;font-size:12px;font-family:'Segoe UI',sans-serif;">จำนวน</span>
                    <span style="font-size:14px;font-weight:700;color:${tx.type === 'income' ? '#00a020' : '#d00'};font-family:'Segoe UI',sans-serif;">${tx.type === 'income' ? '+' : ''}฿${Math.abs(tx.amount).toLocaleString('th-TH', {minimumFractionDigits:2})}</span>
                </div>
            </div>`).join('');
    });
    document.getElementById('bank-slip-back')?.addEventListener('click', () => {
        document.getElementById('bank-slip-view').style.display = 'none';
    });
}
