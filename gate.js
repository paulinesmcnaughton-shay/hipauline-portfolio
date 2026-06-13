/* Shared password gate — AES-GCM decrypt and download */
(function () {
  "use strict";
  const gate = document.getElementById("resumeGate");
  if (!gate) return;
  const card = document.getElementById("gateCard");
  const titleEl = document.getElementById("gateTitle");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gateInput");
  const errEl = document.getElementById("gateErr");
  const submitBtn = document.getElementById("gateSubmit");
  const success = document.getElementById("gateSuccess");
  const downloadBtn = document.getElementById("gateDownload");
  const dlLabel = downloadBtn.querySelector(".gd-label");
  let lastFocus = null, blobUrl = null;
  let current = { enc: "assets/resume.enc", dl: "Pauline-Shay-CV.pdf", label: "Resume" };

  const reset = () => {
    form.hidden = false; success.hidden = true;
    errEl.textContent = ""; input.classList.remove("err"); input.value = "";
    submitBtn.disabled = false; submitBtn.querySelector(".arr").textContent = "→";
    submitBtn.firstChild.textContent = "Unlock ";
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
  };

  const open = (trigger) => {
    if (trigger && trigger.dataset && trigger.dataset.enc) {
      current = { enc: trigger.dataset.enc, dl: trigger.dataset.dl || "file.pdf", label: trigger.dataset.label || "File" };
    }
    titleEl.textContent = current.label + " is password-protected";
    dlLabel.textContent = "Download " + current.label;
    downloadBtn.setAttribute("download", current.dl);
    lastFocus = document.activeElement;
    gate.hidden = false; reset();
    requestAnimationFrame(() => gate.classList.add("open"));
    setTimeout(() => input.focus(), 80);
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    gate.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { gate.hidden = true; }, 240);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  async function decrypt(password) {
    const resp = await fetch(current.enc, { cache: "no-store" });
    if (!resp.ok) throw new Error("fetch");
    const buf = new Uint8Array(await resp.arrayBuffer());
    const salt = buf.slice(0, 16), iv = buf.slice(16, 28), data = buf.slice(28);
    const keyMaterial = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
      keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new Blob([plain], { type: "application/pdf" });
  }

  const fail = (msg) => {
    errEl.textContent = msg || "Incorrect password. Try again.";
    input.classList.add("err");
    card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    submitBtn.disabled = false; submitBtn.firstChild.textContent = "Unlock ";
    submitBtn.querySelector(".arr").textContent = "→";
    input.select();
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.value) { fail("Enter the password."); return; }
    submitBtn.disabled = true; submitBtn.firstChild.textContent = "Decrypting… ";
    submitBtn.querySelector(".arr").textContent = "";
    try {
      const blob = await decrypt(input.value);
      blobUrl = URL.createObjectURL(blob);
      downloadBtn.href = blobUrl;
      form.hidden = true; success.hidden = false;
      setTimeout(() => downloadBtn.focus(), 40);
    } catch (err) {
      fail();
    }
  });

  input.addEventListener("input", () => {
    if (errEl.textContent) { errEl.textContent = ""; input.classList.remove("err"); }
  });

  document.querySelectorAll("[data-locked]").forEach((el) => {
    el.addEventListener("click", (e) => { e.preventDefault(); open(el); });
  });
  gate.addEventListener("click", (e) => { if (e.target === gate) close(); });
  document.querySelectorAll("[data-gate-close]").forEach((b) => b.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && gate.classList.contains("open")) close();
  });
})();
