export default defineContentScript({
 matches: ["<all_urls>"],
 excludeMatches: [],
 runAt: "document_end",
 main(ctx) {
  console.log("Hello content.");
 },
});
