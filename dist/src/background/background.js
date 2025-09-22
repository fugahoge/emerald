(function () {
  "use strict";
  (console.log("Emerald background script loaded"),
    chrome.runtime.onInstalled.addListener((r) => {
      console.log("Extension installed:", r);
    }),
    chrome.action.onClicked.addListener((r) => {
      r.id && chrome.sidePanel.open({ tabId: r.id });
    }),
    chrome.runtime.onMessage.addListener((r, t, e) => {
      switch ((console.log("Background received message:", r), r.action)) {
        case "captureScreen":
          if (t.tab?.id)
            return (
              chrome.tabs.captureVisibleTab(
                t.tab.windowId,
                { format: "png" },
                (a) => {
                  e({ dataUrl: a });
                },
              ),
              !0
            );
          break;
        case "captureAndCrop":
          if (t.tab?.id && r.selection)
            return (
              chrome.tabs.captureVisibleTab(
                t.tab.windowId,
                { format: "png" },
                async (a) => {
                  if (chrome.runtime.lastError) {
                    e({ error: chrome.runtime.lastError.message });
                    return;
                  }
                  try {
                    const { x: o, y: n, width: l, height: s } = r.selection,
                      i = (c = 0) => {
                        chrome.tabs.sendMessage(
                          t.tab.id,
                          {
                            action: "processImage",
                            dataUrl: a,
                            selection: { x: o, y: n, width: l, height: s },
                          },
                          (d) => {
                            chrome.runtime.lastError
                              ? c < 3
                                ? setTimeout(() => i(c + 1), 100)
                                : e({ error: "Content script not available" })
                              : e(d);
                          },
                        );
                      };
                    i();
                  } catch (o) {
                    e({
                      error:
                        o instanceof Error
                          ? o.message
                          : "Image processing failed",
                    });
                  }
                },
              ),
              !0
            );
          break;
        default:
          e({ error: "Unknown action" });
      }
      return !1;
    }));
})();
