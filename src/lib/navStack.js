const STACK_KEY = "neh_nav_stack";
const LIMIT = 30;

const PORTAL_PATHS = [
  "/account",
  "/admin",
  "/admin/add-member",
  "/treasurer",
  "/secretary",
  "/chairperson",
  "/vice-chair",
  "/organising",
];

function read() {
  try {
    return JSON.parse(localStorage.getItem(STACK_KEY)) || [];
  } catch {
    return [];
  }
}

function write(stack) {
  try {
    localStorage.setItem(STACK_KEY, JSON.stringify(stack));
  } catch {
    /* ignore storage errors */
  }
}

export function recordPath(path) {
  const stack = read();
  if (stack[stack.length - 1] !== path) {
    stack.push(path);
    if (stack.length > LIMIT) stack.shift();
    write(stack);
  }
}

export function previousPortalPath(current) {
  const stack = read();
  const idx = stack.lastIndexOf(current);
  if (idx <= 0) return null;
  for (let i = idx - 1; i >= 0; i--) {
    const p = stack[i];
    if (p !== current && PORTAL_PATHS.includes(p)) {
      return p;
    }
  }
  return null;
}

export function clearNavStack() {
  write([]);
}

export const ROLE_HOME = {
  member: "/account",
  admin: "/admin",
  treasurer: "/treasurer",
  secretary: "/secretary",
  chairperson: "/chairperson",
  vicechairperson: "/vice-chair",
  organising: "/organising",
};

export function resetNavStack(startPath) {
  write(startPath ? [startPath] : []);
}