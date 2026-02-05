const commentSchema = {
  text: { type: "string", required: true, min: 1, max: 500 },
};

module.exports = { commentSchema };
