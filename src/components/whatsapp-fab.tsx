import { Chat } from "./icons";

export function WhatsAppFab({ number, name }: { number: string; name: string }) {
  if (!number) return null;
  const text = encodeURIComponent(`Hi ${name}, I have a question.`);
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener"
      className="group fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-[#1f9e55] py-3 pl-3.5 pr-3.5 text-white shadow-[0_8px_24px_-6px_rgba(14,22,40,.45)] transition-[padding] hover:pr-5"
    >
      <Chat className="h-6 w-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-300 group-hover:max-w-40 group-focus-visible:max-w-40">Chat on WhatsApp</span>
    </a>
  );
}
