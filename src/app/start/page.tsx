import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { resolveHomePath } from "@/lib/home-path";

/** Smart landing after login/signup — routes by readiness, not a fixed page. */
export default async function StartPage() {
  const session = await requireSession();
  redirect(await resolveHomePath(session.user.id));
}
