import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthScreen } from "@/components/auth/auth-screen";
import { auth } from "@/lib/auth";
import { getUserStatus } from "@/lib/server/admin";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    const status = await getUserStatus(session.user.id);
    if (!status?.approved) {
      redirect("/pending");
    }
    redirect("/dashboard");
  }

  return <AuthScreen />;
}
