const registerSchema = {
  fullName: { type: "string", required: true, min: 1 },
  email: { type: "email", required: true },
  password: { type: "string", required: true, min: 6 },
  college: { type: "string", required: false },
  year: { type: "number", required: false, min: 1, max: 6 },
};

const loginSchema = {
  email: { type: "email", required: true },
  password: { type: "string", required: true, min: 6 },
};

module.exports = { registerSchema, loginSchema };
