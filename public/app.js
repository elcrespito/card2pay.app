/*
 * Card2Pay — BuyCoin (Extop) payment automation.
 *
 * The widget itself is embedded by a parser-inserted <script> in index.html
 * (data-token comes from the runtime env config). This file:
 *   1. Reads `amount` and `wallet` from the URL.
 *      `wallet` is the destination address the crypto is settled to
 *      (e.g. the NOWPayments-generated deposit address for the merchant).
 *   2. Prefills the amount, relabels the action, sets the receiver wallet,
 *      and drives the widget to the hosted payment page (/x/ex/...).
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
  // The automation only runs for traffic coming from the configured origin
  // (e.g. "peptides"). Set ALLOWED_REFERRER to "*" (or empty) to disable.

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

  // ---- Automation steps --------------------------------------------------

  function waitForAmountInput() {
    var input = d.getElementById("paymentAmount");

    if (!input) {
      setTimeout(waitForAmountInput, 500);
      return;
    }

    if (amount !== null) {
      input.value = amount;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    var exchange = d.getElementById("exchange");

    if (exchange) {
      exchange.textContent = "Proceed to Payment";

      exchange.onclick = function () {
        setWallet();
        setWalletLabel();
        setConfirmButtonText();
      };
    }
  }

  function setWallet() {
    var wallet = d.getElementsByName("wallet")[0];

    if (!wallet) {
      setTimeout(setWallet, 500);
      return;
    }

    wallet.value = walletValue;
    wallet.dispatchEvent(new Event("input", { bubbles: true }));
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
    setTimeout(clickButton, 500);
  }

  function clickButton() {
    var button = d.getElementById("confirm");

    if (!button) return;

    window.open = function (url) {
      if (url && url.includes("/x/ex/")) {
        window.location.href = url;
      }
    };

    button.click();
  }

  // ---- Boot --------------------------------------------------------------

  function start() {
    hideLoaderWhenReady();

    // Our own checkout iframe passes auto=1 to force the automation on.
    var auto = getParam("auto") === "1";
    if (!auto && !referrerAllowed()) return;
    if (walletValue === null || walletValue.trim() === "") return;

    waitForAmountInput();
  }

  if (d.readyState === "loading") {
    d.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
