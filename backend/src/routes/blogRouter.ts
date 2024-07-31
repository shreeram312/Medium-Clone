import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

//....................................................................................

blogRouter.use("/*", async (c, next) => {
  //get the header
  // verify the header
  //if the header is correct then good to go
  // else return 403 status code to user
  const jwt = c.req.header("Authorization") || "";
  if (!jwt || !jwt.startsWith("Bearer ")) {
    c.status(403);
    return c.json({
      msg: "No JWT or incorrect format",
    });
  }

  const token = jwt.split(" ")[1];

  const payload = await verify(token, c.env.SECRET);
  if (!payload) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  //@ts-ignore
  c.set("userId", payload.id);
  await next();
});

//......................................................................................
blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const authorId = c.get("userId");

  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: authorId,
      published: true,
    },
  });

  return c.json({
    message: blog.id,
  });
});

//.....................................................................................

blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const blog = await prisma.blog.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.json({
    message: blog,
  });
});

//.................................................................................

blogRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const blog = await prisma.blog.findUnique({
    where: {
      id: c.req.param("id"),
    },
  });

  return c.json({
    message: blog,
  });
});
//.................................................................................

//add  pagination
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const blogs = await prisma.blog.findMany();

  return c.json({
    message: blogs,
  });
});