export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Record<string, string | string[]>;
}) {
  return (
    <div>
      <h1>THIS IS A LAYOUT</h1>
      <p>{JSON.stringify(params)}</p>
      <div className="border border-black">{children}</div>
      <p>bottom</p>
    </div>
  );
}
