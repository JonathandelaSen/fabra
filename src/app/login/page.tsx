import { AuthForm, AuthHeroTitle } from "@/features/auth";
import { getMessages } from "@/i18n/messages";
import { resolveInterfaceLanguage } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{
    accountDeleted?: string;
    oauthError?: string;
    resetError?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const locale = await resolveInterfaceLanguage();
  const messages = getMessages(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <main className="min-h-screen overflow-hidden bg-canvas text-text-main">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 top-[-280px] mx-auto h-[520px] max-w-4xl bg-action/[0.08] blur-[150px]" />
        <div className="absolute inset-x-0 bottom-[-320px] mx-auto h-[520px] max-w-3xl bg-action/[0.06] blur-[150px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-10">
        <section className="w-full max-w-[460px]">
          <div className="mb-8 flex items-center justify-center gap-3">
            <img src="/brand/fabra-logo.svg" alt="Fabra Logo" className="w-24 h-24 object-contain" />
          </div>

          <div className="mb-6 text-center">
            <AuthHeroTitle />
          </div>

          <AuthForm
            initialError={
              params.oauthError
                ? messages.auth.google.callbackError
                : params.resetError
                ? messages.auth.resetInvalid
                : undefined
            }
            initialMessage={
              params.accountDeleted
                ? messages.auth.accountDeleted
                : undefined
            }
          />
        </section>
      </div>
    </main>
  );
}
