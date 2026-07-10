import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { IdeaEngine } from "@/components/idea-engine/idea-engine";

export default async function IdeasPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const ideas = await db.idea.findMany({
    where: { authorId: user?.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Serialize dates for client component
  const serialized = ideas.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
          Idea Engine
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Never run out of ideas.
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Tell us your niche, platform, and tone. We'll generate 8 scroll-stopping content ideas you can save to your bank, mark as filmed, published, or killed.
        </p>
      </div>

      <IdeaEngine initialIdeas={serialized} />
    </div>
  );
}
