-- CreateTable
CREATE TABLE "quiz_questions_table" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "choices" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "subtopic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_table_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "quiz_questions_table" ADD CONSTRAINT "quiz_questions_table_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
