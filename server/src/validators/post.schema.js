const basePostSchema = {
  companyName: { type: "string", required: true, min: 1 },
  role: { type: "string", required: true, min: 1 },
  tags: { type: "arrayOfStrings", required: false },
  difficulty: {
    type: "enum",
    required: false,
    values: ["Easy", "Medium", "Hard"],
  },
  result: {
    type: "enum",
    required: false,
    values: ["Selected", "Rejected", "Waiting"],
  },
  rounds: {
    type: "arrayOfObjects",
    required: false,
    fields: {
      roundName: { type: "string", required: true, min: 1 },
      description: { type: "string", required: false, min: 0 },
      questions: { type: "arrayOfStrings", required: false },
    },
  },
};

const createPostSchema = basePostSchema;

const updatePostSchema = Object.fromEntries(
  Object.entries(basePostSchema).map(([key, rules]) => [
    key,
    { ...rules, required: false },
  ]),
);

module.exports = { createPostSchema, updatePostSchema };
