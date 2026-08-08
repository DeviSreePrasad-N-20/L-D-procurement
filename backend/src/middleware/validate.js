/**
 * Wraps a Zod schema as Express middleware. Validates req.body by default;
 * pass { source: 'query' | 'params' } to validate elsewhere.
 */
export function validate(schema, { source = 'body' } = {}) {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request failed validation',
          details: result.error.flatten(),
        },
      });
    }
    req[source] = result.data;
    next();
  };
}
