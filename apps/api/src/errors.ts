export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, 'not_found', `${what} not found`);
export const forbidden = () =>
  new HttpError(403, 'forbidden', 'You do not have access to this resource');
export const conflict = (message: string) => new HttpError(409, 'conflict', message);

export function toId(raw: string): number {
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error(`Invalid id: ${raw}`);
  return n;
}
