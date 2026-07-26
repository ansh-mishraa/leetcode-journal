import { redirect } from "next/navigation";

/** Legacy path — Recall Engine lives at /recall */
export default function ReviewRedirectPage() {
  redirect("/recall");
}
