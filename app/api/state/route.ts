import { S } from "@/lib/server/store";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(S());
}
