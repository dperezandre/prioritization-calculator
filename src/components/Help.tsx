/** Small keyboard- and touch-accessible info tooltip. */
export function Help({ text }: { text: string }) {
  return (
    <span className="help" tabIndex={0} role="img" aria-label={text}>
      i
      <span className="help-pop" role="tooltip">{text}</span>
    </span>
  );
}
