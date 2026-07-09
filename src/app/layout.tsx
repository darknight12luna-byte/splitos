import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { Onboarding } from "@/components/Onboarding";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gymfit",
  description: "Your daily training check-in, session tracker, and progress dashboard.",
};

async function getTodaySessionHref(): Promise<string> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const session = await prisma.sessionLog.findFirst({
    where: { date: { gte: todayStart } },
    orderBy: { date: "desc" },
    select: { id: true, status: true },
  });

  if (!session) return "/";
  return session.status === "COMPLETED" || session.status === "SKIPPED"
    ? `/content?session=${session.id}`
    : `/session/${session.id}`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const todaySessionHref = await getTodaySessionHref();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Onboarding />
        <TopNav todaySessionHref={todaySessionHref} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
        <BottomNav todaySessionHref={todaySessionHref} />
      </body>
    </html>
  );
}
