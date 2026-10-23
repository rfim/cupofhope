import localFont from "next/font/local";

export const lufga = localFont({
  src: [
    { path: "./fonts/LufgaRegular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/LufgaItalic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/LufgaMedium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/LufgaSemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/LufgaBold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-lufga",
  display: "swap",
});

// Handwriting, as on the printed Cards of Hope ("reminder for you", "with love,").
export const caveat = localFont({
  src: [{ path: "./fonts/Caveat.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-caveat",
  display: "swap",
});
