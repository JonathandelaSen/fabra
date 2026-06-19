import { UpdatePasswordForm } from "@/frontend/features/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen overflow-hidden bg-canvas text-text-main">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-280px] mx-auto h-[520px] max-w-4xl bg-action/[0.08] blur-[150px]" />
        <div className="absolute inset-x-0 bottom-[-320px] mx-auto h-[520px] max-w-3xl bg-action/[0.06] blur-[150px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <section className="w-full max-w-[460px]">
          <div className="mb-8 flex items-center justify-center gap-3">
            <img src="/brand/fabra-logo.svg" alt="Fabra Logo" className="w-24 h-24 object-contain" />
          </div>

          <UpdatePasswordForm />
        </section>
      </div>
    </main>
  );
}
