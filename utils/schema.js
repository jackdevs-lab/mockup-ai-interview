import { serial, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const Interview = pgTable('Interview', {
    id: serial('id').primaryKey(),
    jsonResp: text('jsonResp').notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: timestamp('createdAt'),   
     MockId: varchar('MockId').notNull()
});

export const userAnswer=pgTable('useranswer',{
    id: serial('id').primaryKey(),
    MockIdRef:varchar('MockIdRef').notNull(),
    question:varchar('question').notNull(),
    correctAnswer:text('correctAnswer'),
    userAnswer:text('userAnswer'),
    feedback:text('feedback'),
    rating:varchar('rating'),
    userEmail:varchar('userEmail'),
    createdAt: timestamp('createdAt')
})