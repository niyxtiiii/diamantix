import "../globals.css";
import "../forms.css";
import "./local.css";

import DOMPurify from "dompurify";
import { parse } from "marked";
import * as DiamSdk from "diamnet-sdk";

const server = new DiamSdk.Aurora.Server("https://diamtestnet.diamcircle.io/");
const NETWORK_PASSPHRASE = "Diamante Testnet 2024";

async function connectWallet() {
  if (window.diam) {  // Checking if the Diam Wallet extension is installed
    try {
      const result = await window.diam.connect();
      const diamPublicKey = result.message[0].diamPublicKey;  // Fetches user's public key
      console.log(`User active public key is: ${diamPublicKey}`);
      localStorage.setItem('publicKey', diamPublicKey);  // Stores public key for later use
      return diamPublicKey;
    } catch (error) {
      console.error(`Error: ${error}`);
      alert('Failed to connect wallet');
      throw new Error('Failed to connect wallet');
    }
  } else {
    alert('Wallet extension not found');
    throw new Error('Wallet extension not found');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  let eventId = getEventId();
  if (!eventId) {
    // window.location.href = "/";
  }
  // fetch event details
  // process
  // display event details
  let description = `# REPLACE THIS WITH ACTUAL CONTENT
  ### This is a subheading
  normal paragraph

  - list item 1
  - list item 2
  - list item 3

  **bold text**
  `;
  document.querySelector("#description-content").innerHTML = DOMPurify.sanitize(parse(description));
});

document.querySelector("#register-btn").addEventListener("click", () => {
  document.querySelector("#register-dialog").showModal();
});

document.querySelector("#connect-wallet").addEventListener("click", async () => {
  let publicKey = await connectWallet();
  if (!publicKey) {
    alert('Failed to connect wallet');
    document.querySelector("#register-dialog").close();
    return;
  }
  // connect wallet
  // process
  // if success show details form and hide connect wallet button
  document.querySelector("#connect-wallet").classList.toggle("hidden", true);

  document.querySelector("#public-key").textContent = publicKey;
  document.querySelector("#public-key").setAttribute("title", publicKey);
  document.querySelector("#additional-details").classList.toggle("hidden", false);
});

document.querySelector("#register-from").addEventListener("submit", (e) => {
  e.preventDefault();
  let formData = new FormData(e.target);
  let data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  console.log(data); // { name, email }
  // process
  // if success, close dialog
  document.querySelector("#register-dialog").close();
});

document.querySelector("#close-dialog").addEventListener("click", () => {
  closeDialog();
});


function getEventId() {
  return new URLSearchParams(window.location.search).get("id");
}

function closeDialog() {
  document.querySelector("#register-dialog").close();
  // clear form
  document.querySelector("#register-from").reset();
}