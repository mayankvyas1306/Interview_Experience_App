const isEmail = (value) =>
  typeof value === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validateObject = (value, schema, path, errors) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    errors.push(`${path} must be an object`);
    return;
  }

  Object.entries(schema).forEach(([key, rules]) => {
    const fieldPath = `${path}.${key}`;
    const fieldValue = value[key];
    validateValue(fieldValue, rules, fieldPath, errors);
  });
};

const validateValue = (value, rules, path, errors) => {
  if (value === undefined || value === null || value === "") {
    if (rules.required) {
      errors.push(`${path} is required`);
    }
    return;
  }

  const type = rules.type;

  if (type === "string") {
    if (typeof value !== "string") {
      errors.push(`${path} must be a string`);
      return;
    }
    if (rules.min && value.trim().length < rules.min) {
      errors.push(`${path} must be at least ${rules.min} characters`);
    }
    if (rules.max && value.trim().length > rules.max) {
      errors.push(`${path} must be at most ${rules.max} characters`);
    }
    return;
  }

  if (type === "email") {
    if (!isEmail(value)) {
      errors.push(`${path} must be a valid email`);
    }
    return;
  }

  if (type === "number") {
    const numberValue = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(numberValue)) {
      errors.push(`${path} must be a number`);
      return;
    }
    if (rules.min !== undefined && numberValue < rules.min) {
      errors.push(`${path} must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && numberValue > rules.max) {
      errors.push(`${path} must be at most ${rules.max}`);
    }
    return;
  }

  if (type === "enum") {
    if (!rules.values.includes(value)) {
      errors.push(`${path} must be one of: ${rules.values.join(", ")}`);
    }
    return;
  }

  if (type === "arrayOfStrings") {
    if (!Array.isArray(value)) {
      errors.push(`${path} must be an array`);
      return;
    }
    const invalid = value.some((item) => typeof item !== "string");
    if (invalid) {
      errors.push(`${path} must only contain strings`);
    }
    return;
  }

  if (type === "arrayOfObjects") {
    if (!Array.isArray(value)) {
      errors.push(`${path} must be an array`);
      return;
    }
    if (rules.fields) {
      value.forEach((item, index) => {
        validateObject(item, rules.fields, `${path}[${index}]`, errors);
      });
    }
  }
};

const validateBody = (schema) => (req, res, next) => {
  const errors = [];

  Object.entries(schema).forEach(([key, rules]) => {
    validateValue(req.body[key], rules, key, errors);
  });

  if (errors.length) {
    res.status(400);
    return next(new Error(errors.join(" | ")));
  }

  return next();
};

module.exports = { validateBody };
