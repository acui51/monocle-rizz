import { connect, disconnect, isConnected } from "./bluetooth.js";
import { startNordicDFU } from "./nordicdfu.js";

export async function ensureConnected(statusCallback, relayCallback) {
  console.log("connecting");
  if (isConnected() === true) {
    return;
  }

  try {
    console.log("trying to connect");
    let connectionResult = await connect(relayCallback);

    if (connectionResult === "dfu connected") {
      statusCallback("Starting firmware update..");

      await startNordicDFU().catch(() => {
        disconnect();
        throw "Bluetooth error. Reconnect or check console for details";
      });
      disconnect();
    }

    if (connectionResult === "repl connected") {
      statusCallback("Connected");
    }
  } catch (error) {
    // Ignore User cancelled errors
    if (error.message && error.message.includes("cancelled")) {
      return;
    }
    statusCallback(JSON.stringify(error));
    console.error(error);
  }
}

export function reportUpdatePercentage(percentage, statusCallback) {
  statusCallback("Updating " + percentage + "%..");
}

export function receiveRawData(event) {
  console.log(event.target.value);
}

export function onDisconnect(statusCallback) {
  // if (infoText.innerHTML.includes("Reconnect")) {
  //     return;
  // }

  statusCallback("Disconnected");
}
