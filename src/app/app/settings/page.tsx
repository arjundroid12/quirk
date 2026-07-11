import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mail } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  return (
    <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
        Settings
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-8">Your account</h1>
      <div className="space-y-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full brand-gradient flex items-center justify-center text-white text-lg font-bold">
            {(user?.name ?? user?.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold flex items-center gap-2">
              {user?.name ?? "Creator"}
              <Badge variant="secondary" className="bg-brand/10 text-brand"><Sparkles className="h-3 w-3 mr-1" />Founding member</Badge>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5"><Mail className="h-3 w-3" />{user?.email}</div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Plan</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Free (Founding member)</div>
              <div className="text-sm text-muted-foreground mt-0.5">Unlimited scripts during the beta period. Thank you for being early.</div>
            </div>
            <Badge className="brand-gradient text-white">Beta</Badge>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">What's next</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand mt-2" /><span>Content calendar — your next 30 days mapped automatically</span></li>
            <li className="flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand mt-2" /><span>Cross-platform adapter — auto-resize per platform</span></li>
            <li className="flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand mt-2" /><span>Retention Doctor — AI retention analyzer</span></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
