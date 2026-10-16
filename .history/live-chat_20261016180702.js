import { auth, db, ADMIN_EMAIL } from "./firebase-config.js";
import { onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, addDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function () {
  "use strict";

  // --- Idempotent init guard: only ever run the setup once per page ---
  if (window.__fsChatInitialized) return;
  window.__fsChatInitialized = true;

  const script = document.querySelector('script[src$="live-chat.js"]');
  const mode = script?.dataset.chatMode || "guest";
  const protectedPage = mode === "signed-in";

  // --- Reuse existing elements if present; otherwise create them ---
  let launcher = document.getElementById("fs-chat-launcher");
  let panel = document.getElementById("fs-chat-panel");

  if (!launcher) {
    launcher = document.createElement("button");
    launcher.id = "fs-chat-launcher";
    launcher.type = "button";
    launcher.innerHTML = '<span class="fs-chat-dot"></span><span>Chat with us</span>';
    launcher.setAttribute("aria-label", "Open live chat");
    document.body.append(launcher);
  }

  if (!panel) {
    panel = document.createElement("section");
    panel.id = "fs-chat-panel";
    panel.setAttribute("aria-label", "Live chat");
    panel.innerHTML =
      '<div class="fs-chat-head">' +
        '<div><strong>First State Bank Support</strong><small>Send us a message</small></div>' +
        '<button id="fs-chat-close" type="button" aria-label="Close chat">×</button>' +
      '</div>' +
      '<div id="fs-chat-messages" aria-live="polite">' +
        '<div class="fs-chat-msg fs-admin">Hi! How can we help you today?</div>' +
      '</div>' +
      '<div class="fs-chat-note" id="fs-chat-status">Connecting to support…</div>' +
      '<form id="fs-chat-form">' +
        '<textarea id="fs-chat-input" rows="1" maxlength="1500" placeholder="Type your message…" aria-label="Your message" required></textarea>' +
        '<button id="fs-chat-send" type="submit">Send</button>' +
      '</form>';
    document.body.append(panel);
  }

  const messagesEl = panel.querySelector("#fs-chat-messages");
  const form = panel.querySelector("#fs-chat-form");
  const input = panel.querySelector("#fs-chat-input");
  const send = panel.querySelector("#fs-chat-send");
  const status = panel.querySelector("#fs-chat-status");

  let currentUser = null;
  let chatId = null;
  let unsubMessages = null;
  let busy = false;
  const seenMessageIds = new Set();

  // --- Delegated open/close: survives DOM re-renders, never "dead" ---
  document.addEventListener("click", (e) => {
    if (e.target.closest("#fs-chat-launcher")) {
      panel.classList.toggle("fs-open");
      if (panel.classList.contains("fs-open")) {
        input.focus();
      }
      return;
    }
    if (e.target.closest("#fs-chat-close")) {
      panel.classList.remove("fs-open");
    }
  });

  function safeDate(value) {
    try {
      const d = value?.toDate ? value.toDate() : new Date(value);
      return isNaN(d) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function addMessage(data, id) {
    if (seenMessageIds.has(id)) return;
    seenMessageIds.add(id);
    const empty = messagesEl.querySelector(".fs-chat-empty");
    if (empty) empty.remove();
    const bubble = document.createElement("div");
    bubble.className = "fs-chat-msg " + (data.senderRole === "admin" ? "fs-admin" : "fs-user");
    const body = document.createElement("span");
    body.textContent = String(data.text || "");
    bubble.append(body);
    const time = document.createElement("span");
    time.className = "fs-chat-time";
    time.textContent = safeDate(data.createdAt);
    bubble.append(time);
    messagesEl.append(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function watchMessages() {
    if (unsubMessages) unsubMessages();
    seenMessageIds.clear();
    const q = query(collection(db, "liveChats", chatId, "messages"), orderBy("createdAt", "asc"));
    unsubMessages = onSnapshot(
      q,
      (snap) => {
        messagesEl.innerHTML = "";
        snap.forEach((d) => {
          seenMessageIds.add(d.id);
          const data = d.data();
          const bubble = document.createElement("div");
          bubble.className = "fs-chat-msg " + (data.senderRole === "admin" ? "fs-admin" : "fs-user");
          const body = document.createElement("span");
          body.textContent = String(data.text || "");
          bubble.append(body);
          const time = document.createElement("span");
          time.className = "fs-chat-time";
          time.textContent = safeDate(data.createdAt);
          bubble.append(time);
          messagesEl.append(bubble);
        });
        if (!snap.size) {
          const empty = document.createElement("div");
          empty.className = "fs-chat-msg fs-admin fs-chat-empty";
          empty.textContent = "Hi! Send us a message and our team will reply here.";
          messagesEl.append(empty);
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
        status.textContent = "Connected · Replies appear here";
      },
      (err) => {
        console.error("Live chat listener:", err);
        status.textContent = "Chat couldn't connect. Please try again later.";
      }
    );
  }

  async function setup(user) {
    currentUser = user;
    if (!user) {
      status.textContent = "Connecting to support…";
      return;
    }
    if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      launcher.style.display = "none";
      panel.remove();
      return;
    }
    if (protectedPage && user.isAnonymous) {
      status.textContent = "Please sign in to use support chat.";
      return;
    }
    chatId = user.uid;
    try {
      const chatRef = doc(db, "liveChats", chatId);
      const existing = await getDoc(chatRef);
      if (!existing.exists()) {
        await setDoc(chatRef, {
          ownerUid: user.uid,
          ownerEmail: user.email || "",
          ownerName: user.displayName || "Website visitor",
          isAnonymous: !!user.isAnonymous,
          status: "open",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: "",
        });
      } else {
        await updateDoc(chatRef, { updatedAt: serverTimestamp() });
      }
      watchMessages();
    } catch (err) {
      console.error("Live chat setup:", err);
      status.textContent = "Chat setup failed. Please contact support.";
    }
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await setup(user);
      return;
    }
    if (protectedPage) {
      status.textContent = "Sign in to chat with support.";
      return;
    }
    try {
      const result = await signInAnonymously(auth);
      await setup(result.user);
    } catch (err) {
      console.error("Anonymous chat sign-in:", err);
      status.textContent = "Chat is unavailable right now.";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !currentUser || !chatId || busy) return;
    busy = true;
    send.disabled = true;
    try {
      await addDoc(collection(db, "liveChats", chatId, "messages"), {
        text,
        senderUid: currentUser.uid,
        senderRole: "user",
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "liveChats", chatId), {
        updatedAt: serverTimestamp(),
        lastMessage: text,
        status: "open",
      });
      input.value = "";
    } catch (err) {
      console.error("Send chat message:", err);
      status.textContent = "Message couldn't send. Check your connection and try again.";
    } finally {
      busy = false;
      send.disabled = false;
      input.focus();
    }
  });
})();