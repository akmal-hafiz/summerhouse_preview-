import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign in - Summerhouses Bali",
  description: "Sign in to your Summerhouses account to keep your saved villas synced across devices.",
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
