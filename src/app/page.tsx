import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs tracking-[0.2em] text-spark uppercase mb-4">
        Every match, one dashboard
      </p>
      <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] max-w-3xl">
        Your matches keep texting.
        <br />
        <span className="text-spark">Someone should reply.</span>
      </h1>
      <p className="mt-6 text-text-muted max-w-md text-lg">
        Connect a WhatsApp number, set the tone, and watch every conversation
        stay warm — without watching every conversation.
      </p>
      <div className="mt-10">
        <SignInButton mode="modal">
          <button className="bg-spark hover:bg-spark-glow transition-colors text-white font-medium px-7 py-3 rounded-full shadow-spark-glow">
            Sign in to your dashboard
          </button>
        </SignInButton>
      </div>
    </main>
  );
}
