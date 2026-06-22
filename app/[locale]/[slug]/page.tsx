import DynamicPage from '@/components/DynamicPage';

export const dynamic = 'force-dynamic';

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <DynamicPage slug={slug} />;
}
