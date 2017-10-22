import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

type Expr = string | { head: Expr, tail: Expr };
function hasHeadWith(expr: Expr, pred: (e: Expr) => boolean): boolean {
  return typeof expr !== "string" && pred(expr.head);
}
function reduce(e: Expr): Expr | null {
  if (typeof e === "string")
    return null;
  // i
  if (hasHeadWith(e, h => h === "i"))
    return e.tail;
  // u
  if (hasHeadWith(e, h => h === "u"))
    return { head: { head: e.tail, tail: "s" }, tail: "k" };
  // b
  if (hasHeadWith(e, h => hasHeadWith(h, h2 => hasHeadWith(h2, h3 => h3 === "b"))))
    return { head: (e.head as any).head.tail, tail: { head: (e.head as any).tail, tail: e.tail } };
  // s
  if (hasHeadWith(e, h => hasHeadWith(h, h2 => h2 === "s") && (h as any).tail === "k"))
    return "i";
  if (hasHeadWith(e, h => hasHeadWith(h, h2 => hasHeadWith(h2, h3 => h3 === "s"))))
    return { head: { head: (e.head as any).head.tail, tail: e.tail }, tail: { head: (e.head as any).tail, tail: e.tail } };
  // k
  if (hasHeadWith(e, h => hasHeadWith(h, h2 => h2 === "k")))
    return (e.head as any).tail;
  const head2 = reduce(e.head);
  if (head2)
    return { head: head2, tail: e.tail };
  const tail2 = reduce(e.tail);
  if (tail2)
    return { head: e.head, tail: tail2 };
  return null;
}
function print(e: Expr): string {
  return typeof e === "string"
    ? e
    : `(${print(e.head)} ${print(e.tail)})`;
}
function canon(e: Expr): string {
  if (typeof e === "string")
    switch (e) {
      case "k": return "11100";
      case "s": return "11111000";
      case "i": return canon({ head: { head: "s", tail: "k" }, tail: "k" });
      case "u": return canon({ head: { head: "s", tail: { head: { head: "s", tail: "i" }, tail: { head: "k", tail: "s" } } }, tail: { head: "k", tail: "k" } }); // ((S ((S I) (K S))) (K K))
      case "b": return canon({ head: { head: "s", tail: { head: "k", tail: "s" } }, tail: "k" });
      default: return e;
    }
  return `1${canon(e.head)}${canon(e.tail)}`;
}

rl.on("line", (input: string) => {
  let expr: Expr = "i";
  for (let i = 0; i < input.length; ++i)
    expr = { head: input.charAt(i) === "1" ? "b" : "u", tail: expr };
  let e: Expr | null = expr;
  while (e !== null) {
    console.log(print(e));
    console.log(canon(e));
    e = reduce(e);
  }
});