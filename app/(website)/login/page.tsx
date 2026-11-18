import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Summerhouses account to keep your saved villas synced across devices.",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const target = new URLSearchParams({ auth: "login" });
  const redirectTo = params?.redirect;

  if (typeof redirectTo === "string" && redirectTo) {
    target.set("redirect", redirectTo);
  }

  redirect(`/?${target.toString()}`);
}
