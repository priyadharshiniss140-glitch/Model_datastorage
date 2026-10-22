import { Router, type NextFunction, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";

const postsRouter = Router();

function prismaErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }

  const code = error.code;
  return typeof code === "string" ? code : undefined;
}

postsRouter.post(
  "/:id/vote",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const postId = parseInt(req.params.id as string, 10);
    const userId = req.user.id;

    // Validate before making any database calls.
    if (isNaN(postId)) {
      res.status(400).json({ error: "invalid post id" });
      return;
    }

    try {
      // Increment first so a missing post raises P2025. If Vote creation then
      // fails with P2002, the transaction rolls the increment back atomically.
      const [post] = await prisma.$transaction([
        prisma.post.update({
          where: { id: postId },
          data: { score: { increment: 1 } },
          select: { id: true, score: true },
        }),
        prisma.vote.create({
          data: { userId, postId },
          select: { id: true },
        }),
      ]);

      res.status(201).json({ postId: post.id, score: post.score });
    } catch (error: unknown) {
      const code = prismaErrorCode(error);

      if (code === "P2002") {
        res.status(409).json({ error: "already voted" });
        return;
      }

      if (code === "P2025") {
        res.status(404).json({ error: "post not found" });
        return;
      }

      next(error);
    }
  },
);

export default postsRouter;
