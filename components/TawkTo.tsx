
"use client";

import Script from "next/script";

export default function TawkTo() {
  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();

          (function () {
            var s1 = document.createElement("script");
            var s0 = document.getElementsByTagName("script")[0];

            s1.async = true;
            s1.src = "https://embed.tawk.to/6ada8c0463905d345e40317a/1k5ir5u2r";
            s1.charset = "UTF-8";
            s1.setAttribute("crossorigin", "*");

            if (s0 && s0.parentNode) {
              s0.parentNode.insertBefore(s1, s0);
            } else {
              document.head.appendChild(s1);
            }
          })();
        `,
      }}
    />
  );
}
