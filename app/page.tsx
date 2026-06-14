import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <Image
        src="/logo-512.png"
        alt="Myranda"
        width={96}
        height={96}
        priority
        className="mb-7 h-20 w-20 drop-shadow-[0_10px_30px_rgba(120,50,200,0.45)] sm:h-24 sm:w-24"
      />
      <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
        Myranda Consent
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl">
        Your data. Your keys. Your consent, on the record.
      </p>
      <Link
        href="/app"
        className="mt-10 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        Open the app →
      </Link>
    </main>
  );
}
