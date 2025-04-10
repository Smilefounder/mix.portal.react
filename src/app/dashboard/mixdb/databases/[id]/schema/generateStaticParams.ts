// Required for static export with dynamic routes
export function generateStaticParams() {
  // This is a placeholder - in production you'd want to specify actual IDs
  return [
    { id: 'demo-1' },
    { id: 'demo-2' }
  ];
}