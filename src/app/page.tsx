import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserStatus } from "@/lib/server/admin";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  const status = await getUserStatus(session.user.id);
  if (!status?.approved) {
    redirect("/pending");
  }

  redirect("/dashboard");
}
