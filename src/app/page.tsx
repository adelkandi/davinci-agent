export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-semibold">DaVinci</h1>
      <p className="text-sm text-gray-500">From customer message to field action.</p>
      <p className="text-xs text-gray-400 mt-4">
        WhatsApp webhook: <code>/api/whatsapp</code> · Debug view:{" "}
        <a className="underline" href="/mission-control">
          /mission-control
        </a>
      </p>
    </main>
  );
}
