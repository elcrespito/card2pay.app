/*
 * Card2Pay — BuyCoin (Extop) payment automation.
 *
 * The widget itself is embedded by a parser-inserted <script> in the host page
 * (data-token comes from the runtime env config). This file:
 *   1. Reads `amount`, `wallet` and `email` from the URL.
 *      `amount`  is the crypto amount (in the payout currency, e.g. USDT) that
 *                the merchant must receive — i.e. the NOWPayments `pay_amount`.
 *      `wallet`  is the destination address the crypto is settled to
 *                (the NOWPayments-generated deposit address for the merchant).
 *      `email`   is the customer's email, forwarded to the BuyCoin widget.
 *   2. Fills the **payout** ("You get") field with `amount` so the widget
 *      back-computes the correct fiat charge. Filling the fiat "You send" field
 *      with a crypto amount would overcharge the customer (the fiat→crypto rate
 *      is not 1:1).
 *   3. Sets the receiver wallet, forwards the email, relabels the action, and
 *      drives the widget to the hosted payment page.
 *
 * IMPORTANT: the Extop widget uses React-controlled <input>s. Assigning
 * `el.value = x` and firing a plain "input" event does NOT update React's
 * internal state — React overwrites the field on its next render, which is why
 * the amount/wallet appeared to "not take". We must call the native value
 * setter on the prototype and dispatch both "input" and "change" so React's
 * onChange runs against the new value.
 */
(function () {
  "use strict";

  var d = document;
  var CONFIG = window.CARD2PAY_CONFIG || {};

  function getParam(name) {
    var match = new RegExp("[?&]" + name + "=([^&]*)").exec(
      window.location.search
    );
    return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : null;
  }

  var amount = getParam("amount");
  var walletValue = getParam("wallet");
  var emailValue = getParam("email");

  // ---- React-safe value setter -------------------------------------------

  function setNativeValue(el, value) {
    if (!el) return;
    var proto =
      el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) {
      desc.set.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // React can re-render and wipe a freshly-set value; re-assert a few times
  // (only while it doesn't match) so the value reliably "sticks".
  function setAndKeep(getEl, value, tries) {
    var el = getEl();
    if (!el) {
      if (tries > 0) setTimeout(function () { setAndKeep(getEl, value, tries - 1); }, 300);
      return;
    }
    if (String(el.value) !== String(value)) {
      setNativeValue(el, value);
    }
    if (tries > 0) {
      setTimeout(function () { setAndKeep(getEl, value, tries - 1); }, 300);
    }
  }

  function hideLoaderWhenReady() {
    var loader = d.getElementById("widgetLoader");
    if (!loader) return;
    var input = d.getElementById("paymentAmount");
    if (input) {
      loader.classList.add("hidden");
      return;
    }
    setTimeout(hideLoaderWhenReady, 300);
  }

  // ---- Referrer gate -----------------------------------------------------
  // The automation only runs for traffic coming from the configured origin.
  // Set ALLOWED_REFERRER to "*" (or empty) to disable.

  function referrerAllowed() {
    var allowed = (CONFIG.allowedReferrer || "").trim();
    if (!allowed || allowed === "*") return true;
    if (!d.referrer) return false;
    try {
      var host = new URL(d.referrer).hostname;
      return host.indexOf(allowed) > -1;
    } catch (e) {
      return false;
    }
  }

  // ---- External email ----------------------------------------------------
  // BuyCoin exposes window.ExtopWidget.setExternalUserEmail(); the value is
  // appended to the hosted checkout URL as `external_user_email`. Poll until
  // the global is available, then set it.

  function applyExternalEmail() {
    if (emailValue === null || emailValue.trim() === "") return;
    try {
      if (
        window.ExtopWidget &&
        typeof window.ExtopWidget.setExternalUserEmail === "function"
      ) {
        window.ExtopWidget.setExternalUserEmail(emailValue.trim());
        return;
      }
    } catch (e) {}
    setTimeout(applyExternalEmail, 300);
  }

  // ---- Automation steps --------------------------------------------------

  function waitForAmountInput() {
    // Drive the PAYOUT ("You get", crypto) field — `amount` is in the payout
    // currency. The widget recomputes the fiat "You send" amount itself.
    var payout = d.getElementById("payoutAmount");

    if (!payout) {
      setTimeout(waitForAmountInput, 500);
      return;
    }

    if (amount !== null && amount !== "") {
      setAndKeep(function () { return d.getElementById("payoutAmount"); }, amount, 6);
    }

    var exchange = d.getElementById("exchange");

    if (exchange) {
      exchange.textContent = "Proceed to Payment";

      exchange.addEventListener("click", function () {
        applyExternalEmail();
        setWallet();
        setWalletLabel();
        setConfirmButtonText();
      });
    }
  }

  function setWallet() {
    // The wallet field only renders on the checkout step (after "Buy now").
    setAndKeep(function () { return d.getElementsByName("wallet")[0]; }, walletValue, 12);
  }

  function setWalletLabel() {
    var labels = d.querySelectorAll("label");

    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];

      if (label.textContent.trim() === "Wallet address") {
        label.textContent = "Receivers wallet address";
        return;
      }
    }

    setTimeout(setWalletLabel, 500);
  }

  function setConfirmButtonText() {
    var button = d.getElementById("confirm");

    if (!button) {
      setTimeout(setConfirmButtonText, 500);
      return;
    }

    button.textContent = "Make payment";
  }

  // ---- Boot --------------------------------------------------------------

  function start() {
    hideLoaderWhenReady();

    // Our own checkout iframe passes auto=1 to force the automation on.
    var auto = getParam("auto") === "1";
    if (!auto && !referrerAllowed()) return;
    if (walletValue === null || walletValue.trim() === "") return;

    applyExternalEmail();
    waitForAmountInput();
  }

  if (d.readyState === "loading") {
    d.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
