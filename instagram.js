// ===== INSTAGRAM FULL MODULE =====
// Handles all Instagram features: feed, stories, DM, profile, call, reel-style viewer

export function buildInstagramFull(container, cs, helpers) {
    const { getCharId, charState, formatTime, formatDate, showToast, startCall, endCall } = helpers;
    const ig = cs.ig;
    container.style.background = '#000';
    container.innerHTML = getIGHTML();

    renderIGStories(ig, helpers);
    renderIGFeed(ig, helpers);
    bindIGEvents(ig, container, helpers);
}

function getIGHTML() {
    return `
    <div id="app-instagram" style="min-height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
        <!-- Main feed -->
        <div id="ig-main" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;">
            <div class="ig-topbar">
                <div class="ig-logo">Instagram</div>
                <div class="ig-topbar-icons">
                    <span id="ig-notif-icon" title="แจ้งเตือน" style="position:relative;">
                        🔔<span id="ig-notif-count" style="position:absolute;top:-4px;right:-4px;background:#ff3b3b;color:white;font-size:8px;border-radius:50%;width:14px;height:14px;display:none;align-items:center;justify-content:center;font-weight:bold;">0</span>
                    </span>
                    <span id="ig-dm-list-icon" title="ข้อความ" style="position:relative;">
                        ✈️<span id="ig-dm-count" style="position:absolute;top:-4px;right:-4px;background:#ff3b3b;color:white;font-size:8px;border-radius:50%;width:14px;height:14px;display:none;align-items:center;justify-content:center;font-weight:bold;">0</span>
                    </span>
                </div>
            </div>
            <div class="ig-stories-bar" id="ig-stories-bar"></div>
            <div id="ig-feed"></div>
        </div>
        <!-- Bottom compose bar -->
        <div class="ig-compose-bar" style="position:sticky;bottom:0;border-top:1px solid #1a1a1a;">
            <span style="font-size:20px;cursor:pointer;" id="ig-open-camera">📷</span>
            <input type="text" id="ig-post-input" placeholder="เขียนโพสต์ใหม่..." />
            <button id="ig-post-btn">โพสต์</button>
        </div>

        <!-- === OVERLAID SCREENS === -->

        <!-- DM list screen -->
        <div id="ig-dm-list-screen" style="display:none;position:absolute;inset:0;background:#000;overflow-y:auto;z-index:4;flex-direction:column;">
            <div style="padding:14px 14px 12px;color:white;font-size:16px;font-weight:700;font-family:'Segoe UI',sans-serif;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:10px;background:#000;position:sticky;top:0;z-index:2;">
                <span id="ig-dm-list-back" style="cursor:pointer;font-size:22px;">‹</span>
                <span>ข้อความ Direct</span>
                <span style="margin-left:auto;font-size:20px;cursor:pointer;" id="ig-new-dm">✏️</span>
            </div>
            <div id="ig-dm-contacts"></div>
        </div>

        <!-- DM chat screen -->
        <div id="ig-dm-chat-screen" style="display:none;position:absolute;inset:0;z-index:5;flex-direction:column;background:#000;">
            <div class="ig-dm-header" style="background:#000;border-bottom:1px solid #1a1a1a;flex-shrink:0;">
                <span id="ig-dm-back" style="cursor:pointer;font-size:22px;color:white;padding:4px;">‹</span>
                <div class="ig-avatar" id="ig-dm-chat-avatar" style="cursor:pointer;" id="ig-dm-profile-open">👤</div>
                <div style="flex:1;">
                    <div id="ig-dm-chat-name" style="color:white;font-weight:700;font-family:'Segoe UI',sans-serif;font-size:14px;cursor:pointer;">ชื่อ</div>
                    <div style="color:#888;font-size:11px;font-family:'Segoe UI',sans-serif;">ออนไลน์อยู่</div>
                </div>
                <span style="font-size:20px;cursor:pointer;color:white;margin-right:8px;" id="ig-call-btn">📞</span>
                <span style="font-size:20px;cursor:pointer;color:white;" id="ig-vcall-btn">📹</span>
            </div>
            <div class="ig-dm-messages" id="ig-dm-messages" style="flex:1;overflow-y:auto;"></div>
            <div class="ig-compose-bar" style="border-top:1px solid #1a1a1a;flex-shrink:0;background:#000;">
                <span style="font-size:20px;cursor:pointer;" id="ig-dm-camera">📷</span>
                <input type="text" id="ig-dm-input" placeholder="ข้อความ..." />
                <span style="font-size:20px;cursor:pointer;" id="ig-dm-sticker">❤️</span>
                <button id="ig-dm-send">ส่ง</button>
            </div>
        </div>

        <!-- Profile view -->
        <div class="ig-profile-view" id="ig-profile-view"></div>

        <!-- Story viewer -->
        <div id="ig-story-view" style="display:none;position:absolute;inset:0;background:#111;z-index:7;flex-direction:column;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#333;z-index:2;">
                <div id="ig-story-progress" style="height:100%;background:white;width:0%;transition:width 5s linear;"></div>
            </div>
            <div style="position:absolute;top:12px;left:14px;right:14px;display:flex;align-items:center;gap:10px;z-index:2;">
                <div class="ig-avatar" id="ig-story-avatar">🌟</div>
                <span style="color:white;font-weight:600;font-size:13px;font-family:'Segoe UI',sans-serif;" id="ig-story-user-name"></span>
                <span style="color:rgba(255,255,255,0.7);font-size:11px;font-family:'Segoe UI',sans-serif;">เมื่อกี้</span>
                <button id="ig-story-close" style="margin-left:auto;background:none;border:none;color:white;font-size:22px;cursor:pointer;">✕</button>
            </div>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:100px;" id="ig-story-content">🌟</div>
            <div style="padding:16px;display:flex;gap:8px;align-items:center;">
                <input type="text" id="ig-story-reply" placeholder="ตอบกลับสตอรี่..." style="flex:1;background:transparent;border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:8px 14px;color:white;font-size:13px;outline:none;font-family:'Segoe UI',sans-serif;" />
                <span style="font-size:22px;cursor:pointer;" id="ig-story-send">❤️</span>
                <span style="font-size:22px;cursor:pointer;" id="ig-story-share">➤</span>
            </div>
        </div>

        <!-- Reel / post image viewer -->
        <div id="ig-post-viewer" style="display:none;position:absolute;inset:0;background:#000;z-index:6;flex-direction:column;">
            <div style="padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #1a1a1a;">
                <button id="ig-post-viewer-back" style="background:none;border:none;color:white;font-size:22px;cursor:pointer;">✕</button>
                <span style="color:white;font-weight:700;font-family:'Segoe UI',sans-serif;">โพสต์</span>
            </div>
            <div id="ig-post-viewer-content" style="flex:1;overflow-y:auto;"></div>
        </div>

        <!-- Notifications panel -->
        <div id="ig-notif-panel" style="display:none;position:absolute;inset:0;background:#000;z-index:6;flex-direction:column;">
            <div style="padding:14px;color:white;font-size:16px;font-weight:700;font-family:'Segoe UI',sans-serif;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:10px;">
                <span id="ig-notif-back" style="cursor:pointer;font-size:22px;">‹</span> แจ้งเตือน
            </div>
            <div id="ig-notif-list" style="overflow-y:auto;flex:1;"></div>
        </div>

        <!-- Call screen -->
        <div class="call-screen" id="ig-call-screen">
            <div class="call-screen-top">
                <div class="call-avatar-big" id="ig-call-avatar">👤</div>
                <div class="call-name" id="ig-call-name">ชื่อ</div>
                <div class="call-status" id="ig-call-status-text">กำลังโทร...</div>
                <div class="call-duration" id="ig-call-dur"></div>
            </div>
            <div class="call-actions-row">
                <div class="call-btn call-btn-mute" id="ig-call-mute"><div class="call-btn-circle">🔇</div><div class="call-btn-label">ปิดเสียง</div></div>
                <div class="call-btn call-btn-end" id="ig-call-end"><div class="call-btn-circle">📵</div><div class="call-btn-label">วางสาย</div></div>
                <div class="call-btn call-btn-speaker" id="ig-call-speaker"><div class="call-btn-circle">🔊</div><div class="call-btn-label">ลำโพง</div></div>
            </div>
        </div>
    </div>`;
}

export function renderIGStories(ig, helpers) {
    const { showToast } = helpers;
    const bar = document.getElementById('ig-stories-bar');
    if (!bar) return;

    bar.innerHTML = `
        <div class="ig-story-item" id="ig-add-story">
            <div class="ig-story-ring" style="background:linear-gradient(135deg,#1a1a1a,#333);">
                <div class="ig-story-avatar" style="background:#111;border-color:#111;font-size:24px;">+</div>
            </div>
            <div class="ig-story-name">สตอรี่ของคุณ</div>
        </div>
        ${ig.stories.map((s, i) => `
        <div class="ig-story-item" data-story-idx="${i}">
            <div class="ig-story-ring ${s.seen ? 'seen' : ''}">
                <div class="ig-story-avatar">${s.avatar}</div>
            </div>
            <div class="ig-story-name">${s.user}</div>
        </div>`).join('')}`;

    bar.querySelectorAll('.ig-story-item[data-story-idx]').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.getAttribute('data-story-idx'));
            openStoryViewer(ig, idx, helpers);
        });
    });

    document.getElementById('ig-add-story')?.addEventListener('click', () => {
        const emoji = prompt('ใส่ Emoji หรือข้อความสำหรับสตอรี่:') || '📸';
        ig.stories.unshift({ user: 'คุณ', avatar: emoji, seen: false, content: emoji });
        renderIGStories(ig, helpers);
        showToast('📸', 'Instagram', 'ลงสตอรี่เรียบร้อย!');
        // NPC views story
        setTimeout(() => {
            if (ig.stories[1]) {
                showToast('📸', 'Instagram', `${ig.stories[1].user} ดูสตอรี่ของคุณแล้ว`);
            }
        }, 8000);
    });
}

function openStoryViewer(ig, idx, helpers) {
    const story = ig.stories[idx];
    if (!story) return;
    story.seen = true;
    const view = document.getElementById('ig-story-view');
    view.style.display = 'flex';
    view.style.flexDirection = 'column';
    document.getElementById('ig-story-avatar').textContent = story.avatar;
    document.getElementById('ig-story-user-name').textContent = story.user;
    document.getElementById('ig-story-content').textContent = story.content || story.avatar;

    // Progress bar
    const prog = document.getElementById('ig-story-progress');
    prog.style.width = '0%';
    setTimeout(() => { prog.style.width = '100%'; }, 50);
    const timer = setTimeout(() => {
        view.style.display = 'none';
        prog.style.width = '0%';
        // Go to next story
        if (idx + 1 < ig.stories.length) openStoryViewer(ig, idx + 1, helpers);
    }, 5000);

    document.getElementById('ig-story-close').onclick = () => {
        clearTimeout(timer);
        view.style.display = 'none';
        prog.style.width = '0%';
    };
    document.getElementById('ig-story-send').onclick = () => {
        const reply = document.getElementById('ig-story-reply').value.trim();
        if (!reply) return;
        if (!ig.dms[story.user]) ig.dms[story.user] = { avatar: story.avatar, messages: [] };
        ig.dms[story.user].messages.push({ from: 'คุณ', text: `[ตอบกลับสตอรี่] ${reply}`, time: helpers.formatTime(new Date()) });
        document.getElementById('ig-story-reply').value = '';
        helpers.showToast('📸', 'Instagram', `ตอบกลับสตอรี่ของ ${story.user} แล้ว`);
        clearTimeout(timer);
        view.style.display = 'none';
    };

    renderIGStories(ig, helpers);
}

export function renderIGFeed(ig, helpers) {
    const { showToast, getCharId, charState } = helpers;
    const feed = document.getElementById('ig-feed');
    if (!feed) return;

    feed.innerHTML = ig.posts.slice().reverse().map(p => `
        <div class="ig-feed-item" data-post-id="${p.id}">
            <div class="ig-post-header" style="cursor:pointer;" data-profile="${p.user}">
                <div class="ig-avatar">${p.avatar}</div>
                <div style="flex:1;">
                    <div class="ig-post-user">${p.user}</div>
                    <div style="color:#888;font-size:10px;font-family:'Segoe UI',sans-serif;">${p.location || '📍 ไทย'}</div>
                </div>
                <span style="color:#666;font-size:11px;font-family:'Segoe UI',sans-serif;">${p.time || ''}</span>
                <span style="margin-left:10px;color:white;cursor:pointer;font-size:18px;" data-post-menu="${p.id}">⋯</span>
            </div>
            <div class="ig-post-image" style="cursor:pointer;" data-view-post="${p.id}">
                <div style="font-size:64px;">${p.emoji || '📸'}</div>
                ${p.text ? `<div style="position:absolute;bottom:10px;left:10px;right:10px;color:white;font-size:13px;font-family:'Segoe UI',sans-serif;text-shadow:0 1px 4px rgba(0,0,0,0.8);">${p.text}</div>` : ''}
            </div>
            <div class="ig-post-actions">
                <span class="ig-like-btn ${p.likedByUser ? 'liked' : ''}" data-post="${p.id}" style="${p.likedByUser ? 'animation:heartPop 0.3s;' : ''}">${p.likedByUser ? '❤️' : '🤍'}</span>
                <span class="ig-comment-toggle" data-post="${p.id}">💬</span>
                <span id="ig-share-${p.id}" style="cursor:pointer;" title="ส่งต่อ">📤</span>
                <span style="margin-left:auto;cursor:pointer;" data-bookmark="${p.id}">${p.bookmarked ? '🔖' : '🏷️'}</span>
            </div>
            <div class="ig-post-likes" id="likes-${p.id}">${p.likes.toLocaleString()} ถูกใจ</div>
            <div class="ig-post-caption"><span style="cursor:pointer;" data-profile="${p.user}">${p.user}</span> ${p.caption}</div>
            <div class="ig-comments-section" id="comments-${p.id}" style="display:none;">
                <div id="comments-inner-${p.id}">
                ${p.comments.map(c => `
                    <div class="ig-comment-item">
                        <div class="ig-avatar" style="width:24px;height:24px;font-size:11px;flex-shrink:0;">${c.avatar || '👤'}</div>
                        <div><span class="cmt-user" style="cursor:pointer;" data-profile="${c.user}">${c.user}</span> ${c.text}
                        <div style="display:flex;gap:10px;margin-top:3px;">
                            <span style="color:#666;font-size:10px;font-family:'Segoe UI',sans-serif;">${c.time || ''}</span>
                            <span style="color:#888;font-size:10px;cursor:pointer;" data-reply-to="${c.user}" data-post="${p.id}">ตอบกลับ</span>
                            <span class="ig-comment-like" data-cmt="${p.id}-${c.user}" style="font-size:12px;cursor:pointer;">${c.liked ? '❤️' : '🤍'} ${c.likes || 0}</span>
                        </div>
                        </div>
                    </div>`).join('')}
                </div>
                <div style="display:flex;gap:8px;align-items:center;padding:8px 12px;border-top:1px solid #111;">
                    <div class="ig-avatar" style="width:28px;height:28px;font-size:13px;flex-shrink:0;">🤳</div>
                    <input type="text" class="ig-comment-input" data-post="${p.id}" placeholder="เพิ่มความคิดเห็น..." style="flex:1;background:#1a1a1a;border:none;border-radius:20px;padding:7px 12px;color:white;font-size:12px;outline:none;font-family:'Segoe UI',sans-serif;" />
                    <button class="ig-comment-send" data-post="${p.id}" style="background:none;border:none;color:#0095f6;font-size:13px;font-weight:600;cursor:pointer;font-family:'Segoe UI',sans-serif;">โพสต์</button>
                </div>
            </div>
            <div class="ig-post-comments ig-comment-toggle" data-post="${p.id}" style="cursor:pointer;">ดูความคิดเห็นทั้ง ${p.comments.length} รายการ</div>
        </div>`).join('');

    // Like
    feed.querySelectorAll('.ig-like-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pid = btn.getAttribute('data-post');
            const post = ig.posts.find(p => p.id === pid);
            if (!post) return;
            post.likedByUser = !post.likedByUser;
            post.likes += post.likedByUser ? 1 : -1;
            btn.textContent = post.likedByUser ? '❤️' : '🤍';
            const likesEl = document.getElementById(`likes-${pid}`);
            if (likesEl) likesEl.textContent = `${post.likes.toLocaleString()} ถูกใจ`;
            if (post.likedByUser && post.user !== 'คุณ') {
                showToast('📸', 'Instagram', `คุณถูกใจโพสต์ของ ${post.user}`);
            }
        });
    });

    // Bookmark
    feed.querySelectorAll('[data-bookmark]').forEach(btn => {
        btn.addEventListener('click', () => {
            const pid = btn.getAttribute('data-bookmark');
            const post = ig.posts.find(p => p.id === pid);
            if (!post) return;
            post.bookmarked = !post.bookmarked;
            btn.textContent = post.bookmarked ? '🔖' : '🏷️';
            showToast('📸', 'Instagram', post.bookmarked ? 'บันทึกโพสต์แล้ว' : 'ยกเลิกการบันทึก');
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
        btn.addEventListener('click', () => postComment(btn.getAttribute('data-post'), ig, helpers));
    });
    feed.querySelectorAll('.ig-comment-input').forEach(inp => {
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') postComment(inp.getAttribute('data-post'), ig, helpers);
        });
    });

    // Profile
    feed.querySelectorAll('[data-profile]').forEach(el => {
        el.addEventListener('click', () => openIGProfile(ig, el.getAttribute('data-profile'), helpers));
    });

    // Comment like
    feed.querySelectorAll('.ig-comment-like').forEach(btn => {
        btn.addEventListener('click', () => {
            const [pid, cuser] = btn.getAttribute('data-cmt').split('-');
            const post = ig.posts.find(p => p.id === pid);
            const cmt = post?.comments.find(c => c.user === cuser);
            if (!cmt) return;
            cmt.liked = !cmt.liked;
            cmt.likes = (cmt.likes || 0) + (cmt.liked ? 1 : -1);
            btn.textContent = `${cmt.liked ? '❤️' : '🤍'} ${cmt.likes}`;
        });
    });

    // Reply to comment
    feed.querySelectorAll('[data-reply-to]').forEach(btn => {
        btn.addEventListener('click', () => {
            const user = btn.getAttribute('data-reply-to');
            const pid = btn.getAttribute('data-post');
            const input = feed.querySelector(`.ig-comment-input[data-post="${pid}"]`);
            if (input) { input.value = `@${user} `; input.focus(); }
        });
    });

    // View post
    feed.querySelectorAll('[data-view-post]').forEach(el => {
        el.addEventListener('click', () => {
            const pid = el.getAttribute('data-view-post');
            const post = ig.posts.find(p => p.id === pid);
            if (!post) return;
            openPostViewer(post, ig, helpers);
        });
    });
}

function postComment(pid, ig, helpers) {
    const { showToast, getCharId, charState } = helpers;
    const input = document.querySelector(`.ig-comment-input[data-post="${pid}"]`);
    if (!input || !input.value.trim()) return;
    const post = ig.posts.find(p => p.id === pid);
    if (!post) return;
    const text = input.value.trim();
    post.comments.push({ user: 'คุณ', avatar: '🤳', text, time: helpers.formatTime(new Date()), likes: 0, liked: false });
    input.value = '';
    // Re-render just the comments section
    const inner = document.getElementById(`comments-inner-${pid}`);
    if (inner) {
        inner.innerHTML = post.comments.map(c => `
            <div class="ig-comment-item">
                <div class="ig-avatar" style="width:24px;height:24px;font-size:11px;flex-shrink:0;">${c.avatar || '👤'}</div>
                <div><span class="cmt-user">${c.user}</span> ${c.text}</div>
            </div>`).join('');
    }
    // NPC reply
    if (post.user !== 'คุณ') {
        setTimeout(() => {
            const npcReplies = ['น่ารักมาก! 😍', 'ขอบคุณนะ 💕', '🔥🔥', 'เห็นด้วยเลย!', 'ฮ่าๆ 😂', '❤️'];
            post.comments.push({ user: post.user, avatar: post.avatar, text: npcReplies[Math.floor(Math.random() * npcReplies.length)], time: helpers.formatTime(new Date()), likes: 0, liked: false });
            renderIGFeed(ig, helpers);
            showToast('📸', 'Instagram', `${post.user} ตอบกลับคอมเมนต์ของคุณ`);
        }, 1500 + Math.random() * 2000);
    }
}

function openPostViewer(post, ig, helpers) {
    const viewer = document.getElementById('ig-post-viewer');
    if (!viewer) return;
    viewer.style.display = 'flex';
    viewer.style.flexDirection = 'column';
    const content = document.getElementById('ig-post-viewer-content');
    content.innerHTML = `
        <div class="ig-post-header" style="cursor:pointer;padding:12px;" data-profile="${post.user}">
            <div class="ig-avatar">${post.avatar}</div>
            <div class="ig-post-user">${post.user}</div>
        </div>
        <div style="width:100%;aspect-ratio:1;background:#111;display:flex;align-items:center;justify-content:center;font-size:80px;">${post.emoji || '📸'}</div>
        <div style="padding:12px;">
            <div style="display:flex;gap:14px;font-size:22px;margin-bottom:8px;">
                <span style="cursor:pointer;">${post.likedByUser ? '❤️' : '🤍'}</span>
                <span style="cursor:pointer;">💬</span>
                <span style="cursor:pointer;">📤</span>
            </div>
            <div style="color:white;font-size:13px;font-weight:600;font-family:'Segoe UI',sans-serif;margin-bottom:4px;">${post.likes} ถูกใจ</div>
            <div style="color:white;font-size:13px;font-family:'Segoe UI',sans-serif;line-height:1.4;margin-bottom:8px;"><span style="font-weight:700;">${post.user}</span> ${post.caption}</div>
            ${post.comments.map(c => `<div class="ig-comment-item" style="padding:4px 0;"><span class="cmt-user">${c.user}</span> ${c.text}</div>`).join('')}
        </div>`;

    document.getElementById('ig-post-viewer-back').onclick = () => {
        viewer.style.display = 'none';
    };
    content.querySelectorAll('[data-profile]').forEach(el => {
        el.addEventListener('click', () => openIGProfile(ig, el.getAttribute('data-profile'), helpers));
    });
}

export function openIGProfile(ig, username, helpers) {
    const { showToast } = helpers;
    const view = document.getElementById('ig-profile-view');
    if (!view) return;
    view.classList.add('open');
    ig.follows = ig.follows || {};
    const followed = ig.follows[username] || false;
    const userPosts = ig.posts.filter(p => p.user === username);
    const followerCount = Math.floor(Math.random() * 9000) + 100;
    const followingCount = Math.floor(Math.random() * 500) + 50;
    const bios = ['✨ ชีวิตคือการผจญภัย', '📍 ไทย | 🎵 ดนตรี | 📸 ถ่ายรูป', '🌸 รักธรรมชาติ & คาเฟ่', '💼 Professional | ❤️ Family first'];
    const bio = bios[Math.floor(Math.random() * bios.length)];

    view.innerHTML = `
        <div style="background:#000;min-height:100%;display:flex;flex-direction:column;">
            <div style="padding:12px 14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #1a1a1a;position:sticky;top:0;background:#000;z-index:2;">
                <span id="ig-profile-close" style="cursor:pointer;color:white;font-size:24px;line-height:1;">‹</span>
                <span style="color:white;font-weight:700;font-family:'Segoe UI',sans-serif;font-size:15px;">${username}</span>
                <span style="margin-left:auto;color:white;font-size:18px;cursor:pointer;">⋯</span>
            </div>
            <div style="padding:16px;">
                <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
                    <div style="width:86px;height:86px;border-radius:50%;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);padding:2px;flex-shrink:0;">
                        <div style="width:100%;height:100%;border-radius:50%;background:#222;border:3px solid #000;display:flex;align-items:center;justify-content:center;font-size:38px;">
                            ${ig.posts.find(p => p.user === username)?.avatar || '🌟'}
                        </div>
                    </div>
                    <div style="display:flex;gap:0;flex:1;justify-content:space-around;">
                        <div style="text-align:center;"><div style="color:white;font-size:17px;font-weight:700;font-family:'Segoe UI',sans-serif;">${userPosts.length}</div><div style="color:#aaa;font-size:12px;font-family:'Segoe UI',sans-serif;">โพสต์</div></div>
                        <div style="text-align:center;cursor:pointer;"><div style="color:white;font-size:17px;font-weight:700;font-family:'Segoe UI',sans-serif;">${followerCount.toLocaleString()}</div><div style="color:#aaa;font-size:12px;font-family:'Segoe UI',sans-serif;">ผู้ติดตาม</div></div>
                        <div style="text-align:center;cursor:pointer;"><div style="color:white;font-size:17px;font-weight:700;font-family:'Segoe UI',sans-serif;">${followingCount.toLocaleString()}</div><div style="color:#aaa;font-size:12px;font-family:'Segoe UI',sans-serif;">กำลังติดตาม</div></div>
                    </div>
                </div>
                <div style="color:white;font-size:13px;font-weight:700;font-family:'Segoe UI',sans-serif;margin-bottom:4px;">${username}</div>
                <div style="color:#ddd;font-size:12px;font-family:'Segoe UI',sans-serif;margin-bottom:12px;line-height:1.4;">${bio}</div>
                <div style="display:flex;gap:8px;margin-bottom:4px;">
                    <button class="ig-follow-btn ${followed ? 'following' : ''}" id="ig-follow-toggle" style="flex:2;">${followed ? '✓ กำลังติดตาม' : 'ติดตาม'}</button>
                    <button style="flex:1;padding:8px;border-radius:8px;border:1px solid #444;background:#1a1a1a;color:white;font-weight:600;font-size:13px;cursor:pointer;font-family:'Segoe UI',sans-serif;" id="ig-profile-dm">ส่งข้อความ</button>
                    <button style="padding:8px;border-radius:8px;border:1px solid #444;background:#1a1a1a;color:white;font-size:13px;cursor:pointer;">▼</button>
                </div>
            </div>
            <!-- Stories highlights -->
            <div style="display:flex;gap:14px;padding:0 16px 14px;overflow-x:auto;scrollbar-width:none;">
                ${['ทั้งหมด','ท่องเที่ยว','อาหาร','ชีวิต'].map(h => `
                <div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;cursor:pointer;">
                    <div style="width:58px;height:58px;border-radius:50%;border:1px solid #444;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:22px;">📸</div>
                    <div style="color:white;font-size:10px;font-family:'Segoe UI',sans-serif;">${h}</div>
                </div>`).join('')}
            </div>
            <!-- Tab bar -->
            <div style="display:flex;border-top:1px solid #222;border-bottom:1px solid #222;">
                <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:12px;border-bottom:1px solid white;cursor:pointer;">⊞</div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:12px;cursor:pointer;color:#666;">🎞</div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:12px;cursor:pointer;color:#666;">🏷️</div>
            </div>
            <!-- Photo grid -->
            <div class="ig-profile-grid">
                ${userPosts.length > 0
                    ? userPosts.map(p => `<div class="ig-profile-grid-item">${p.emoji || '📸'}</div>`).join('')
                    : '<div style="grid-column:span 3;text-align:center;padding:40px;color:#666;font-family:Segoe UI,sans-serif;font-size:13px;">ยังไม่มีโพสต์</div>'
                }
            </div>
        </div>`;

    view.querySelector('#ig-profile-close').addEventListener('click', () => view.classList.remove('open'));
    view.querySelector('#ig-follow-toggle').addEventListener('click', function() {
        ig.follows[username] = !ig.follows[username];
        this.textContent = ig.follows[username] ? '✓ กำลังติดตาม' : 'ติดตาม';
        this.classList.toggle('following', ig.follows[username]);
        showToast('📸', 'Instagram', ig.follows[username] ? `ติดตาม ${username} แล้ว` : `เลิกติดตาม ${username}`);
    });
    view.querySelector('#ig-profile-dm')?.addEventListener('click', () => {
        view.classList.remove('open');
        if (!ig.dms[username]) ig.dms[username] = { avatar: ig.posts.find(p => p.user === username)?.avatar || '👤', messages: [] };
        const dmListScreen = document.getElementById('ig-dm-list-screen');
        if (dmListScreen) {
            dmListScreen.style.display = 'flex';
            dmListScreen.style.flexDirection = 'column';
            openIGDM(ig, username, helpers);
        }
    });
}

function openIGDM(ig, username, helpers) {
    const { formatTime, showToast } = helpers;
    document.getElementById('ig-dm-list-screen').style.display = 'none';
    const screen = document.getElementById('ig-dm-chat-screen');
    screen.style.display = 'flex';
    screen.setAttribute('data-dm-user', username);
    document.getElementById('ig-dm-chat-name').textContent = username;
    document.getElementById('ig-dm-chat-avatar').textContent = ig.dms[username]?.avatar || '👤';
    renderIGMessages(ig, username);

    document.getElementById('ig-dm-back').onclick = () => {
        screen.style.display = 'none';
        const listScreen = document.getElementById('ig-dm-list-screen');
        listScreen.style.display = 'flex';
        listScreen.style.flexDirection = 'column';
        renderIGDMList(ig, helpers);
    };
    document.getElementById('ig-dm-chat-name').onclick = () => openIGProfile(ig, username, helpers);
    document.getElementById('ig-dm-chat-avatar').onclick = () => openIGProfile(ig, username, helpers);
}

function renderIGMessages(ig, username) {
    const el = document.getElementById('ig-dm-messages');
    if (!el) return;
    const chat = ig.dms[username];
    if (!chat) return;
    el.innerHTML = chat.messages.map(m => `
        <div style="display:flex;flex-direction:column;align-items:${m.from === 'คุณ' ? 'flex-end' : 'flex-start'};gap:2px;margin-bottom:4px;">
            <div class="ig-msg-bubble ${m.from === 'คุณ' ? 'ig-msg-out' : 'ig-msg-in'}">${m.text}</div>
            <div style="font-size:10px;color:#555;font-family:'Segoe UI',sans-serif;padding:0 4px;">${m.time || ''}</div>
        </div>`).join('');
    el.scrollTop = el.scrollHeight;
}

function renderIGDMList(ig, helpers) {
    const el = document.getElementById('ig-dm-contacts');
    if (!el) return;
    const contacts = Object.keys(ig.dms);
    if (contacts.length === 0) {
        el.innerHTML = `<div style="text-align:center;padding:40px;color:#666;font-family:'Segoe UI',sans-serif;">ยังไม่มีข้อความ</div>`;
        return;
    }
    el.innerHTML = contacts.map(name => {
        const chat = ig.dms[name];
        const last = chat.messages[chat.messages.length - 1];
        return `<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #1a1a1a;cursor:pointer;" data-dm-open="${name}">
            <div class="ig-avatar" style="flex-shrink:0;">${chat.avatar}</div>
            <div style="flex:1;overflow:hidden;">
                <div style="color:white;font-weight:600;font-size:13px;font-family:'Segoe UI',sans-serif;">${name}</div>
                <div style="color:#666;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'Segoe UI',sans-serif;">${last?.text || 'ยังไม่มีข้อความ'}</div>
            </div>
            <div style="color:#666;font-size:11px;font-family:'Segoe UI',sans-serif;">${last?.time || ''}</div>
        </div>`;
    }).join('');
    el.querySelectorAll('[data-dm-open]').forEach(el => {
        el.addEventListener('click', () => openIGDM(ig, el.getAttribute('data-dm-open'), helpers));
    });
}

function bindIGEvents(ig, container, helpers) {
    const { formatTime, showToast, getCharId, charState, startCall, endCall } = helpers;

    // DM list open
    document.getElementById('ig-dm-list-icon')?.addEventListener('click', () => {
        const screen = document.getElementById('ig-dm-list-screen');
        screen.style.display = 'flex';
        screen.style.flexDirection = 'column';
        renderIGDMList(ig, helpers);
    });
    document.getElementById('ig-dm-list-back')?.addEventListener('click', () => {
        document.getElementById('ig-dm-list-screen').style.display = 'none';
    });

    // New DM
    document.getElementById('ig-new-dm')?.addEventListener('click', () => {
        const name = prompt('ชื่อผู้ใช้ที่ต้องการส่งข้อความ:');
        if (!name?.trim()) return;
        const avatar = ig.posts.find(p => p.user === name)?.avatar || '👤';
        if (!ig.dms[name]) ig.dms[name] = { avatar, messages: [] };
        openIGDM(ig, name, helpers);
    });

    // Post button
    document.getElementById('ig-post-btn')?.addEventListener('click', () => {
        const input = document.getElementById('ig-post-input');
        const text = input.value.trim();
        if (!text) return;
        const emojis = ['🌟', '❤️', '📸', '✨', '🎉', '🌸', '🔥', '💕'];
        const charId = getCharId();
        const cs = charState(charId);
        const newPost = {
            id: 'p' + Date.now(), user: 'คุณ', avatar: '🤳', emoji: emojis[Math.floor(Math.random() * emojis.length)],
            caption: text, text: '', likes: 0, likedByUser: false, bookmarked: false,
            comments: [], time: formatTime(new Date()), location: '📍 ไทย'
        };
        cs.ig.posts.push(newPost);
        input.value = '';
        renderIGFeed(cs.ig, helpers);
        showToast('📸', 'Instagram', 'โพสต์รูปเรียบร้อย!');
        // NPC like and comment
        setTimeout(() => {
            newPost.likes++;
            const npcName = cs.ig.stories.find(s => s.user !== 'คุณ')?.user || 'ตัวละคร';
            showToast('📸', 'Instagram', `${npcName} ถูกใจโพสต์ของคุณ`);
            renderIGFeed(cs.ig, helpers);
        }, 4000);
        setTimeout(() => {
            const npcName = cs.ig.stories.find(s => s.user !== 'คุณ')?.user || 'ตัวละคร';
            const npcAvatar = cs.ig.stories.find(s => s.user === npcName)?.avatar || '🌟';
            const npcComments = ['สวยมากเลย! 😍', 'ชอบมาก ❤️', '🔥🔥🔥', 'น่ารักจัง ✨', 'โอ้โห!'];
            newPost.comments.push({ user: npcName, avatar: npcAvatar, text: npcComments[Math.floor(Math.random() * npcComments.length)], time: formatTime(new Date()), likes: 0, liked: false });
            renderIGFeed(cs.ig, helpers);
            showToast('📸', 'Instagram', `${npcName} แสดงความคิดเห็นในโพสต์ของคุณ`);
        }, 8000);
    });

    // DM send
    const sendDM = () => {
        const screen = document.getElementById('ig-dm-chat-screen');
        const username = screen.getAttribute('data-dm-user');
        const input = document.getElementById('ig-dm-input');
        if (!input?.value.trim() || !username) return;
        if (!ig.dms[username]) ig.dms[username] = { avatar: '👤', messages: [] };
        ig.dms[username].messages.push({ from: 'คุณ', text: input.value.trim(), time: formatTime(new Date()) });
        input.value = '';
        renderIGMessages(ig, username);
        // Auto reply
        setTimeout(() => {
            const replies = ['ขอบคุณนะ! 😊', 'โอเค~', 'ฮ่าๆ 😂', 'จริงด้วย!', '❤️', 'รอแป๊บนึงนะ', 'เห็นด้วยเลย!'];
            ig.dms[username].messages.push({ from: username, text: replies[Math.floor(Math.random() * replies.length)], time: formatTime(new Date()) });
            renderIGMessages(ig, username);
            showToast('📸', 'Instagram', `${username} ตอบกลับแล้ว`);
        }, 1200 + Math.random() * 2000);
    };
    document.getElementById('ig-dm-send')?.addEventListener('click', sendDM);
    document.getElementById('ig-dm-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') sendDM(); });

    // DM sticker
    document.getElementById('ig-dm-sticker')?.addEventListener('click', () => {
        const screen = document.getElementById('ig-dm-chat-screen');
        const username = screen.getAttribute('data-dm-user');
        if (!username) return;
        const hearts = ['❤️', '💕', '💖', '😍', '🔥', '😂', '🥺', '🤗'];
        const chosen = hearts[Math.floor(Math.random() * hearts.length)];
        if (!ig.dms[username]) ig.dms[username] = { avatar: '👤', messages: [] };
        ig.dms[username].messages.push({ from: 'คุณ', text: chosen, time: formatTime(new Date()) });
        renderIGMessages(ig, username);
    });

    // Camera post
    document.getElementById('ig-open-camera')?.addEventListener('click', () => {
        const emojis = ['🌅', '🌃', '🏖️', '🌸', '🍜', '☕', '🎵', '🎮', '🛍️', '🌙'];
        const caption = prompt('คำอธิบายรูป:');
        if (!caption?.trim()) return;
        const charId = getCharId();
        const cs = charState(charId);
        cs.ig.posts.push({
            id: 'p' + Date.now(), user: 'คุณ', avatar: '🤳',
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            caption, likes: 0, likedByUser: false, bookmarked: false,
            comments: [], time: formatTime(new Date()), location: '📍 ไทย'
        });
        renderIGFeed(cs.ig, helpers);
        showToast('📸', 'Instagram', 'ลงรูปเรียบร้อย!');
    });

    // Notifications
    document.getElementById('ig-notif-icon')?.addEventListener('click', () => {
        const panel = document.getElementById('ig-notif-panel');
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';
        const list = document.getElementById('ig-notif-list');
        const notifs = ig.notifications || [];
        if (notifs.length === 0) {
            list.innerHTML = `<div style="text-align:center;padding:40px;color:#666;font-family:'Segoe UI',sans-serif;">ไม่มีแจ้งเตือน</div>`;
        } else {
            list.innerHTML = notifs.slice().reverse().map(n => `
                <div style="display:flex;gap:12px;align-items:center;padding:12px 14px;border-bottom:1px solid #1a1a1a;">
                    <div class="ig-avatar">${n.avatar}</div>
                    <div style="flex:1;color:white;font-size:13px;font-family:'Segoe UI',sans-serif;">${n.text}</div>
                    <div style="font-size:24px;">${n.icon}</div>
                </div>`).join('');
        }
    });
    document.getElementById('ig-notif-back')?.addEventListener('click', () => {
        document.getElementById('ig-notif-panel').style.display = 'none';
    });

    // Call
    document.getElementById('ig-call-btn')?.addEventListener('click', () => {
        const username = document.getElementById('ig-dm-chat-screen').getAttribute('data-dm-user') || 'ตัวละคร';
        const avatar = ig.dms[username]?.avatar || '👤';
        startCall('ig', { callName: username, callAvatar: avatar });
    });
    document.getElementById('ig-vcall-btn')?.addEventListener('click', () => {
        const username = document.getElementById('ig-dm-chat-screen').getAttribute('data-dm-user') || 'ตัวละคร';
        const avatar = ig.dms[username]?.avatar || '👤';
        startCall('ig', { callName: username, callAvatar: avatar, isVideo: true });
    });
    document.getElementById('ig-call-end')?.addEventListener('click', () => endCall('ig-call-screen'));
}
