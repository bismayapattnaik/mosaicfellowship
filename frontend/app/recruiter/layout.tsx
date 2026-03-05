import Navbar from "@/components/Navbar";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080808] relative">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <Navbar />
      <main className="relative z-10 max-w-screen-2xl mx-auto px-6 md:px-12 py-8">
        {children}
      </main>
    </div>
  );
}
