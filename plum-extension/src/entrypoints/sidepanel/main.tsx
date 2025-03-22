import React from "react";
import ReactDOM from "react-dom/client";

import "~/assets/styles/globals.css";

import PlumChatBot from "@/components/plum-chat-bot";

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode>
  <PlumChatBot />
 </React.StrictMode>
);
