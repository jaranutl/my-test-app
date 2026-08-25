const DATABASE_TIME = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:[+-]\d{2}(?::?\d{2})?)?$/;

export const formatOrderTime = (value: string | null | undefined) => {
  if (!value) return "—";
  const match = DATABASE_TIME.exec(value);
  return match ? `${match[1]}:${match[2]} น.` : "—";
};
