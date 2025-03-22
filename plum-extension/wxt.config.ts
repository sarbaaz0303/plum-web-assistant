import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
 vite: (env) => ({}),
 srcDir: "src",

 manifest: {
  name: "Plum - AI Web Assistant",
  author: {
   email: "sarbaaz0303@gmail.com",
  },
  version_name: "0.0.1-alpha",
  description:
   "An intelligent chatbot that helps you understand and interact with web content",
  action: {
   default_title: "Open Plum Assistant",
  },
  host_permissions: ["<all_urls>"],
  permissions: [
   "storage",
   "sidePanel",
   "tabs",
   "activeTab",
   "scripting",
   "clipboardWrite",
   "webNavigation",
  ],
 },

 extensionApi: "chrome",
 modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
 autoIcons: {
  baseIconPath: "./assets/icon.png",
  grayscaleOnDevelopment: false,
 },
});
