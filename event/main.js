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
    window.location.href =
      "https://chromewebstore.google.com/detail/diam-wallet/oakkognifoojdbfjaccegangippipdmn";
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

document.querySelector("#register-from").addEventListener("submit", async (e) => {
  e.preventDefault();
  let formData = new FormData(e.target);
  let data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  data.publicKey = localStorage.getItem("publicKey");
  let eventId = getEventId();
  if (!eventId) {
    alert("Invalid event");
    return;
  }
  data.eventId = eventId;
  console.log(data); // { name, email, eventId, publicKey }
  // send data
  let res = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let json = await res.json();
  let xdr = json.xdr;
  if (!success || !xdr) {
    return alert(json.message);
  }
  console.log("XDR:", xdr);
  console.log("Data:", json.data);
  signTransaction(xdr);
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

function signTransaction(xdr) {
  if (window.diam) {
    window.diam
      .sign(xdr, true, "Diamante Testnet 2024")
      .then((result) => {
        console.log("Transaction signed:", result);
        alert("Registered successfully");
      })
      .catch((error) => {
        console.error("Error signing transaction:", error);
        alert("An error occurred. Please try again");
      });
  } else {
    alert("Diam Wallet extension not found");
  }
}