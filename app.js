(function () {
  const $ = (id) => document.getElementById(id);

  // ---------- Wizard / Stepper ----------
  let currentStep = 1;

  function goToStep(step) {
    if (step < 1 || step > 4) return;
    currentStep = step;

    document.querySelectorAll('.wizard-panel').forEach((panel, i) => {
      const n = i + 1;
      panel.classList.toggle('active', n === step);
      panel.hidden = n !== step;
    });

    document.querySelectorAll('.step-btn').forEach((btn, i) => {
      const n = i + 1;
      btn.classList.remove('active', 'done');
      if (n === step) btn.classList.add('active');
      else if (n < step) btn.classList.add('done');
      btn.setAttribute('aria-selected', n === step ? 'true' : 'false');
    });

    setTimeout(() => refreshClearButtons(), 0);
  }

  function initWizard() {
    document.querySelectorAll('.step-btn[data-step]').forEach(btn => {
      btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.step, 10)));
    });

    $('btnSkipStep1')?.addEventListener('click', () => goToStep(2));
    $('btnBack2')?.addEventListener('click', () => goToStep(1));
    $('btnNext2')?.addEventListener('click', () => goToStep(3));
    $('btnBack3')?.addEventListener('click', () => goToStep(2));
    $('btnNext3')?.addEventListener('click', () => goToStep(4));
    $('btnBack4')?.addEventListener('click', () => goToStep(3));
    $('btnNewReservation')?.addEventListener('click', () => {
      clearStep4();
    });
    btnGoToContacto?.addEventListener('click', () => goToStep(2));

    goToStep(1);
  }

  // ---------- Elements ----------
  const importMessage = $('importMessage');
  const btnParse = $('btnParse');

  const clientName = $('clientName');
  const phonePrefix = $('phonePrefix');
  const phone = $('phone');
  const email = $('email');
  const bono = $('bono');
  const serviceType = $('serviceType');
  const treatment = $('treatment');
  const duration = $('duration');
  const date = $('date');
  const time = $('time');

  const btnCalendar = $('btnCalendar');

  const pvClient = $('pvClient');
  const pvService = $('pvService');
  const pvTreatment = $('pvTreatment');
  const pvDateTime = $('pvDateTime');
  const pvDuration = $('pvDuration');
  const pvMessage = $('pvMessage');

  const btnWhatsApp = $('btnWhatsApp');
  const btnEmail = $('btnEmail');
  const btnCopy = $('btnCopy');

  const contactWarning = $('contactWarning');
  const contactWarningText = $('contactWarningText');
  const btnGoToContacto = $('btnGoToContacto');
  const formatWarning = $('formatWarning');
  const formatWarningText = $('formatWarningText');

  // ---------- Services (from index_v28) ----------
  const MASAJES = [
    { name: "Masaje relajante Ikigai", durations: [30, 50] },
    { name: "Masaje de Tejido profundo", durations: [30, 50] },
    { name: "Masaje Californiano", durations: [50] },
    { name: "Masaje con piedras calientes", durations: [60] },
    { name: "Masaje craneal Hindú", durations: [30] },
    { name: "Reflexología + Masaje de pies", durations: [40] }
  ];

  const RITUALES = [
    { name: "Ritual Ikigai", durations: [110] },
    { name: "Ritual Exprés Ikigai", durations: [50] },
    { name: "Ritual Ikigai en pareja", durations: [100] }
  ];

  // ---------- Helpers ----------
  function roundMinutesTo5(min) {
    const m = parseInt(min, 10) || 0;
    const rounded = Math.min(55, Math.round(m / 5) * 5);
    return String(rounded).padStart(2, '0');
  }

  function setOptions(selectEl, options, placeholder) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    const ph = document.createElement('option');
    ph.value = "";
    ph.disabled = true;
    ph.selected = true;
    ph.textContent = placeholder || "Selecciona una opción";
    selectEl.appendChild(ph);

    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      selectEl.appendChild(o);
    });
  }

  function setDurationOptions(durs, isSelectable) {
    if (!duration) return;
    duration.innerHTML = "";

    if (!durs || !durs.length) {
      const o = document.createElement('option');
      o.value = "";
      o.disabled = true;
      o.selected = true;
      o.textContent = "No aplica";
      duration.appendChild(o);
      duration.disabled = true;
      return;
    }

    if (durs.length === 1 && !isSelectable) {
      const o = document.createElement('option');
      o.value = String(durs[0]);
      o.selected = true;
      o.textContent = `${durs[0]} min`;
      duration.appendChild(o);
      duration.disabled = true;
      return;
    }

    duration.disabled = false;
    const ph = document.createElement('option');
    ph.value = "";
    ph.disabled = true;
    ph.selected = true;
    ph.textContent = "Selecciona duración";
    duration.appendChild(ph);

    durs.forEach(d => {
      const o = document.createElement('option');
      o.value = String(d);
      o.textContent = `${d} min`;
      duration.appendChild(o);
    });
  }

  function getPrefixValue() {
    const v = (phonePrefix?.value || "+34").trim();
    if (!v) return "+34";
    return v.startsWith("+") ? v : "+" + v.replace(/\D/g, '');
  }

  function getFullPhoneDigits() {
    const prefix = getPrefixValue().replace(/\D/g, '');
    const num = (phone?.value || "").replace(/\D/g, '');
    if (!num || num.length < 8) return "";
    return prefix + num;
  }

  function getFullPhoneDisplay() {
    const p = getPrefixValue();
    const n = (phone?.value || "").trim();
    if (!n) return "";
    return `${p} ${n}`;
  }

  function formatDateES(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  function joinDateTime() {
    const d = date?.value || "";
    const t = time?.value || "";
    if (!d && !t) return "";
    if (d && t) return `${formatDateES(d)} · ${t}`;
    if (d) return `${formatDateES(d)}`;
    return t;
  }

  function buildConfirmationMessage() {
    const name = (clientName?.value || "").trim();
    const st = (serviceType?.value || "").trim();
    const tr = (treatment?.value || "").trim();
    const dur = (duration?.disabled ? duration?.options?.[0]?.textContent : (duration?.value ? `${duration.value} min` : "")).trim();
    const dt = joinDateTime();

    const greetName = name ? ` ${name}` : "";
    const lines = [];
    lines.push(`Hola${greetName},`);
    lines.push("");
    lines.push("¡Gracias por tu reserva! Te confirmamos que la hemos registrado correctamente en Ikigai.");
    lines.push("");
    if (st) lines.push(`Servicio: ${st}`);
    if (tr) lines.push(`Tratamiento: ${tr}`);
    if (dur && dur !== "No aplica") lines.push(`Duración: ${dur}`);
    if (dt) lines.push(`Fecha y hora: ${dt}`);
    lines.push("");
    lines.push("Si necesitas cambiar algo o tienes cualquier duda, responde a este mensaje y lo gestionamos encantadas.");
    lines.push("");
    lines.push("Un abrazo,");
    lines.push("Ikigai");
    return lines.join("\n");
  }

  function buildEmailBody() {
    return buildConfirmationMessage().replace(/\n/g, "\r\n");
  }

  function updatePreview() {
    const name = (clientName?.value || "").trim();
    const st = (serviceType?.value || "").trim();
    const tr = (treatment?.value || "").trim();

    pvClient.textContent = name || "—";
    pvService.textContent = st || "—";
    pvTreatment.textContent = tr || "—";
    pvDateTime.textContent = joinDateTime() || "—";

    let durText = "—";
    if (duration) {
      if (duration.disabled) {
        durText = duration.options[0]?.textContent || "—";
      } else if (duration.value) {
        durText = `${duration.value} min`;
      }
    }
    pvDuration.textContent = durText || "—";

    pvMessage.textContent = buildConfirmationMessage() || "—";

    enforceBonoConsistency();
    updateLinks();
    updateContactWarning();
    updateFormatWarning();
    refreshClearButtons();
  }

  function hasValidPhone() {
    return isValidPhoneFormat();
  }

  function hasValidEmail() {
    return isValidEmailFormat();
  }

  function isValidPhoneFormat() {
    const v = (phone?.value || "").replace(/\D/g, '');
    return v.length >= 8 && v.length <= 15;
  }

  function isValidEmailFormat() {
    const v = (email?.value || "").trim();
    return v.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function updateFormatWarning() {
    if (!formatWarning || !formatWarningText) return;
    const phoneDigits = (phone?.value || "").replace(/\D/g, '');
    const emailVal = (email?.value || "").trim();
    const badPhone = phoneDigits.length > 0 && !isValidPhoneFormat();
    const badEmail = emailVal.length > 0 && !isValidEmailFormat();
    if (!badPhone && !badEmail) {
      formatWarning.hidden = true;
      return;
    }
    const parts = [];
    if (badPhone) parts.push("teléfono (8-15 dígitos)");
    if (badEmail) parts.push("correo (ej: usuario@dominio.com)");
    formatWarningText.textContent = `Formato incorrecto en ${parts.join(" y ")}. Revisa los datos introducidos.`;
    formatWarning.hidden = false;
  }

  function hasAllRequiredForStep4() {
    if (!(clientName?.value || "").trim()) return false;
    if (!hasValidPhone()) return false;
    if (!hasValidEmail()) return false;
    if (!(serviceType?.value || "").trim()) return false;
    if (!(treatment?.value || "").trim()) return false;
    if (!(date?.value || "").trim()) return false;
    if (!(time?.value || "").trim()) return false;
    return true;
  }

  function updateContactWarning() {
    if (!contactWarning || !contactWarningText) return;
    const phoneDigits = (phone?.value || "").replace(/\D/g, '');
    const emailVal = (email?.value || "").trim();
    const missingPhone = phoneDigits.length === 0;
    const missingEmail = emailVal.length === 0;
    const badFormatPhone = phoneDigits.length > 0 && !isValidPhoneFormat();
    const badFormatEmail = emailVal.length > 0 && !isValidEmailFormat();
    const needPhone = missingPhone || badFormatPhone;
    const needEmail = missingEmail || badFormatEmail;

    if (!needPhone && !needEmail) {
      contactWarning.hidden = true;
      return;
    }

    const parts = [];
    if (missingPhone) parts.push("Falta el teléfono");
    else if (badFormatPhone) parts.push("El formato del teléfono no es correcto");
    if (missingEmail) parts.push("Falta el correo");
    else if (badFormatEmail) parts.push("El formato del correo no es correcto");
    contactWarningText.textContent = `${parts.join("; ")}. Los botones no funcionarán hasta corregir los datos en el paso Contacto. `;
    contactWarning.hidden = false;
  }

  function updateLinks() {
    const complete = hasAllRequiredForStep4();
    const digits = getFullPhoneDigits();
    const text = encodeURIComponent(buildConfirmationMessage());
    const waUrl = complete && digits ? `https://wa.me/${digits}?text=${text}` : "#";
    if (btnWhatsApp) {
      btnWhatsApp.href = waUrl;
      btnWhatsApp.dataset.href = waUrl;
      btnWhatsApp.target = "_blank";
      btnWhatsApp.rel = "noopener";
      btnWhatsApp.setAttribute('aria-disabled', waUrl === "#" ? "true" : "false");
    }

    const to = (email?.value || "").trim();
    const subject = encodeURIComponent("Confirmación de reserva - Ikigai");
    const body = encodeURIComponent(buildEmailBody());
    const mailto = complete && to ? `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}` : "#";
    const gmail = complete && to ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${subject}&body=${body}` : "#";
    if (btnEmail) {
      btnEmail.href = gmail;
      btnEmail.dataset.gmail = gmail;
      btnEmail.dataset.mailto = mailto;
      btnEmail.setAttribute('aria-disabled', !complete || !to ? "true" : "false");
    }

    const calUrl = complete ? buildCalendarUrl() : "";
    if (btnCalendar) {
      btnCalendar.href = calUrl || "#";
      btnCalendar.setAttribute('aria-disabled', !calUrl ? "true" : "false");
    }
  }

  // ---------- Calendar ----------
  function buildCalendarUrl() {
    const st = (serviceType?.value || "").trim();
    const tr = (treatment?.value || "").trim();
    const name = (clientName?.value || "").trim();
    const dt = date?.value;
    const tm = time?.value;
    if (!dt || !tm) return "";

    const [y, m, d] = dt.split('-');
    const [hh, mm] = tm.split(':');
    if (!y || !m || !d || !hh || !mm) return "";

    const start = `${y}${m}${d}T${hh}${mm}00`;
    let mins = 60;
    if (duration) {
      if (duration.disabled) {
        const match = (duration.options[0]?.textContent || "").match(/(\d+)\s*min/);
        if (match) mins = parseInt(match[1], 10);
      } else if (duration.value) {
        mins = parseInt(duration.value, 10) || mins;
      }
    }

    const startDate = new Date(`${dt}T${tm}:00`);
    const endDate = new Date(startDate.getTime() + mins * 60000);
    const pad = (n) => String(n).padStart(2, '0');
    const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    const title = encodeURIComponent(`Ikigai · ${tr || st || "Reserva"}`);
    const details = encodeURIComponent(
      [
        `Cliente: ${name || "-"}`,
        `Servicio: ${st || "-"}`,
        `Tratamiento: ${tr || "-"}`,
        `Teléfono: ${getFullPhoneDisplay() || "-"}`,
        `Email: ${(email?.value || "").trim() || "-"}`
      ].join("\n")
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
  }

  // ---------- Parse import message ----------
  function parseKeyValue(text) {
    const out = {};
    const lines = (text || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    lines.forEach(line => {
      const m = line.match(/^([^:–—-]+?)\s*[:–—-]\s*(.+)$/i);
      if (!m) return;
      const k = m[1].trim().toLowerCase();
      const v = m[2].trim();
      out[k] = v;
    });
    return out;
  }

  function inferServiceType(v) {
    const s = (v || "").toLowerCase();
    if (s.includes("masaje")) return "Masaje terapéutico";
    if (s.includes("ritual")) return "Ritual";
    return "";
  }

  function applyParsed(parsed) {
    const name = parsed["nombre"] || parsed["cliente"] || "";
    if (name) clientName.value = name;

    const ph = (parsed["teléfono"] || parsed["telefono"] || parsed["tlf"] || parsed["movil"] || "").trim();
    if (ph) {
      const prefixes = phonePrefix ? Array.from(phonePrefix.options).map(o => o.value).filter(Boolean).sort((a, b) => b.length - a.length) : ["+34", "+1"];
      let foundPrefix = "+34";
      let rest = ph;
      for (const p of prefixes) {
        if (ph.startsWith(p) || ph.replace(/\s/g, "").startsWith(p.replace("+", ""))) {
          foundPrefix = p;
          rest = ph.slice(p.length).replace(/^\s+/, "").trim();
          break;
        }
      }
      if (phonePrefix) phonePrefix.value = foundPrefix;
      if (phone) phone.value = rest || ph;
    }

    const em = parsed["email"] || parsed["correo"] || "";
    if (em) email.value = em;

    const stRaw = parsed["tipo de servicio"] || parsed["servicio"] || parsed["tipo"] || "";
    const st = inferServiceType(stRaw) || (["Masaje terapéutico", "Ritual"].includes(stRaw) ? stRaw : "");
    if (st) {
      serviceType.value = st;
      configureTreatments();
    }

    const bonoRaw = parsed["bono"] || "";
    if (bonoRaw) {
      const br = bonoRaw.toLowerCase();
      if (br.includes("mensual")) bono.value = "Bono Mensual";
      else if (br.includes("regalo")) bono.value = "Bono Regalo";
    }

    const trRaw = parsed["tratamiento"] || parsed["tratamientos"] || "";
    let tr = trRaw;
    let durFromTreatment = "";
    if (trRaw) {
      const m = trRaw.match(/\((\d+)\s*min\)/i);
      if (m) {
        durFromTreatment = m[1];
        tr = trRaw.replace(m[0], "").trim();
      }
    }

    if (tr) {
      const opts = Array.from(treatment.options).map(o => o.value);
      const needle = tr.toLowerCase();
      const match = opts.find(o => o && (o.toLowerCase() === needle || o.toLowerCase().includes(needle)));
      if (match) {
        treatment.value = match;
        configureDuration();
      }
    }

    const durRaw = parsed["duración"] || parsed["duracion"] || durFromTreatment || "";
    const durNum = (String(durRaw).match(/(\d+)/) || [])[1];
    if (durNum) {
      if (!duration.disabled) {
        duration.value = String(durNum);
      }
    }

    applyBonoRules("parse");

    const fecha = parsed["fecha"] || "";
    if (fecha) {
      const dmY = fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dmY) {
        const dd = String(dmY[1]).padStart(2, '0');
        const mm = String(dmY[2]).padStart(2, '0');
        const yy = dmY[3];
        date.value = `${yy}-${mm}-${dd}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        date.value = fecha;
      }
    }
    const hora = parsed["hora"] || "";
    if (hora) {
      const hm = hora.match(/^(\d{1,2}):(\d{2})/);
      if (hm) {
        time.value = `${String(hm[1]).padStart(2, '0')}:${roundMinutesTo5(hm[2])}`;
      }
    }

    updatePreview();
  }

  // ---------- Configure selects ----------
  function configureTreatments() {
    const st = serviceType?.value || "";
    if (st === "Masaje terapéutico") {
      setOptions(treatment, MASAJES.map(x => x.name), "Selecciona un masaje");
    } else if (st === "Ritual") {
      setOptions(treatment, RITUALES.map(x => x.name), "Selecciona un ritual");
    } else {
      setOptions(treatment, [], "Selecciona un tratamiento");
    }
    configureDuration();
  }

  function configureDuration() {
    const st = serviceType?.value || "";
    const tr = treatment?.value || "";

    if (st === "Ritual") {
      const foundR = RITUALES.find(x => x.name === tr);
      const durs = foundR?.durations || [];
      setDurationOptions(durs, false);
      return;
    }

    if (st !== "Masaje terapéutico") {
      setDurationOptions([], false);
      return;
    }

    const found = MASAJES.find(x => x.name === tr);
    if (!found) {
      setDurationOptions([], false);
      return;
    }

    const selectable = (found.durations.length > 1);
    setDurationOptions(found.durations, selectable);
  }

  // ---------- Bono rules ----------
  function applyBonoRules(origin) {
    const b = (bono?.value || "").trim();
    if (b !== "Bono Mensual") return;

    if (serviceType.value !== "Masaje terapéutico") {
      serviceType.value = "Masaje terapéutico";
      configureTreatments();
    }
    if (treatment.value !== "Masaje de Tejido profundo") {
      const has = Array.from(treatment.options).some(o => o.value === "Masaje de Tejido profundo");
      if (has) treatment.value = "Masaje de Tejido profundo";
      configureDuration();
    }
    if (!duration.disabled) {
      const hasDur = Array.from(duration.options).some(o => o.value === "50");
      if (hasDur) duration.value = "50";
    }
  }

  function enforceBonoConsistency() {
    if ((bono?.value || "") !== "Bono Mensual") return;
    const stOk = (serviceType.value === "Masaje terapéutico");
    const trOk = (treatment.value === "Masaje de Tejido profundo");
    const durOk = duration.disabled
      ? ((duration.options[0]?.textContent || "").includes("50"))
      : (duration.value === "50");
    if (!(stOk && trOk && durOk)) {
      bono.value = "";
    }
  }

  // ---------- Clear buttons (X) ----------
  const clearBtns = Array.from(document.querySelectorAll('.field-clear'));

  function dispatchChange(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function clearField(id) {
    const el = $(id);
    if (!el) return;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.type === 'date' || el.type === 'time') {
        el.value = '';
      } else {
        el.value = (id === 'phone') ? '' : '';
      }
      dispatchChange(el);
      return;
    }

    if (el.tagName === 'SELECT') {
      el.value = '';
      dispatchChange(el);
      return;
    }
  }

  function refreshClearButtons() {
    const panel3 = document.getElementById('panel-3');
    const isStep3Visible = panel3 && !panel3.hidden;

    clearBtns.forEach(btn => {
      const id = btn.dataset.for;
      const el = id ? $(id) : null;
      if (!el) {
        btn.hidden = true;
        return;
      }

      let isHidden;
      if (id === 'date' || id === 'time') {
        isHidden = !isStep3Visible;
      } else {
        isHidden = (el.offsetParent === null);
      }
      const isDisabled = !!el.disabled;

      let hasValue = false;
      if (el.tagName === 'SELECT') {
        hasValue = !!(el.value || '').trim();
      } else {
        const v = (el.value || '').trim();
        hasValue = (id === 'phone') ? (v !== '') : (v !== '');
      }

      btn.hidden = isHidden || isDisabled || !hasValue;
    });
  }

  clearBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clearField(btn.dataset.for);
      if (btn.dataset.for === 'serviceType') {
        setOptions(treatment, [], "Selecciona un tratamiento");
        setDurationOptions([], false);
      }
      if (btn.dataset.for === 'treatment') {
        setDurationOptions([], false);
      }
      updatePreview();
    });
  });

  // ---------- Button guards ----------
  function openMaybe(url, fallback) {
    if (!url || url === '#') return false;
    const w = window.open(url, '_blank', 'noopener');
    if (!w && fallback) window.location.href = fallback;
    return true;
  }

  btnWhatsApp?.addEventListener('click', (e) => {
    const url = btnWhatsApp.dataset.href || btnWhatsApp.getAttribute('href');
    if (!url || url === '#') {
      e.preventDefault();
      alert("Añade un teléfono válido para confirmar por WhatsApp.");
      return;
    }
    e.preventDefault();
    window.open(url, '_blank', 'noopener');
  });

  btnEmail?.addEventListener('click', (e) => {
    const url = btnEmail.dataset.gmail || btnEmail.getAttribute('href');
    const mailto = btnEmail.dataset.mailto;
    if (!url || url === '#') {
      e.preventDefault();
      alert("Añade un email válido para confirmar por correo.");
      return;
    }
    e.preventDefault();
    openMaybe(url, mailto);
  });

  btnCopy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(buildConfirmationMessage());
      btnCopy.textContent = "Copiado ✓";
      setTimeout(() => btnCopy.textContent = "Copiar resumen", 1200);
    } catch (e) {
      alert("No se pudo copiar. Selecciona el texto en la vista previa y cópialo manualmente.");
    }
  });

  btnCalendar?.addEventListener('click', (e) => {
    const url = buildCalendarUrl();
    if (!url) {
      e.preventDefault();
      alert("Para añadir a Calendar, completa Fecha y Hora.");
      return;
    }
    e.preventDefault();
    window.open(url, '_blank', 'noopener');
  });

  function clearStep1() {
    importMessage.value = "";
    dispatchChange(importMessage);
    updatePreview();
  }

  function clearStep2() {
    clientName.value = "";
    if (phonePrefix) phonePrefix.value = "+34";
    phone.value = "";
    email.value = "";
    dispatchChange(clientName);
    if (phonePrefix) dispatchChange(phonePrefix);
    dispatchChange(phone);
    dispatchChange(email);
    updatePreview();
  }

  function clearStep3() {
    bono.value = "";
    serviceType.value = "";
    setOptions(treatment, [], "Selecciona un tratamiento");
    setDurationOptions([], false);
    date.value = "";
    time.value = "";
    dispatchChange(bono);
    dispatchChange(serviceType);
    dispatchChange(treatment);
    dispatchChange(duration);
    dispatchChange(date);
    dispatchChange(time);
    updatePreview();
  }

  function clearStep4() {
    importMessage.value = "";
    clientName.value = "";
    if (phonePrefix) phonePrefix.value = "+34";
    phone.value = "";
    email.value = "";
    bono.value = "";
    serviceType.value = "";
    setOptions(treatment, [], "Selecciona un tratamiento");
    setDurationOptions([], false);
    date.value = "";
    time.value = "";
    updatePreview();
    goToStep(1);
  }

  $('btnClearStep1')?.addEventListener('click', clearStep1);
  $('btnClearStep2')?.addEventListener('click', clearStep2);
  $('btnClearStep3')?.addEventListener('click', clearStep3);
  $('btnClearStep4')?.addEventListener('click', clearStep4);

  btnParse?.addEventListener('click', () => {
    const parsed = parseKeyValue(importMessage.value || "");
    applyParsed(parsed);
    goToStep(4);
  });

  // ---------- Wire form events ----------
  bono?.addEventListener('change', () => {
    applyBonoRules('bono');
    updatePreview();
  });
  serviceType?.addEventListener('change', () => {
    configureTreatments();
    enforceBonoConsistency();
    updatePreview();
  });
  treatment?.addEventListener('change', () => {
    configureDuration();
    enforceBonoConsistency();
    updatePreview();
  });

  [importMessage, clientName, phonePrefix, phone, email, bono, duration, date, time].forEach(el => {
    el?.addEventListener('input', updatePreview);
    el?.addEventListener('change', updatePreview);
  });

  // ---------- Custom Date & Time Pickers ----------
  const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  function formatDateDisplay(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return d && m && y ? `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}` : iso;
  }

  function initDatePicker() {
    const trigger = document.querySelector('.custom-date-trigger');
    const dropdown = document.querySelector('.custom-date-dropdown');
    if (!trigger || !dropdown || !date) return;

    let currentView = { year: new Date().getFullYear(), month: new Date().getMonth() };

    function renderCalendar(viewYear, viewMonth) {
      currentView = { year: viewYear, month: viewMonth };
      const first = new Date(viewYear, viewMonth, 1);
      const last = new Date(viewYear, viewMonth + 1, 0);
      const startPad = (first.getDay() + 6) % 7;
      const days = last.getDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const currentVal = date.value ? new Date(date.value + 'T12:00:00') : null;

      let html = `
        <div class="date-picker-header">
          <span class="date-picker-month">${MONTHS[viewMonth]} ${viewYear}</span>
          <div class="date-picker-nav">
            <button type="button" class="date-picker-nav-btn" data-dir="-1" aria-label="Mes anterior">‹</button>
            <button type="button" class="date-picker-nav-btn" data-dir="1" aria-label="Mes siguiente">›</button>
          </div>
        </div>
        <div class="date-picker-weekdays">${WEEKDAYS.map(w => `<span>${w}</span>`).join('')}</div>
        <div class="date-picker-days">
      `;
      for (let i = 0; i < startPad; i++) html += '<button type="button" class="date-picker-day empty"></button>';
      for (let d = 1; d <= days; d++) {
        const dDate = new Date(viewYear, viewMonth, d);
        const dayOfWeek = dDate.getDay();
        const isSunday = dayOfWeek === 0;
        const isPast = dDate < today;
        const isDisabled = isPast || isSunday;
        const isToday = dDate.getTime() === today.getTime();
        const isSelected = currentVal && dDate.getDate() === currentVal.getDate() && dDate.getMonth() === currentVal.getMonth() && dDate.getFullYear() === currentVal.getFullYear();
        const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        let cls = 'date-picker-day';
        if (isSelected) cls += ' selected';
        else if (isToday && !isDisabled) cls += ' today';
        if (isDisabled) cls += ' disabled';
        const disabledAttr = isDisabled ? ' disabled' : '';
        html += `<button type="button" class="${cls}" data-date="${iso}"${disabledAttr}>${d}</button>`;
      }
      html += '</div>';
      dropdown.innerHTML = html;
    }

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const navBtn = e.target.closest('.date-picker-nav-btn');
      if (navBtn) {
        const dir = parseInt(navBtn.dataset.dir, 10);
        let m = currentView.month + dir;
        let y = currentView.year;
        if (m > 11) { m = 0; y++; } else if (m < 0) { m = 11; y--; }
        renderCalendar(y, m);
        return;
      }
      const dayBtn = e.target.closest('.date-picker-day:not(.empty):not(.disabled)');
      if (dayBtn) {
        const iso = dayBtn.dataset.date;
        date.value = iso;
        trigger.textContent = formatDateDisplay(iso);
        trigger.classList.remove('placeholder');
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.hidden = true;
        dispatchChange(date);
      }
    });

    function openCalendar() {
      const now = new Date();
      const currentVal = date.value ? new Date(date.value + 'T12:00:00') : now;
      currentView = { year: currentVal.getFullYear(), month: currentVal.getMonth() };
      renderCalendar(currentView.year, currentView.month);
      dropdown.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeCalendar() {
      dropdown.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.hidden) openCalendar(); else closeCalendar();
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !trigger.contains(e.target)) closeCalendar();
    });

    date.addEventListener('change', () => {
      if (date.value) {
        trigger.textContent = formatDateDisplay(date.value);
        trigger.classList.remove('placeholder');
      } else {
        trigger.textContent = 'Selecciona fecha';
        trigger.classList.add('placeholder');
      }
    });

    if (date.value) {
      trigger.textContent = formatDateDisplay(date.value);
      trigger.classList.remove('placeholder');
    } else {
      trigger.textContent = 'Selecciona fecha';
      trigger.classList.add('placeholder');
    }
  }

  function initTimePicker() {
    const trigger = document.querySelector('.custom-time-trigger');
    const dropdown = document.querySelector('.custom-time-dropdown');
    if (!trigger || !dropdown || !time) return;

    function buildTimeOptions() {
      const hours = [];
      for (let h = 0; h < 24; h++) hours.push(String(h).padStart(2, '0'));
      const minutes = [];
      for (let m = 0; m < 60; m += 5) minutes.push(String(m).padStart(2, '0'));

      dropdown.innerHTML = `
        <div class="time-picker-row">
          <div class="time-picker-col">
            <label>Hora</label>
            <select class="time-picker-select time-picker-hour">${hours.map(h => `<option value="${h}">${h}</option>`).join('')}</select>
          </div>
          <div class="time-picker-col">
            <label>Minutos</label>
            <select class="time-picker-select time-picker-min">${minutes.map(m => `<option value="${m}">${m}</option>`).join('')}</select>
          </div>
          <button type="button" class="cta-btn primary" style="align-self: flex-end;">Aceptar</button>
        </div>
      `;

      const hourSelect = dropdown.querySelector('.time-picker-hour');
      const minSelect = dropdown.querySelector('.time-picker-min');
      const acceptBtn = dropdown.querySelector('.cta-btn');

      const [currentH = '09', currentM = '00'] = (time.value || '09:00').split(':');
      const roundedM = roundMinutesTo5(currentM);
      hourSelect.value = currentH;
      minSelect.value = roundedM;
      if (roundedM !== currentM) {
        time.value = `${currentH}:${roundedM}`;
        if (trigger) trigger.textContent = `${currentH}:${roundedM}`;
      }

      function applyTime() {
        const h = hourSelect.value;
        const m = minSelect.value;
        time.value = `${h}:${m}`;
        trigger.textContent = `${h}:${m}`;
        trigger.classList.remove('placeholder');
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.hidden = true;
        dispatchChange(time);
      }

      acceptBtn.addEventListener('click', applyTime);
    }

    function openTimePicker() {
      if (!dropdown.innerHTML.trim()) buildTimeOptions();
      dropdown.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeTimePicker() {
      dropdown.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.hidden) openTimePicker(); else closeTimePicker();
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !trigger.contains(e.target)) closeTimePicker();
    });

    time.addEventListener('change', () => {
      if (time.value) {
        trigger.textContent = time.value;
        trigger.classList.remove('placeholder');
      } else {
        trigger.textContent = 'Selecciona hora';
        trigger.classList.add('placeholder');
      }
    });

    if (time.value) {
      trigger.textContent = time.value;
      trigger.classList.remove('placeholder');
    } else {
      trigger.textContent = 'Selecciona hora';
      trigger.classList.add('placeholder');
    }
  }

  // ---------- Init ----------
  setOptions(treatment, [], "Selecciona un tratamiento");
  setDurationOptions([], false);
  updatePreview();
  initWizard();
  initDatePicker();
  initTimePicker();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
})();
