export default function Layout({
  children,
}: {
    children: React.ReactNode;
}) {
  return (
    <div>
      <h1>THIS IS GROUPED LAYOUT</h1>
      <div className="border border-black">{children}</div>
      <p>bottom</p>
    </div>
  );
}
