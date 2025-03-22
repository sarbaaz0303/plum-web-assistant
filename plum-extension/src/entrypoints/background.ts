import { onMessage } from "webext-bridge/background";

interface MessageData {
 messages: any[];
 url: string;
}

interface ResponseData {
 success: boolean;
 content?: any;
 error?: string;
}

type Item = { role: string; content: string };

export default defineBackground(() => {
 console.log("Background script initialized.");

 // Handle extension installation
 browser.runtime.onInstalled.addListener(async (details) => {
  try {
   await browser.sidePanel.setOptions({
    enabled: true,
   });
   console.log("Side panel enabled successfully");
  } catch (error) {
   console.error("Failed to enable side panel:", error);
  }
 });

 // Set panel behavior
 try {
  browser.sidePanel
   .setPanelBehavior({ openPanelOnActionClick: true })
   .catch((error) => {
    console.error("Failed to set panel behavior:", error);
   });
 } catch (error) {
  console.error("Error setting panel behavior:", error);
 }

 // Handle messages from content script or popup
 onMessage("USER_MESSAGE", async (message): Promise<ResponseData> => {
  console.log("Received message:", message);
  try {
   // Get the current active tab URL using async/await
   const url = await getCurrentTabUrl();
   const messages = message.data as unknown as any[];
   console.log("sanitizeErrors: ", sanitizeErrors(messages));

   // Send data to backend
   const data = await sendData("http://localhost:8000/response/", {
    messages: sanitizeErrors(messages),
    url,
   });

   if (!data) {
    throw new Error("No data returned from server");
   }

   return { success: true, content: data };
  } catch (error) {
   console.error("Error processing message:", error);
   return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error occurred",
   };
  }
 });
});

function sanitizeErrors(arr: Item[]): Item[] {
 return arr.map((item) =>
  item.role === "error" ? { role: "assistant", content: "" } : item
 );
}

// Helper function to get current tab URL
async function getCurrentTabUrl(): Promise<string> {
 try {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0 && tabs[0].url) {
   return tabs[0].url;
  }
  return "";
 } catch (error) {
  console.error("Error getting tab URL:", error);
  return "";
 }
}

// Helper function to send data to backend
async function sendData(url: string, data: MessageData): Promise<any> {
 try {
  const response = await fetch(url, {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
   },
   body: JSON.stringify(data),
  });

  if (!response.ok) {
   throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();
  return result['answer'];
 } catch (error) {
  console.error("Network error:", error);
  throw error; // Re-throw to handle in the caller
 }
}
