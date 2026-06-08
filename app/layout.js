import "./globals.css";

export const metadata = {
  title: "TSA Line Predictor",
  description: "Predict how long the airport security line will be — before you leave.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
