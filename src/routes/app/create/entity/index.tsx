import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { drizzleDb } from "~/db/db";
import { entities } from "@/drizzle/schema";

export const useCreateEntityAction = routeAction$(
  async (input) => {
    const db = await drizzleDb;
    const x = await db
      .insert(entities)
      .values([input])
      .returning({ id: entities.id });
    console.log(x);
    const y = await db.select().from(entities);
    console.log(y);
  },
  zod$({
    address: z.string(),
    company: z.string(),
  }),
);

export default component$(() => {
  const createAction = useCreateEntityAction();
  return (
    <>
      <Form action={createAction}>
        <div class="mx-auto flex max-w-prose flex-col">
          <input name="address" placeholder="Address"></input>
          <input name="company" placeholder="Company"></input>
          <button type="submit">Submit</button>
        </div>
      </Form>
    </>
  );
});
