(function () {
  "use strict";
  const g = () =>
    new Promise((d, u) => {
      let r = !1,
        e = 0,
        c = 0,
        n,
        o;
      ((n = document.createElement("div")),
        (n.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999999;
      cursor: crosshair;
      user-select: none;
    `),
        (o = document.createElement("div")),
        (o.style.cssText = `
      position: absolute;
      border: 2px dashed #0066ff;
      background: rgba(0, 102, 255, 0.1);
      display: none;
      pointer-events: none;
    `),
        n.appendChild(o),
        document.body.appendChild(n));
      const i = () => {
          (document.body.contains(n) && document.body.removeChild(n),
            document.removeEventListener("keydown", s));
        },
        s = (t) => {
          t.key === "Escape" && (i(), u(new Error("Selection cancelled")));
        };
      (n.addEventListener("mousedown", (t) => {
        (t.preventDefault(),
          (r = !0),
          (e = t.clientX),
          (c = t.clientY),
          (o.style.display = "block"),
          (o.style.left = e + "px"),
          (o.style.top = c + "px"),
          (o.style.width = "0px"),
          (o.style.height = "0px"));
      }),
        n.addEventListener("mousemove", (t) => {
          if (!r) return;
          const a = Math.abs(t.clientX - e),
            m = Math.abs(t.clientY - c),
            l = Math.min(t.clientX, e),
            h = Math.min(t.clientY, c);
          ((o.style.left = l + "px"),
            (o.style.top = h + "px"),
            (o.style.width = a + "px"),
            (o.style.height = m + "px"));
        }),
        n.addEventListener("mouseup", (t) => {
          if (!r) return;
          const a = {
            x: Math.min(t.clientX, e),
            y: Math.min(t.clientY, c),
            width: Math.abs(t.clientX - e),
            height: Math.abs(t.clientY - c),
          };
          (i(),
            a.width < 10 || a.height < 10
              ? u(new Error("Selection too small (minimum 10x10 pixels)"))
              : d(a));
        }),
        document.addEventListener("keydown", s));
    });
  (chrome.runtime.onMessage.addListener((d, u, r) => {
    switch ((console.log("Content script received message:", d), d.action)) {
      case "getPageInfo":
        r({ url: window.location.href, title: document.title });
        break;
      case "extractHtml":
        try {
          const e = document.documentElement.outerHTML;
          (console.log("Extracted HTML body content"), r({ text: e }));
        } catch (e) {
          (console.error("HTML body extraction error:", e),
            r({
              error:
                e instanceof Error ? e.message : "HTML body extraction failed",
            }));
        }
        break;
      case "startCapture":
        (console.log("Screen capture requested"), r({ success: !0 }));
        break;
      case "startImageCapture":
        return (
          (async () => {
            try {
              const e = await g(),
                c = await new Promise((n, o) => {
                  chrome.runtime.sendMessage(
                    { action: "captureAndCrop", selection: e },
                    (i) => {
                      chrome.runtime.lastError
                        ? o(new Error(chrome.runtime.lastError.message))
                        : n(i);
                    },
                  );
                });
              r(c);
            } catch (e) {
              r({
                error: e instanceof Error ? e.message : "Image capture failed",
              });
            }
          })(),
          !0
        );
      case "processImage":
        return (
          (async () => {
            try {
              const { dataUrl: e, selection: c } = d,
                { x: n, y: o, width: i, height: s } = c,
                t = new Image();
              ((t.onload = () => {
                try {
                  const a = document.createElement("canvas"),
                    m = a.getContext("2d");
                  if (!m) {
                    r({ error: "Canvas context not available" });
                    return;
                  }
                  ((a.width = i), (a.height = s));
                  const l = window.devicePixelRatio || 1;
                  m.drawImage(t, n * l, o * l, i * l, s * l, 0, 0, i, s);
                  const h = a.toDataURL("image/jpeg", 0.8);
                  r({ dataUrl: h });
                } catch (a) {
                  r({
                    error:
                      a instanceof Error
                        ? a.message
                        : "Image processing failed",
                  });
                }
              }),
                (t.onerror = () => {
                  r({ error: "Failed to load captured image" });
                }),
                (t.src = e));
            } catch (e) {
              r({
                error:
                  e instanceof Error ? e.message : "Image processing failed",
              });
            }
          })(),
          !0
        );
      default:
        r({ error: "Unknown action" });
    }
    return !0;
  }),
    console.log("Robotaro content script loaded"));
})();
