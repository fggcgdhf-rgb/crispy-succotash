// ===== LINE FULL MODULE =====

export function buildLineFull(container, cs, helpers) {
    const { getCharId, charState, formatTime, showToast, startCall, endCall } = helpers;
    const line = cs.line;

    // Seed default chat if empty
    if (Object.keys(line.chats).length === 0) {
        const ctx = typeof getContext !== 'undefined' ? getContext() : null;
        const name = ctx?.name2 || 'ตัวละคร';
        line.chats[name] = { avatar: '🌟', messages: [{ from: name, text: 'หวัดดีจ้า~ 😊', time: formatTime(new Date()), sticker: null, img: null }] };
    }

    container.style.background = '#1a1a1a';
    container.innerHTML = getLineHTML();

    renderLineChatList(line, helpers);
    bindLineHomeEvents(line, helpers);
}

function getLineHTML() {
    return `
    <div id="app-line" style="min-height:100%;display:flex;flex-direction:column;position:relative;">
        <!-- Main tab bar -->
        <div style="display:flex;border-bottom:1px solid #2a2a2a;background:#111;flex-shrink:0;">
            <div class="line-tab active" data-tab="chats" style="flex:1;padding:10px;text-align:center;cursor:pointer;font-size:11px;color:#00b300;font-family:'Segoe UI',sans-serif;border-bottom:2px solid #00b300;">💬<br>แชท</div>
            <div class="line-tab" data-tab="friends" style="flex:1;padding:10px;text-align:center;cursor:pointer;font-size:11px;color:#888;font-family:'Segoe UI',sans-serif;">👥<br>เพื่อน</div>
            <div class="line-tab" data-tab="timeline" style="flex:1;padding:10px;text-align:center;cursor:pointer;font-size:11px;color:#888;font-family:'Segoe UI',sans-serif;">📰<br>ไทม์ไลน์</div>
            <div class="line-tab" data-tab="profile" style="flex:1;padding:10px;text-align:center;cursor:pointer;font-size:11px;color:#888;font-family:'Segoe UI',sans-serif;">👤<br>โปรไฟล์</div>
        </div>

        <!-- Chat list tab -->
        <div id="line-tab-chats" style="flex:1;overflow-y:auto;">
            <div style="padding:10px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #2a2a2a;">
                <input type="text" id="line-search" placeholder="🔍 ค้นหา" style="flex:1;background:#2a2a2a;border:none;border-radius:20px;padding:8px 14px;color:white;font-size:13px;outline:none;font-family:'Segoe UI',sans-serif;" />
                <span style="color:white;font-size:20px;cursor:pointer;" id="line-new-chat">✏️</span>
            </div>
            <div id="line-chat-list"></div>
        </div>

        <!-- Friends tab -->
        <div id="line-tab-friends" style="display:none;flex:1;overflow-y:auto;">
            <div style="padding:14px;color:white;font-size:13px;font-family:'Segoe UI',sans-serif;">
                <div style="font-weight:700;margin-bottom:10px;color:#aaa;">เพื่อนทั้งหมด</div>
                <div id="line-friends-list"></div>
            </div>
        </div>

        <!-- Timeline tab -->
        <div id="line-tab-timeline" style="display:none;flex:1;overflow-y:auto;background:#f5f5f5;">
            <div style="padding:14px;text-align:center;color:#aaa;font-family:'Segoe UI',sans-serif;font-size:13px;padding-top:40px;">
                📰 ไทม์ไลน์<br><br>
                <div id="line-timeline-posts"></div>
            </div>
        </div>

        <!-- Profile tab -->
        <div id="line-tab-profile" style="display:none;flex:1;overflow-y:auto;">
            <div style="background:linear-gradient(180deg,#00b300,#006600);padding:30px 20px;text-align:center;color:white;">
                <div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 12px;">🤳</div>
                <div style="font-size:18px;font-weight:700;font-family:'Segoe UI',sans-serif;">คุณ</div>
                <div style="font-size:12px;opacity:0.8;margin-top:4px;font-family:'Segoe UI',sans-serif;">แตะเพื่อแก้ไขสถานะ</div>
            </div>
            <div style="background:white;padding:16px;">
                <div style="display:flex;justify-content:space-around;padding:10px 0;border-bottom:1px solid #eee;margin-bottom:16px;">
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;color:#1a1a1a;font-size:11px;font-family:'Segoe UI',sans-serif;">
                        <div style="width:50px;height:50px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:22px;">📷</div>
                        Keep
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;color:#1a1a1a;font-size:11px;font-family:'Segoe UI',sans-serif;">
                        <div style="width:50px;height:50px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:22px;">🎁</div>
                        Gift
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;color:#1a1a1a;font-size:11px;font-family:'Segoe UI',sans-serif;">
                        <div style="width:50px;height:50px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:22px;">🔖</div>
                        บันทึก
                    </div>
                </div>
                <div style="color:#555;font-size:13px;font-family:'Segoe UI',sans-serif;text-align:center;">LINE v${Math.floor(Math.random()*3)+13}.${Math.floor(Math.random()*9)}.0</div>
            </div>
        </div>

        <!-- === OVERLAID SCREENS === -->

        <!-- Chat screen -->
        <div id="line-chat-screen" style="display:none;position:absolute;inset:0;z-index:5;flex-direction:column;">
            <div style="background:#00b300;padding:0;display:flex;align-items:center;gap:10px;flex-shrink:0;">
                <span id="line-chat-back" style="cursor:pointer;color:white;font-size:24px;padding:12px 8px 12px 12px;line-height:1;">‹</span>
                <div id="line-chat-avatar-btn" style="cursor:pointer;display:flex;align-items:center;gap:8px;flex:1;padding:8px 0;">
                    <div class="line-chat-avatar" id="line-chat-avatar" style="width:36px;height:36px;font-size:18px;">🌟</div>
                    <div>
                        <div id="line-chat-name" style="color:white;font-weight:700;font-family:'Segoe UI',sans-serif;font-size:14px;"></div>
                        <div style="color:rgba(255,255,255,0.7);font-size:10px;font-family:'Segoe UI',sans-serif;">ออนไลน์</div>
                    </div>
                </div>
                <span style="color:white;font-size:20px;cursor:pointer;padding:12px 8px;" id="line-call-btn">📞</span>
                <span style="color:white;font-size:20px;cursor:pointer;padding:12px 12px 12px 0;" id="line-vcall-btn">📹</span>
            </div>
            <div class="line-msg-bg" id="line-messages" style="flex:1;overflow-y:auto;background-image:repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,0.03) 24px,rgba(255,255,255,0.03) 25px);"></div>
            <div class="line-msg-input-bar" style="flex-shrink:0;">
                <button class="line-icon-btn" id="line-plus-btn" style="font-size:22px;color:#00b300;">+</button>
                <button class="line-icon-btn" id="line-sticker-btn">🎭</button>
                <input type="text" id="line-msg-input" placeholder="พิมพ์ข้อความ..." />
                <button id="line-send-btn">➤</button>
            </div>
            <!-- Extra tools bar (toggle) -->
            <div id="line-extra-tools" style="display:none;background:white;padding:16px;border-top:1px solid #ddd;flex-shrink:0;">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                    ${[['📷','ถ่ายรูป'],['🖼️','อัลบั้ม'],['📍','ตำแหน่ง'],['🎵','เพลง'],['📋','Note'],['📊','Poll'],['🗓️','นัดหมาย'],['💌','Card']].map(([icon,label])=>`
                    <div class="line-tool-item" data-tool="${label}" style="display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;">
                        <div style="width:52px;height:52px;border-radius:14px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:24px;">${icon}</div>
                        <div style="font-size:10px;color:#555;font-family:'Segoe UI',sans-serif;">${label}</div>
                    </div>`).join('')}
                </div>
            </div>
        </div>

        <!-- Sticker picker -->
        <div id="line-sticker-picker" style="display:none;position:absolute;bottom:56px;left:0;right:0;background:white;border-top:1px solid #ddd;padding:14px;z-index:10;max-height:180px;overflow-y:auto;">
            <div style="font-size:12px;color:#888;margin-bottom:8px;font-family:'Segoe UI',sans-serif;">สติ๊กเกอร์</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                ${['😀','😂','🥺','😍','🎉','❤️','👍','🙏','💕','😭','🔥','✨','🎵','🤗','😴','😡','🤔','😎','🥳','😪','🤣','💯','🌟','🎊','🤩','🥰','😤','🙄','🤦','💪'].map(e => `<span class="line-sticker-opt" style="font-size:32px;cursor:pointer;transition:transform 0.1s;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'">${e}</span>`).join('')}
            </div>
        </div>

        <!-- Call screen -->
        <div class="call-screen" id="line-call-screen">
            <div class="call-screen-top">
                <div class="call-avatar-big" id="line-call-avatar">🌟</div>
                <div class="call-name" id="line-call-name">ชื่อ</div>
                <div class="call-status" id="line-call-status">กำลังโทร...</div>
                <div class="call-duration" id="line-call-dur"></div>
            </div>
            <div class="call-actions-row">
                <div class="call-btn call-btn-mute" id="line-call-mute"><div class="call-btn-circle">🔇</div><div class="call-btn-label">ปิดเสียง</div></div>
                <div class="call-btn call-btn-end" id="line-call-end"><div class="call-btn-circle">📵</div><div class="call-btn-label">วางสาย</div></div>
                <div class="call-btn call-btn-speaker" id="line-call-speaker"><div class="call-btn-circle">🔊</div><div class="call-btn-label">ลำโพง</div></div>
            </div>
        </div>
    </div>`;
}

function renderLineChatList(line, helpers) {
    const list = document.getElementById('line-chat-list');
    if (!list) return;
    const chats = Object.keys(line.chats);
    if (chats.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:40px;color:#666;font-family:'Segoe UI',sans-serif;font-size:13px;">ยังไม่มีแชท กด ✏️ เพื่อเริ่ม</div>`;
        return;
    }
    list.innerHTML = chats.map(name => {
        const chat = line.chats[name];
        const last = chat.messages[chat.messages.length - 1];
        const unread = chat.unread || 0;
        return `<div class="line-chat-item" data-chat="${name}" style="position:relative;">
            <div style="position:relative;">
                <div class="line-chat-avatar">${chat.avatar}</div>
                ${chat.online ? `<div style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#00b300;border:2px solid #1a1a1a;"></div>` : ''}
            </div>
            <div class="line-chat-info">
                <div style="display:flex;align-items:center;gap:4px;">
                    <div class="line-chat-name">${name}</div>
                    ${chat.muted ? '<span style="font-size:10px;color:#888;">🔕</span>' : ''}
                </div>
                <div class="line-chat-preview">${last?.sticker || last?.img || last?.text || ''}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                <div class="line-chat-time">${last?.time || ''}</div>
                ${unread > 0 ? `<div style="background:#00b300;color:white;font-size:10px;font-weight:bold;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${unread}</div>` : ''}
            </div>
        </div>`;
    }).join('');
    list.querySelectorAll('.line-chat-item').forEach(el => {
        el.addEventListener('click', () => {
            const name = el.getAttribute('data-chat');
            if (line.chats[name]) line.chats[name].unread = 0;
            openLineChat(line, name, helpers);
        });
    });
}

function openLineChat(line, name, helpers) {
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
        const isSticker = !!m.sticker;
        const isImg = !!m.img;
        return `<div style="display:flex;flex-direction:column;align-items:${isOut ? 'flex-end' : 'flex-start'};margin-bottom:6px;">
            ${!isOut ? `<div style="color:#888;font-size:10px;font-family:'Segoe UI',sans-serif;margin-bottom:2px;padding-left:4px;">${m.from}</div>` : ''}
            <div style="display:flex;align-items:flex-end;gap:4px;${isOut ? 'flex-direction:row-reverse;' : ''}">
                ${!isOut ? `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">${chat.avatar}</div>` : ''}
                <div class="${isSticker ? 'line-sticker' : `line-bubble ${isOut ? 'line-bubble-out' : 'line-bubble-in'}`}">${isImg ? m.img : (m.sticker || m.text)}</div>
            </div>
            <div style="font-size:10px;color:#aaa;margin-top:2px;padding:0 4px;font-family:'Segoe UI',sans-serif;">${m.time || ''}</div>
        </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
}

function sendLineMessage(line, sticker = null, img = null, helpers) {
    const { formatTime, showToast } = helpers;
    const screen = document.getElementById('line-chat-screen');
    const name = screen.getAttribute('data-chat-user');
    const input = document.getElementById('line-msg-input');
    const text = sticker || img ? '' : (input?.value.trim() || '');
    if (!text && !sticker && !img) return;
    if (!line.chats[name]) line.chats[name] = { avatar: '👤', messages: [] };
    line.chats[name].messages.push({ from: 'คุณ', text, sticker, img, time: formatTime(new Date()) });
    if (input && !sticker && !img) input.value = '';
    renderLineMessages(line, name);

    // Auto reply
    setTimeout(() => {
        const useSticker = !sticker && Math.random() > 0.55;
        const stickers = ['😊', '❤️', '👍', '😂', '🎉', '🥺'];
        const replies = ['ได้เลย!', 'อ้าว จริงเหรอ?', 'โอเค~', '555', 'น่ารักจัง!', 'รอแป๊บนึงนะ', 'เห็นด้วยเลย!', 'อยากคุยด้วยเสมอ 💕', 'เดี๋ยวไปนะ', 'ว่าไงดีเนอะ~'];
        line.chats[name].messages.push({
            from: name,
            text: useSticker ? '' : replies[Math.floor(Math.random() * replies.length)],
            sticker: useSticker ? stickers[Math.floor(Math.random() * stickers.length)] : null,
            img: null,
            time: formatTime(new Date())
        });
        if (line.chats[name].unread !== undefined) line.chats[name].unread++;
        renderLineMessages(line, name);
        showToast('💬', 'LINE', `${name} ส่งข้อความมา`);
    }, 800 + Math.random() * 2500);
}

function bindLineHomeEvents(line, helpers) {
    const { showToast, startCall, endCall, formatTime } = helpers;

    // Tab switching
    document.querySelectorAll('.line-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.line-tab').forEach(t => {
                t.style.color = '#888';
                t.style.borderBottom = 'none';
            });
            tab.style.color = '#00b300';
            tab.style.borderBottom = '2px solid #00b300';
            const tabName = tab.getAttribute('data-tab');
            ['chats','friends','timeline','profile'].forEach(t => {
                const el = document.getElementById(`line-tab-${t}`);
                if (el) el.style.display = t === tabName ? 'block' : 'none';
            });
            if (tabName === 'friends') renderLineFriends(line, helpers);
            if (tabName === 'timeline') renderLineTimeline(line, helpers);
        });
    });

    // Search
    document.getElementById('line-search')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.line-chat-item').forEach(item => {
            item.style.display = item.getAttribute('data-chat').toLowerCase().includes(q) ? 'flex' : 'none';
        });
    });

    // New chat
    document.getElementById('line-new-chat')?.addEventListener('click', () => {
        const name = prompt('ชื่อผู้ติดต่อใหม่:');
        if (!name?.trim()) return;
        if (!line.chats[name]) line.chats[name] = { avatar: '👤', messages: [], online: Math.random() > 0.5 };
        renderLineChatList(line, helpers);
        openLineChat(line, name, helpers);
    });

    // Chat back
    document.getElementById('line-chat-back')?.addEventListener('click', () => {
        document.getElementById('line-chat-screen').style.display = 'none';
        document.getElementById('line-sticker-picker').style.display = 'none';
        document.getElementById('line-extra-tools').style.display = 'none';
        renderLineChatList(line, helpers);
    });

    // Send
    document.getElementById('line-send-btn')?.addEventListener('click', () => sendLineMessage(line, null, null, helpers));
    document.getElementById('line-msg-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') sendLineMessage(line, null, null, helpers); });

    // Sticker picker
    document.getElementById('line-sticker-btn')?.addEventListener('click', () => {
        const picker = document.getElementById('line-sticker-picker');
        const tools = document.getElementById('line-extra-tools');
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        tools.style.display = 'none';
    });
    document.querySelectorAll('.line-sticker-opt').forEach(el => {
        el.addEventListener('click', () => {
            sendLineMessage(line, el.textContent, null, helpers);
            document.getElementById('line-sticker-picker').style.display = 'none';
        });
    });

    // Plus button (extra tools)
    document.getElementById('line-plus-btn')?.addEventListener('click', () => {
        const tools = document.getElementById('line-extra-tools');
        const picker = document.getElementById('line-sticker-picker');
        tools.style.display = tools.style.display === 'none' ? 'block' : 'none';
        picker.style.display = 'none';
    });

    // Tool items
    document.querySelectorAll('.line-tool-item').forEach(el => {
        el.addEventListener('click', () => {
            const tool = el.getAttribute('data-tool');
            const imgs = { 'ถ่ายรูป': '📷 [รูปถ่าย]', 'อัลบั้ม': '🖼️ [รูปภาพ]', 'ตำแหน่ง': '📍 [ตำแหน่ง: กรุงเทพฯ]', 'เพลง': '🎵 [แชร์เพลง]', 'Note': '📋 [บันทึก]', 'Poll': '📊 [โหวต]', 'นัดหมาย': '🗓️ [นัดหมาย]', 'Card': '💌 [การ์ด]' };
            sendLineMessage(line, null, imgs[tool] || `[${tool}]`, helpers);
            document.getElementById('line-extra-tools').style.display = 'none';
        });
    });

    // Calls
    document.getElementById('line-call-btn')?.addEventListener('click', () => {
        const name = document.getElementById('line-chat-screen').getAttribute('data-chat-user');
        const avatar = line.chats[name]?.avatar || '🌟';
        startCall('line', { callName: name, callAvatar: avatar });
    });
    document.getElementById('line-vcall-btn')?.addEventListener('click', () => {
        const name = document.getElementById('line-chat-screen').getAttribute('data-chat-user');
        const avatar = line.chats[name]?.avatar || '🌟';
        startCall('line', { callName: name, callAvatar: avatar, isVideo: true });
    });
    document.getElementById('line-call-end')?.addEventListener('click', () => endCall('line-call-screen'));
}

function renderLineFriends(line, helpers) {
    const list = document.getElementById('line-friends-list');
    if (!list) return;
    list.innerHTML = Object.keys(line.chats).map(name => {
        const chat = line.chats[name];
        return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #2a2a2a;cursor:pointer;" data-friend-chat="${name}">
            <div style="position:relative;">
                <div class="line-chat-avatar" style="width:46px;height:46px;">${chat.avatar}</div>
                ${chat.online ? `<div style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#00b300;border:2px solid #1a1a1a;"></div>` : ''}
            </div>
            <div style="flex:1;">
                <div style="color:white;font-weight:600;font-family:'Segoe UI',sans-serif;">${name}</div>
                <div style="color:#666;font-size:11px;font-family:'Segoe UI',sans-serif;">${chat.online ? '🟢 ออนไลน์' : '⚫ ออฟไลน์'}</div>
            </div>
            <span style="color:#888;font-size:18px;cursor:pointer;">📞</span>
        </div>`;
    }).join('');
    list.querySelectorAll('[data-friend-chat]').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.line-tab').forEach(t => {
                t.style.color = t.getAttribute('data-tab') === 'chats' ? '#00b300' : '#888';
                t.style.borderBottom = t.getAttribute('data-tab') === 'chats' ? '2px solid #00b300' : 'none';
            });
            ['chats','friends','timeline','profile'].forEach(t => {
                const el = document.getElementById(`line-tab-${t}`);
                if (el) el.style.display = t === 'chats' ? 'block' : 'none';
            });
            openLineChat(line, el.getAttribute('data-friend-chat'), helpers);
        });
    });
}

function renderLineTimeline(line, helpers) {
    const el = document.getElementById('line-timeline-posts');
    if (!el) return;
    const posts = [
        { user: Object.keys(line.chats)[0] || 'เพื่อน', avatar: Object.values(line.chats)[0]?.avatar || '🌟', text: 'วันนี้อากาศดีมาก ☀️', likes: 12, time: '10 นาทีที่แล้ว' },
        { user: 'คุณ', avatar: '🤳', text: 'กินข้าวเที่ยงแล้ว~ 🍜', likes: 5, time: '1 ชั่วโมงที่แล้ว' },
    ];
    el.style.textAlign = 'left';
    el.innerHTML = posts.map(p => `
        <div style="background:white;border-radius:12px;padding:14px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:18px;">${p.avatar}</div>
                <div>
                    <div style="font-weight:600;font-size:13px;font-family:'Segoe UI',sans-serif;">${p.user}</div>
                    <div style="color:#aaa;font-size:11px;font-family:'Segoe UI',sans-serif;">${p.time}</div>
                </div>
            </div>
            <div style="font-size:14px;line-height:1.5;margin-bottom:10px;font-family:'Segoe UI',sans-serif;">${p.text}</div>
            <div style="display:flex;gap:16px;color:#888;font-size:12px;font-family:'Segoe UI',sans-serif;cursor:pointer;">
                <span>👍 ${p.likes}</span>
                <span>💬 คอมเมนต์</span>
                <span>↗️ แชร์</span>
            </div>
        </div>`).join('');
}
