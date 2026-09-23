import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const agentTripwireCasesTable = pgTable("agent_tripwire_cases", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("new"),
  analystNotes: text("analyst_notes").notNull().default(""),
  severity: text("severity").notNull(),
  score: integer("score").notNull(),
  findings: jsonb("findings").notNull(),
  timeline: jsonb("timeline").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type AgentTripwireCase = typeof agentTripwireCasesTable.$inferSelect;